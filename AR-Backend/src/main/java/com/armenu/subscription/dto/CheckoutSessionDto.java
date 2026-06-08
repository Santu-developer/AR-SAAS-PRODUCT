package com.armenu.subscription.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckoutSessionDto {
    /** Razorpay order ID — used by the frontend to open the Razorpay checkout modal */
    private String orderId;
    /** Razorpay Key ID — safe to expose to the frontend */
    private String keyId;
    /** Amount in smallest currency unit (paise for INR) */
    private long amount;
    private String currency;
    private String planName;
}
