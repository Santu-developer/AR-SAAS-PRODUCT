package com.armenu.order.entity;

import com.armenu.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "table_id", nullable = false)
    private UUID tableId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private OrderStatus status = OrderStatus.PLACED;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderStatus {
        /** Customer placed the order */
        PLACED,
        /** Restaurant accepted the order */
        ACCEPTED,
        /** Kitchen is preparing */
        PREPARING,
        /** Food is ready at counter */
        READY,
        /** Delivered to table */
        SERVED,
        /** Fully done and closed */
        COMPLETED,
        /** Cancelled before preparation */
        CANCELLED
    }
}
