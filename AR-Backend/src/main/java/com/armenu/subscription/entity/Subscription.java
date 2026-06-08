package com.armenu.subscription.entity;

import com.armenu.common.entity.BaseEntity;
import com.armenu.common.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    /** Razorpay customer ID — stored in existing stripe_customer_id column for DB compatibility */
    @Column(name = "stripe_customer_id")
    private String razorpayCustomerId;

    /** Razorpay subscription ID — stored in existing stripe_subscription_id column for DB compatibility */
    @Column(name = "stripe_subscription_id")
    private String razorpaySubscriptionId;

    /** Razorpay order ID / payment ID — stored in existing stripe_session_id column for DB compatibility */
    @Column(name = "stripe_session_id")
    private String razorpayOrderId;

    @Column(name = "current_period_start")
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    public enum SubscriptionStatus {
        ACTIVE, CANCELLED, PAST_DUE, TRIALING, EXPIRED
    }
}
