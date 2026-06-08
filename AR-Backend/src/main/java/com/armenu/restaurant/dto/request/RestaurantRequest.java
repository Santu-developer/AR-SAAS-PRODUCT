package com.armenu.restaurant.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;

    private String address;

    private String phone;

    private String cuisineType;

    private String logoUrl;
}
