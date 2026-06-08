package com.armenu.qr.repository;

import com.armenu.qr.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QrCodeRepository extends JpaRepository<QrCode, UUID> {

    Optional<QrCode> findByTableIdAndIsDeletedFalse(UUID tableId);

    List<QrCode> findByRestaurantIdAndTenantIdAndIsDeletedFalse(UUID restaurantId, UUID tenantId);
}
