package com.armenu.restaurant.service;

import com.armenu.restaurant.dto.request.AddTableRequest;
import com.armenu.restaurant.dto.request.RestaurantRequest;
import com.armenu.restaurant.dto.response.RestaurantDto;
import com.armenu.restaurant.dto.response.RestaurantTableDto;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {

    RestaurantDto getMyRestaurant();

    RestaurantDto createRestaurant(RestaurantRequest request);

    RestaurantDto updateRestaurant(UUID restaurantId, RestaurantRequest request);

    RestaurantTableDto addTable(UUID restaurantId, AddTableRequest request);

    List<RestaurantTableDto> getTables(UUID restaurantId);

    void deleteTable(UUID restaurantId, UUID tableId);
}
