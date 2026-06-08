package com.armenu.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
public class PlaceOrderRequest {

    @NotNull(message = "Table ID is required")
    private UUID tableId;

    @NotNull(message = "Restaurant ID is required")
    private UUID restaurantId;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<CartItemRequest> items;

    private String notes;
}
