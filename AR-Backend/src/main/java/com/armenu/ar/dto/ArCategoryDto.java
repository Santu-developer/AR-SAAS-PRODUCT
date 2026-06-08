package com.armenu.ar.dto;

import com.armenu.menu.dto.response.MenuItemDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ArCategoryDto {
    private UUID id;
    private String name;
    private List<MenuItemDto> items;
}
