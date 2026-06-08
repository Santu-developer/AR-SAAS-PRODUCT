package com.armenu.analytics.repository;

import com.armenu.analytics.entity.ScanEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ScanEventRepository extends JpaRepository<ScanEvent, UUID> {

    long countByTenantIdAndScannedAtAfter(UUID tenantId, LocalDateTime since);

    List<ScanEvent> findByTenantIdAndScannedAtBetweenOrderByScannedAtDesc(
            UUID tenantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s.itemId, COUNT(s) as cnt FROM ScanEvent s " +
            "WHERE s.tenantId = :tenantId AND s.itemId IS NOT NULL " +
            "GROUP BY s.itemId ORDER BY cnt DESC")
    List<Object[]> findTopItemsByTenantId(UUID tenantId);

    @Query("SELECT COUNT(DISTINCT s.tableId) FROM ScanEvent s " +
            "WHERE s.tenantId = :tenantId AND s.scannedAt >= :since")
    long countUniqueTablesByTenantIdAndScannedAtAfter(UUID tenantId, LocalDateTime since);

    List<ScanEvent> findByTenantIdAndScannedAtAfterOrderByScannedAtDesc(UUID tenantId, LocalDateTime since);
}
