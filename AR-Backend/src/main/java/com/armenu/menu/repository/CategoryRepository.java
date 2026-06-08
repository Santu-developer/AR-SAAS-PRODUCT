package com.armenu.menu.repository;

import com.armenu.menu.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByTenantIdAndIsDeletedFalseOrderByDisplayOrderAsc(UUID tenantId);

    Optional<Category> findByIdAndTenantIdAndIsDeletedFalse(UUID id, UUID tenantId);

    boolean existsByNameAndTenantIdAndIsDeletedFalse(String name, UUID tenantId);
}
