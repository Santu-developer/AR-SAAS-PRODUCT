package com.armenu.menu.service;

import com.armenu.common.dto.PageResponse;
import com.armenu.menu.dto.request.MenuItemRequest;
import com.armenu.menu.dto.response.MenuItemDto;

import java.util.UUID;

public interface MenuItemService {

    PageResponse<MenuItemDto> getAll(UUID categoryId, int page, int size);

    MenuItemDto getById(UUID id);

    MenuItemDto create(MenuItemRequest request);

    MenuItemDto update(UUID id, MenuItemRequest request);

    void delete(UUID id);

    MenuItemDto toggleAvailability(UUID id);
}
