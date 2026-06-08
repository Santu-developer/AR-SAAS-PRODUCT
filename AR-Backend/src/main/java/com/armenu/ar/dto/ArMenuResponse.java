package com.armenu.ar.dto;

import com.armenu.menu.dto.response.MenuItemDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ArMenuResponse {
    private UUID restaurantId;
    private String restaurantName;
    private String restaurantLogoUrl;
    private String tableNumber;
    private List<ArCategoryDto> categories;
    private List<MenuItemDto> items;
}
