package com.armenu.plan.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class PlanDto {
    private UUID id;
    private String name;
    private String displayName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxRestaurants;
    private Integer maxMenuItems;
    private Boolean analyticsEnabled;
    private String razorpayPlanId;
    private String description;
    private Boolean isActive;
}
