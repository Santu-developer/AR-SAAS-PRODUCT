package com.armenu.ar.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class ArItemResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String ingredients;
    private String imageUrl;
    private String modelUrl;
    private Boolean hasArModel;
    private String categoryName;
    private UUID restaurantId;
    private String restaurantName;
}
