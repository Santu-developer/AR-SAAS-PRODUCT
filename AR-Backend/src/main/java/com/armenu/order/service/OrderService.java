package com.armenu.order.service;

import com.armenu.common.dto.PageResponse;
import com.armenu.order.dto.OrderDto;
import com.armenu.order.dto.PlaceOrderRequest;
import com.armenu.order.dto.UpdateOrderStatusRequest;
import com.armenu.order.entity.Order.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    /** Customer places a new order after OTP login */
    OrderDto placeOrder(UUID customerId, PlaceOrderRequest request);

    /** Restaurant admin — get paginated orders */
    PageResponse<OrderDto> getRestaurantOrders(int page, int size);

    /** Restaurant admin — filter by status */
    List<OrderDto> getOrdersByStatus(OrderStatus status);

    /** Single order detail */
    OrderDto getOrderById(UUID orderId);

    /** Restaurant admin — update status (ACCEPTED → PREPARING → READY → SERVED → COMPLETED) */
    OrderDto updateStatus(UUID orderId, UpdateOrderStatusRequest request);

    /** Customer — view own order history */
    List<OrderDto> getCustomerOrders(UUID customerId);
}
