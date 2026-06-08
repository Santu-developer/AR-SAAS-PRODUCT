package com.armenu.restaurant.repository;

import com.armenu.restaurant.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    Optional<Restaurant> findByTenantIdAndIsDeletedFalse(UUID tenantId);

    boolean existsByTenantIdAndIsDeletedFalse(UUID tenantId);
}
