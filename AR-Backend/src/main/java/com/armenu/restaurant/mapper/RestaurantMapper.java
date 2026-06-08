package com.armenu.restaurant.mapper;

import com.armenu.restaurant.dto.response.RestaurantDto;
import com.armenu.restaurant.dto.response.RestaurantTableDto;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.entity.RestaurantTable;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    RestaurantDto toDto(Restaurant restaurant);

    RestaurantTableDto toTableDto(RestaurantTable table);
}
