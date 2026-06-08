package com.armenu.menu.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.common.dto.PageResponse;
import com.armenu.menu.dto.request.MenuItemRequest;
import com.armenu.menu.dto.response.MenuItemDto;
import com.armenu.menu.service.MenuItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Items", description = "Menu item management APIs")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    @Operation(summary = "List menu items (paginated, optional category filter)")
    public ResponseEntity<ApiResponse<PageResponse<MenuItemDto>>> getAll(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Menu items fetched",
                menuItemService.getAll(categoryId, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get menu item by ID")
    public ResponseEntity<ApiResponse<MenuItemDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Menu item fetched", menuItemService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create menu item")
    public ResponseEntity<ApiResponse<MenuItemDto>> create(@Valid @RequestBody MenuItemRequest request) {
        MenuItemDto dto = menuItemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item created", dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update menu item")
    public ResponseEntity<ApiResponse<MenuItemDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Menu item updated", menuItemService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete menu item (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        menuItemService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted"));
    }

    @PatchMapping("/{id}/toggle-availability")
    @Operation(summary = "Toggle item availability")
    public ResponseEntity<ApiResponse<MenuItemDto>> toggleAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Availability toggled",
                menuItemService.toggleAvailability(id)));
    }
}
