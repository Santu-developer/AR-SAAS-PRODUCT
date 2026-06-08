package com.armenu.restaurant.service.impl;

import com.armenu.auth.entity.User;
import com.armenu.common.exception.DuplicateResourceException;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.common.exception.UnauthorizedException;
import com.armenu.common.util.SecurityUtils;
import com.armenu.restaurant.dto.request.AddTableRequest;
import com.armenu.restaurant.dto.request.RestaurantRequest;
import com.armenu.restaurant.dto.response.RestaurantDto;
import com.armenu.restaurant.dto.response.RestaurantTableDto;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.entity.RestaurantTable;
import com.armenu.restaurant.mapper.RestaurantMapper;
import com.armenu.restaurant.repository.RestaurantRepository;
import com.armenu.restaurant.repository.RestaurantTableRepository;
import com.armenu.restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantMapper restaurantMapper;

    @Override
    public RestaurantDto getMyRestaurant() {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Restaurant restaurant = restaurantRepository
                .findByTenantIdAndIsDeletedFalse(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found. Please create one first."));
        return restaurantMapper.toDto(restaurant);
    }

    @Override
    @Transactional
    public RestaurantDto createRestaurant(RestaurantRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        UUID tenantId = currentUser.getTenantId();

        if (restaurantRepository.existsByTenantIdAndIsDeletedFalse(tenantId)) {
            throw new DuplicateResourceException("Restaurant already exists for this account");
        }

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .cuisineType(request.getCuisineType())
                .logoUrl(request.getLogoUrl())
                .ownerId(currentUser.getId())
                .build();
        restaurant.setTenantId(tenantId);

        return restaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Override
    @Transactional
    public RestaurantDto updateRestaurant(UUID restaurantId, RestaurantRequest request) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setCuisineType(request.getCuisineType());
        if (request.getLogoUrl() != null) {
            restaurant.setLogoUrl(request.getLogoUrl());
        }

        return restaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Override
    @Transactional
    public RestaurantTableDto addTable(UUID restaurantId, AddTableRequest request) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);

        if (tableRepository.existsByRestaurantIdAndTableNumberAndIsDeletedFalse(
                restaurant.getId(), request.getTableNumber())) {
            throw new DuplicateResourceException(
                    "Table number '" + request.getTableNumber() + "' already exists");
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .restaurantId(restaurant.getId())
                .build();
        table.setTenantId(SecurityUtils.getCurrentTenantId());

        return restaurantMapper.toTableDto(tableRepository.save(table));
    }

    @Override
    public List<RestaurantTableDto> getTables(UUID restaurantId) {
        getOwnedRestaurant(restaurantId); // validate ownership
        return tableRepository
                .findByRestaurantIdAndIsDeletedFalseOrderByTableNumberAsc(restaurantId)
                .stream()
                .map(restaurantMapper::toTableDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTable(UUID restaurantId, UUID tableId) {
        getOwnedRestaurant(restaurantId); // validate ownership
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        table.setIsDeleted(true);
        tableRepository.save(table);
    }

    // Helper: load restaurant and verify it belongs to the current tenant
    private Restaurant getOwnedRestaurant(UUID restaurantId) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        if (!restaurant.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        if (Boolean.TRUE.equals(restaurant.getIsDeleted())) {
            throw new ResourceNotFoundException("Restaurant not found");
        }
        return restaurant;
    }
}
