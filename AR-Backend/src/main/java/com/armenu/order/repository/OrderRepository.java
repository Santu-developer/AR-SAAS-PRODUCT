package com.armenu.order.repository;

import com.armenu.order.entity.Order;
import com.armenu.order.entity.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    /** Restaurant admin — get all orders for their restaurant */
    Page<Order> findByRestaurantIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID restaurantId, Pageable pageable);

    /** Filter by status */
    List<Order> findByRestaurantIdAndStatusAndIsDeletedFalseOrderByCreatedAtAsc(
            UUID restaurantId, OrderStatus status);

    /** Customer order history */
    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    /** Active orders for a table */
    List<Order> findByTableIdAndStatusNotAndIsDeletedFalse(UUID tableId, OrderStatus status);

    /** Analytics — total revenue in period */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.tenantId = :tenantId AND o.status = 'COMPLETED' " +
           "AND o.createdAt BETWEEN :start AND :end AND o.isDeleted = false")
    BigDecimal sumRevenueByTenantAndPeriod(UUID tenantId, LocalDateTime start, LocalDateTime end);

    /** Analytics — order count in period */
    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.tenantId = :tenantId AND o.createdAt BETWEEN :start AND :end AND o.isDeleted = false")
    long countOrdersByTenantAndPeriod(UUID tenantId, LocalDateTime start, LocalDateTime end);
}
