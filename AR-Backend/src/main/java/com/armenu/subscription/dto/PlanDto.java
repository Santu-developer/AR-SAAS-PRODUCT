package com.armenu.subscription.dto;

import com.armenu.common.enums.SubscriptionPlan;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PlanDto {
    private SubscriptionPlan plan;
    private String displayName;
    private BigDecimal priceMonthly;
    private String currency;
    private int maxRestaurants;
    private int maxMenuItems;
    private boolean analyticsEnabled;
    private String razorpayPlanId;
    private String description;
}
