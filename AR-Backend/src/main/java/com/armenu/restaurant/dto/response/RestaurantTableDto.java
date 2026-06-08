package com.armenu.restaurant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class RestaurantTableDto {
    private UUID id;
    private String tableNumber;
    private UUID restaurantId;
    private Boolean hasQr;
    private Boolean isActive;
}
