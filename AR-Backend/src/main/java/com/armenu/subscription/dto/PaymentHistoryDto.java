package com.armenu.subscription.dto;

import com.armenu.common.enums.SubscriptionPlan;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PaymentHistoryDto {
    private UUID id;
    private SubscriptionPlan plan;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String razorpayOrderId;
    private LocalDateTime paidAt;
}
