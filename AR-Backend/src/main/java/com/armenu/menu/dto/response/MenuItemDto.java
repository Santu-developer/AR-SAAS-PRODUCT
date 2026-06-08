package com.armenu.menu.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MenuItemDto {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String ingredients;
    private String imageUrl;
    private String modelUrl;
    private Boolean hasArModel;
    private Boolean isAvailable;
    private UUID categoryId;
    private UUID restaurantId;
    private UUID tenantId;
    private LocalDateTime createdAt;
}
