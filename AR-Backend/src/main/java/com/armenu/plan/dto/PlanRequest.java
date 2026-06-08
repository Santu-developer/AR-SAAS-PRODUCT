package com.armenu.plan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PlanRequest {

    @NotBlank(message = "Plan name is required")
    private String name;

    @NotBlank(message = "Display name is required")
    private String displayName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer durationDays;

    @Min(value = 1)
    private Integer maxRestaurants = 1;

    private Integer maxMenuItems = 50;

    private Boolean analyticsEnabled = false;

    private String razorpayPlanId;

    private String description;
}
