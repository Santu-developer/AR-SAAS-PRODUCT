package com.armenu.menu.service.impl;

import com.armenu.common.exception.DuplicateResourceException;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.common.util.SecurityUtils;
import com.armenu.menu.dto.request.CategoryRequest;
import com.armenu.menu.dto.response.CategoryDto;
import com.armenu.menu.entity.Category;
import com.armenu.menu.mapper.MenuMapper;
import com.armenu.menu.repository.CategoryRepository;
import com.armenu.menu.service.CategoryService;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuMapper menuMapper;

    @Override
    public List<CategoryDto> getAll() {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        return categoryRepository
                .findByTenantIdAndIsDeletedFalseOrderByDisplayOrderAsc(tenantId)
                .stream()
                .map(menuMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDto create(CategoryRequest request) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();

        if (categoryRepository.existsByNameAndTenantIdAndIsDeletedFalse(request.getName(), tenantId)) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists");
        }

        Restaurant restaurant = restaurantRepository
                .findByTenantIdAndIsDeletedFalse(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Create your restaurant profile first"));

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .restaurantId(restaurant.getId())
                .build();
        category.setTenantId(tenantId);

        return menuMapper.toCategoryDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryDto update(UUID id, CategoryRequest request) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Category category = categoryRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());

        return menuMapper.toCategoryDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Category category = categoryRepository
                .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setIsDeleted(true);
        categoryRepository.save(category);
    }
}
