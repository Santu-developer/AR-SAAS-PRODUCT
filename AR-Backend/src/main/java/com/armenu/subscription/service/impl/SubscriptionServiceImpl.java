package com.armenu.subscription.service.impl;

import com.armenu.auth.entity.User;
import com.armenu.auth.repository.UserRepository;
import com.armenu.common.enums.SubscriptionPlan;
import com.armenu.common.util.SecurityUtils;
import com.armenu.email.service.EmailService;
import com.armenu.subscription.dto.CheckoutSessionDto;
import com.armenu.subscription.dto.PaymentHistoryDto;
import com.armenu.subscription.dto.PlanDto;
import com.armenu.subscription.dto.SubscriptionDto;
import com.armenu.subscription.entity.PaymentHistory;
import com.armenu.subscription.entity.Subscription;
import com.armenu.subscription.entity.Subscription.SubscriptionStatus;
import com.armenu.subscription.repository.PaymentHistoryRepository;
import com.armenu.subscription.repository.SubscriptionRepository;
import com.armenu.subscription.service.SubscriptionService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.plan.starter}")
    private String starterPlanId;

    @Value("${razorpay.plan.growth}")
    private String growthPlanId;

    @Value("${razorpay.plan.enterprise}")
    private String enterprisePlanId;

    // ---- Public API ----

    @Override
    public SubscriptionDto getCurrentSubscription() {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Subscription sub = subscriptionRepository
                .findByTenantIdAndIsDeletedFalse(tenantId)
                .orElse(buildTrialSubscription());
        return toDto(sub);
    }

    @Override
    public List<PlanDto> getPlans() {
        return List.of(
                PlanDto.builder()
                        .plan(SubscriptionPlan.TRIAL)
                        .displayName("Free Trial")
                        .priceMonthly(BigDecimal.ZERO)
                        .currency("INR")
                        .maxRestaurants(1)
                        .maxMenuItems(20)
                        .analyticsEnabled(false)
                        .description("14-day free trial. 1 restaurant, 20 items.")
                        .build(),
                PlanDto.builder()
                        .plan(SubscriptionPlan.STARTER)
                        .displayName("Starter")
                        .priceMonthly(new BigDecimal("999"))
                        .currency("INR")
                        .maxRestaurants(1)
                        .maxMenuItems(50)
                        .analyticsEnabled(false)
                        .razorpayPlanId(starterPlanId)
                        .description("1 restaurant, 50 items. Perfect for small restaurants.")
                        .build(),
                PlanDto.builder()
                        .plan(SubscriptionPlan.GROWTH)
                        .displayName("Growth")
                        .priceMonthly(new BigDecimal("2999"))
                        .currency("INR")
                        .maxRestaurants(3)
                        .maxMenuItems(Integer.MAX_VALUE)
                        .analyticsEnabled(true)
                        .razorpayPlanId(growthPlanId)
                        .description("3 restaurants, unlimited items + analytics.")
                        .build(),
                PlanDto.builder()
                        .plan(SubscriptionPlan.ENTERPRISE)
                        .displayName("Enterprise")
                        .priceMonthly(BigDecimal.ZERO)
                        .currency("INR")
                        .maxRestaurants(Integer.MAX_VALUE)
                        .maxMenuItems(Integer.MAX_VALUE)
                        .analyticsEnabled(true)
                        .razorpayPlanId(enterprisePlanId)
                        .description("Unlimited everything. White label. Custom pricing.")
                        .build()
        );
    }

    /**
     * Creates a Razorpay order. The frontend uses the returned orderId + keyId
     * to open the Razorpay checkout modal. After the user pays, the frontend
     * submits razorpay_order_id, razorpay_payment_id, razorpay_signature to
     * POST /api/v1/subscriptions/verify-payment for server-side verification,
     * OR the webhook (payment.captured) will activate it automatically.
     */
    @Override
    @Transactional
    public CheckoutSessionDto createCheckoutSession(SubscriptionPlan plan) {
        User currentUser = SecurityUtils.getCurrentUser();
        long amountPaise = getPlanAmountInPaise(plan);

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + UUID.randomUUID());
            orderRequest.put("payment_capture", 1); // auto-capture

            JSONObject notes = new JSONObject();
            notes.put("tenantId", currentUser.getTenantId().toString());
            notes.put("userId", currentUser.getId().toString());
            notes.put("plan", plan.name());
            orderRequest.put("notes", notes);

            Order order = client.orders.create(orderRequest);
            String orderId = order.get("id");

            // Persist order ID so the webhook can look up the subscription
            UUID tenantId = currentUser.getTenantId();
            Subscription sub = subscriptionRepository
                    .findByTenantIdAndIsDeletedFalse(tenantId)
                    .orElse(Subscription.builder()
                            .userId(currentUser.getId())
                            .plan(plan)
                            .status(SubscriptionStatus.TRIALING)
                            .build());
            sub.setTenantId(tenantId);
            sub.setRazorpayOrderId(orderId);
            subscriptionRepository.save(sub);

            return CheckoutSessionDto.builder()
                    .orderId(orderId)
                    .keyId(razorpayKeyId)
                    .amount(amountPaise)
                    .currency("INR")
                    .planName(plan.name())
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    // ---- Webhook handlers ----

    /**
     * Called on payment.captured webhook event.
     * Activates the subscription and records payment history.
     */
    @Override
    @Transactional
    public void handlePaymentCaptured(String razorpayOrderId, String razorpayPaymentId,
                                       String razorpaySubscriptionId) {
        subscriptionRepository.findByRazorpayOrderId(razorpayOrderId)
                .ifPresentOrElse(sub -> {
                    sub.setStatus(SubscriptionStatus.ACTIVE);
                    if (razorpaySubscriptionId != null) {
                        sub.setRazorpaySubscriptionId(razorpaySubscriptionId);
                    }
                    sub.setCurrentPeriodStart(LocalDateTime.now());
                    sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
                    subscriptionRepository.save(sub);

                    // Save payment record
                    PaymentHistory payment = PaymentHistory.builder()
                            .userId(sub.getUserId())
                            .plan(sub.getPlan())
                            .razorpayPaymentId(razorpayPaymentId)
                            .razorpayOrderId(razorpayOrderId)
                            .amount(getPlanAmountInRupees(sub.getPlan()))
                            .currency("INR")
                            .status("captured")
                            .paidAt(LocalDateTime.now())
                            .build();
                    payment.setTenantId(sub.getTenantId());
                    paymentHistoryRepository.save(payment);

                    log.info("Payment captured — orderId={} paymentId={} plan={}",
                            razorpayOrderId, razorpayPaymentId, sub.getPlan());

                    // Send confirmation email
                    userRepository.findById(sub.getUserId()).ifPresent(user ->
                            emailService.sendSubscriptionConfirmationEmail(
                                    user.getEmail(), user.getName(), sub.getPlan().name()));

                }, () -> log.warn("No subscription found for razorpayOrderId={}", razorpayOrderId));
    }

    @Override
    @Transactional
    public void handleSubscriptionUpdated(String razorpaySubscriptionId, String status) {
        subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId)
                .ifPresent(sub -> {
                    sub.setStatus(mapRazorpayStatus(status));
                    subscriptionRepository.save(sub);
                    log.info("Subscription {} status updated to {}", razorpaySubscriptionId, status);
                });
    }

    @Override
    @Transactional
    public void handleSubscriptionCancelled(String razorpaySubscriptionId) {
        subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId)
                .ifPresent(sub -> {
                    sub.setStatus(SubscriptionStatus.CANCELLED);
                    sub.setPlan(SubscriptionPlan.TRIAL);
                    subscriptionRepository.save(sub);
                    log.info("Subscription {} cancelled", razorpaySubscriptionId);
                });
    }

    @Override
    public List<PaymentHistoryDto> getPaymentHistory() {
        User currentUser = SecurityUtils.getCurrentUser();
        return paymentHistoryRepository
                .findByUserIdAndIsDeletedFalseOrderByPaidAtDesc(currentUser.getId())
                .stream()
                .map(p -> PaymentHistoryDto.builder()
                        .id(p.getId())
                        .plan(p.getPlan())
                        .amount(p.getAmount())
                        .currency(p.getCurrency())
                        .status(p.getStatus())
                        .razorpayOrderId(p.getRazorpayOrderId())
                        .paidAt(p.getPaidAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ---- Helpers ----

    private long getPlanAmountInPaise(SubscriptionPlan plan) {
        return switch (plan) {
            case STARTER -> 99900L;    // ₹999
            case GROWTH -> 299900L;    // ₹2999
            case ENTERPRISE -> 0L;     // custom — should not reach here via normal flow
            default -> throw new IllegalArgumentException("Cannot purchase " + plan + " plan");
        };
    }

    private BigDecimal getPlanAmountInRupees(SubscriptionPlan plan) {
        return switch (plan) {
            case STARTER -> new BigDecimal("999");
            case GROWTH -> new BigDecimal("2999");
            case ENTERPRISE -> BigDecimal.ZERO;
            default -> BigDecimal.ZERO;
        };
    }

    private SubscriptionStatus mapRazorpayStatus(String razorpayStatus) {
        return switch (razorpayStatus) {
            case "active", "authenticated" -> SubscriptionStatus.ACTIVE;
            case "pending" -> SubscriptionStatus.PAST_DUE;
            case "cancelled", "expired" -> SubscriptionStatus.CANCELLED;
            case "created", "halted" -> SubscriptionStatus.TRIALING;
            default -> SubscriptionStatus.EXPIRED;
        };
    }

    private Subscription buildTrialSubscription() {
        return Subscription.builder()
                .plan(SubscriptionPlan.TRIAL)
                .status(SubscriptionStatus.TRIALING)
                .build();
    }

    private SubscriptionDto toDto(Subscription sub) {
        int maxRestaurants = switch (sub.getPlan()) {
            case TRIAL, STARTER -> 1;
            case GROWTH -> 3;
            case ENTERPRISE -> Integer.MAX_VALUE;
        };
        int maxMenuItems = switch (sub.getPlan()) {
            case TRIAL -> 20;
            case STARTER -> 50;
            case GROWTH, ENTERPRISE -> Integer.MAX_VALUE;
        };
        boolean analytics = sub.getPlan() == SubscriptionPlan.GROWTH
                || sub.getPlan() == SubscriptionPlan.ENTERPRISE;

        return SubscriptionDto.builder()
                .id(sub.getId())
                .plan(sub.getPlan())
                .status(sub.getStatus())
                .currentPeriodStart(sub.getCurrentPeriodStart())
                .currentPeriodEnd(sub.getCurrentPeriodEnd())
                .maxRestaurants(maxRestaurants)
                .maxMenuItems(maxMenuItems)
                .analyticsEnabled(analytics)
                .build();
    }
}
