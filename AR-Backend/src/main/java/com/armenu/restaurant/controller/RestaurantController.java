package com.armenu.restaurant.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.restaurant.dto.request.AddTableRequest;
import com.armenu.restaurant.dto.request.RestaurantRequest;
import com.armenu.restaurant.dto.response.RestaurantDto;
import com.armenu.restaurant.dto.response.RestaurantTableDto;
import com.armenu.restaurant.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurant", description = "Restaurant management APIs")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping("/my")
    @Operation(summary = "Get current tenant's restaurant")
    public ResponseEntity<ApiResponse<RestaurantDto>> getMyRestaurant() {
        return ResponseEntity.ok(ApiResponse.success("Restaurant fetched", restaurantService.getMyRestaurant()));
    }

    @PostMapping
    @Operation(summary = "Create restaurant profile")
    public ResponseEntity<ApiResponse<RestaurantDto>> create(
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantDto dto = restaurantService.createRestaurant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created", dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update restaurant profile")
    public ResponseEntity<ApiResponse<RestaurantDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated", restaurantService.updateRestaurant(id, request)));
    }

    @PostMapping("/{id}/tables")
    @Operation(summary = "Add a table to restaurant")
    public ResponseEntity<ApiResponse<RestaurantTableDto>> addTable(
            @PathVariable UUID id,
            @Valid @RequestBody AddTableRequest request) {
        RestaurantTableDto table = restaurantService.addTable(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Table added", table));
    }

    @GetMapping("/{id}/tables")
    @Operation(summary = "Get all tables for a restaurant")
    public ResponseEntity<ApiResponse<List<RestaurantTableDto>>> getTables(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Tables fetched", restaurantService.getTables(id)));
    }

    @DeleteMapping("/{id}/tables/{tableId}")
    @Operation(summary = "Delete a table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(
            @PathVariable UUID id,
            @PathVariable UUID tableId) {
        restaurantService.deleteTable(id, tableId);
        return ResponseEntity.ok(ApiResponse.success("Table deleted"));
    }
}
