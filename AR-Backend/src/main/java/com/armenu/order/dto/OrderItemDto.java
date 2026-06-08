package com.armenu.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderItemDto {
    private UUID id;
    private UUID menuItemId;
    private String itemName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private String notes;
}
