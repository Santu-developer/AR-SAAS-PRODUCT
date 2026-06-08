package com.armenu.menu.service.impl;

import com.armenu.common.dto.PageResponse;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.common.util.SecurityUtils;
import com.armenu.menu.dto.request.MenuItemRequest;
import com.armenu.menu.dto.response.MenuItemDto;
import com.armenu.menu.entity.MenuItem;
import com.armenu.menu.mapper.MenuMapper;
import com.armenu.menu.repository.CategoryRepository;
import com.armenu.menu.repository.MenuItemRepository;
import com.armenu.menu.service.MenuItemService;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuMapper menuMapper;

    @Override
    public PageResponse<MenuItemDto> getAll(UUID categoryId, int page, int size) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<MenuItem> items = (categoryId != null)
                ? menuItemRepository.findByTenantIdAndCategoryIdAndIsDeletedFalse(tenantId, categoryId, pageable)
                : menuItemRepository.findByTenantIdAndIsDeletedFalse(tenantId, pageable);

        return PageResponse.from(items.map(menuMapper::toMenuItemDto));
    }

    @Override
    public MenuItemDto getById(UUID id) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        MenuItem item = menuItemRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        return menuMapper.toMenuItemDto(item);
    }

    @Override
    @Transactional
    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemDto create(MenuItemRequest request) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();

        // Validate category belongs to tenant
        categoryRepository.findByIdAndTenantIdAndIsDeletedFalse(request.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Restaurant restaurant = restaurantRepository
                .findByTenantIdAndIsDeletedFalse(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Create your restaurant profile first"));

        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .ingredients(request.getIngredients())
                .imageUrl(request.getImageUrl())
                .modelUrl(request.getModelUrl())
                .hasArModel(request.getModelUrl() != null && !request.getModelUrl().isBlank())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .categoryId(request.getCategoryId())
                .restaurantId(restaurant.getId())
                .build();
        item.setTenantId(tenantId);

        return menuMapper.toMenuItemDto(menuItemRepository.save(item));
    }

    @Override
    @Transactional
    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemDto update(UUID id, MenuItemRequest request) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        MenuItem item = menuItemRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        // Validate new category belongs to tenant
        categoryRepository.findByIdAndTenantIdAndIsDeletedFalse(request.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setIngredients(request.getIngredients());
        item.setCategoryId(request.getCategoryId());
        if (request.getIsAvailable() != null) item.setIsAvailable(request.getIsAvailable());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getModelUrl() != null) {
            item.setModelUrl(request.getModelUrl());
            item.setHasArModel(!request.getModelUrl().isBlank());
        }

        return menuMapper.toMenuItemDto(menuItemRepository.save(item));
    }

    @Override
    @Transactional
    @CacheEvict(value = "menuItems", allEntries = true)
    public void delete(UUID id) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        MenuItem item = menuItemRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        item.setIsDeleted(true);
        menuItemRepository.save(item);
    }

    @Override
    @Transactional
    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemDto toggleAvailability(UUID id) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        MenuItem item = menuItemRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        item.setIsAvailable(!item.getIsAvailable());
        return menuMapper.toMenuItemDto(menuItemRepository.save(item));
    }
}
