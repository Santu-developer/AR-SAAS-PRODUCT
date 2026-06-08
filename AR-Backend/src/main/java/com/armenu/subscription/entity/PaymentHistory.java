package com.armenu.subscription.entity;

import com.armenu.common.entity.BaseEntity;
import com.armenu.common.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentHistory extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /** Razorpay payment ID — stored in existing stripe_payment_intent_id column for DB compatibility */
    @Column(name = "stripe_payment_intent_id")
    private String razorpayPaymentId;

    /** Razorpay order ID — stored in existing stripe_invoice_id column for DB compatibility */
    @Column(name = "stripe_invoice_id")
    private String razorpayOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
