package com.armenu.menu.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CategoryDto {
    private UUID id;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private UUID restaurantId;
    private UUID tenantId;
}
