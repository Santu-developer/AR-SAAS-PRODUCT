package com.armenu.menu.mapper;

import com.armenu.menu.dto.response.CategoryDto;
import com.armenu.menu.dto.response.MenuItemDto;
import com.armenu.menu.entity.Category;
import com.armenu.menu.entity.MenuItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuMapper {

    CategoryDto toCategoryDto(Category category);

    MenuItemDto toMenuItemDto(MenuItem menuItem);
}
