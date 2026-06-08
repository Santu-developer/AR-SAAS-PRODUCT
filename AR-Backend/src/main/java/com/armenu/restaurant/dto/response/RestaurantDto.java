package com.armenu.restaurant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class RestaurantDto {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String cuisineType;
    private String logoUrl;
    private UUID tenantId;
    private UUID ownerId;
    private LocalDateTime createdAt;
}
