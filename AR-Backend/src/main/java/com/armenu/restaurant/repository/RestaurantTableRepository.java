package com.armenu.restaurant.repository;

import com.armenu.restaurant.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, UUID> {

    List<RestaurantTable> findByRestaurantIdAndIsDeletedFalseOrderByTableNumberAsc(UUID restaurantId);

    boolean existsByRestaurantIdAndTableNumberAndIsDeletedFalse(UUID restaurantId, String tableNumber);
}
