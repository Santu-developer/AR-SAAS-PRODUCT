package com.armenu.order.dto;

import com.armenu.order.entity.Order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderDto {
    private UUID id;
    private UUID customerId;
    private UUID restaurantId;
    private UUID tableId;
    private String tableNumber;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String notes;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
