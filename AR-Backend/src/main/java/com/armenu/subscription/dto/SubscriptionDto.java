package com.armenu.subscription.dto;

import com.armenu.common.enums.SubscriptionPlan;
import com.armenu.subscription.entity.Subscription.SubscriptionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class SubscriptionDto {
    private UUID id;
    private SubscriptionPlan plan;
    private SubscriptionStatus status;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private int maxRestaurants;
    private int maxMenuItems;
    private boolean analyticsEnabled;
}
