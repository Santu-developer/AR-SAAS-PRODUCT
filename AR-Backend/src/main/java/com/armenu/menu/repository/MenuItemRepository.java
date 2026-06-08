package com.armenu.menu.repository;

import com.armenu.menu.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    Page<MenuItem> findByTenantIdAndIsDeletedFalse(UUID tenantId, Pageable pageable);

    Page<MenuItem> findByTenantIdAndCategoryIdAndIsDeletedFalse(UUID tenantId, UUID categoryId, Pageable pageable);

    Optional<MenuItem> findByIdAndTenantIdAndIsDeletedFalse(UUID id, UUID tenantId);
}
