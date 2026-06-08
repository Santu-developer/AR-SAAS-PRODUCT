package com.armenu.subscription.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.common.enums.SubscriptionPlan;
import com.armenu.subscription.dto.CheckoutSessionDto;
import com.armenu.subscription.dto.PaymentHistoryDto;
import com.armenu.subscription.dto.PlanDto;
import com.armenu.subscription.dto.SubscriptionDto;
import com.armenu.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Subscription and billing management APIs")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/current")
    @Operation(summary = "Get current subscription for logged-in tenant")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getCurrent() {
        return ResponseEntity.ok(ApiResponse.success("Subscription fetched",
                subscriptionService.getCurrentSubscription()));
    }

    @GetMapping("/plans")
    @Operation(summary = "Get all available plans with pricing")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.success("Plans fetched",
                subscriptionService.getPlans()));
    }

    @PostMapping("/create-session")
    @Operation(summary = "Create Razorpay order for plan upgrade — use returned orderId + keyId to open checkout modal")
    public ResponseEntity<ApiResponse<CheckoutSessionDto>> createCheckoutSession(
            @RequestParam SubscriptionPlan plan) {
        return ResponseEntity.ok(ApiResponse.success("Checkout session created",
                subscriptionService.createCheckoutSession(plan)));
    }

    @GetMapping("/payments/history")
    @Operation(summary = "Get payment history for current user")
    public ResponseEntity<ApiResponse<List<PaymentHistoryDto>>> getPaymentHistory() {
        return ResponseEntity.ok(ApiResponse.success("Payment history fetched",
                subscriptionService.getPaymentHistory()));
    }
}
