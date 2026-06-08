package com.armenu.subscription.service;

import com.armenu.common.enums.SubscriptionPlan;
import com.armenu.subscription.dto.CheckoutSessionDto;
import com.armenu.subscription.dto.PaymentHistoryDto;
import com.armenu.subscription.dto.PlanDto;
import com.armenu.subscription.dto.SubscriptionDto;

import java.util.List;

public interface SubscriptionService {

    SubscriptionDto getCurrentSubscription();

    List<PlanDto> getPlans();

    /** Creates a Razorpay order and returns the details needed by the frontend checkout. */
    CheckoutSessionDto createCheckoutSession(SubscriptionPlan plan);

    List<PaymentHistoryDto> getPaymentHistory();

    // ---- Called by Razorpay webhook ----

    /** Called when payment.captured event fires — activates the subscription. */
    void handlePaymentCaptured(String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySubscriptionId);

    /** Called when subscription.activated or subscription.charged fires. */
    void handleSubscriptionUpdated(String razorpaySubscriptionId, String status);

    /** Called when subscription.cancelled fires. */
    void handleSubscriptionCancelled(String razorpaySubscriptionId);
}
