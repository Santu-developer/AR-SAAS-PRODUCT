package com.armenu.ar.service.impl;

import com.armenu.analytics.entity.ScanEvent;
import com.armenu.analytics.repository.ScanEventRepository;
import com.armenu.ar.dto.ArCategoryDto;
import com.armenu.ar.dto.ArItemResponse;
import com.armenu.ar.dto.ArMenuResponse;
import com.armenu.ar.dto.ScanRequest;
import com.armenu.ar.service.ArService;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.menu.entity.Category;
import com.armenu.menu.entity.MenuItem;
import com.armenu.menu.mapper.MenuMapper;
import com.armenu.menu.repository.CategoryRepository;
import com.armenu.menu.repository.MenuItemRepository;
import com.armenu.qr.entity.QrCode;
import com.armenu.qr.repository.QrCodeRepository;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.entity.RestaurantTable;
import com.armenu.restaurant.repository.RestaurantRepository;
import com.armenu.restaurant.repository.RestaurantTableRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArServiceImpl implements ArService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final QrCodeRepository qrCodeRepository;
    private final ScanEventRepository scanEventRepository;
    private final MenuMapper menuMapper;

    @Override
    @Cacheable(value = "arMenu", key = "'table:' + #tableId")
    public ArMenuResponse getMenuForTable(UUID tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        Restaurant restaurant = restaurantRepository.findById(table.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        UUID tenantId = restaurant.getTenantId();

        // Increment QR scan count (non-critical, ignore failure)
        try {
            qrCodeRepository.findByTableIdAndIsDeletedFalse(tableId)
                    .ifPresent(qr -> {
                        qr.setScanCount(qr.getScanCount() + 1);
                        qrCodeRepository.save(qr);
                    });
        } catch (Exception e) {
            log.warn("Failed to increment scan count: {}", e.getMessage());
        }

        // Fetch all active categories for this tenant
        List<Category> categories = categoryRepository
                .findByTenantIdAndIsDeletedFalseOrderByDisplayOrderAsc(tenantId);

        // Fetch all available menu items (no pagination for public view)
        List<MenuItem> allItems = menuItemRepository
                .findByTenantIdAndIsDeletedFalse(tenantId, PageRequest.of(0, 500))
                .getContent()
                .stream()
                .filter(MenuItem::getIsAvailable)
                .collect(Collectors.toList());

        // Group items by category
        Map<UUID, List<MenuItem>> itemsByCategory = allItems.stream()
                .collect(Collectors.groupingBy(MenuItem::getCategoryId));

        List<ArCategoryDto> categoryDtos = categories.stream()
                .map(cat -> ArCategoryDto.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .items(itemsByCategory.getOrDefault(cat.getId(), List.of())
                                .stream().map(menuMapper::toMenuItemDto).collect(Collectors.toList()))
                        .build())
                .filter(c -> !c.getItems().isEmpty())
                .collect(Collectors.toList());

        return ArMenuResponse.builder()
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .restaurantLogoUrl(restaurant.getLogoUrl())
                .tableNumber(table.getTableNumber())
                .categories(categoryDtos)
                .items(allItems.stream().map(menuMapper::toMenuItemDto).collect(Collectors.toList()))
                .build();
    }

    @Override
    public ArItemResponse getItemDetail(UUID itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (Boolean.TRUE.equals(item.getIsDeleted()) || Boolean.FALSE.equals(item.getIsAvailable())) {
            throw new ResourceNotFoundException("Item not available");
        }

        Restaurant restaurant = restaurantRepository.findById(item.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        Category category = categoryRepository.findById(item.getCategoryId()).orElse(null);

        return ArItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .ingredients(item.getIngredients())
                .imageUrl(item.getImageUrl())
                .modelUrl(item.getModelUrl())
                .hasArModel(item.getHasArModel())
                .categoryName(category != null ? category.getName() : null)
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .build();
    }

    @Override
    @Async
    public void logScan(ScanRequest request, HttpServletRequest httpRequest) {
        try {
            // Resolve tenantId from restaurant
            if (request.getRestaurantId() == null) return;

            Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElse(null);
            if (restaurant == null) return;

            String ipHash = hashIp(getClientIp(httpRequest));
            String userAgent = httpRequest.getHeader("User-Agent");
            if (userAgent != null && userAgent.length() > 512) {
                userAgent = userAgent.substring(0, 512);
            }

            ScanEvent event = ScanEvent.builder()
                    .tenantId(restaurant.getTenantId())
                    .restaurantId(request.getRestaurantId())
                    .tableId(request.getTableId())
                    .itemId(request.getItemId())
                    .userAgent(userAgent)
                    .ipHash(ipHash)
                    .build();

            scanEventRepository.save(event);
        } catch (Exception e) {
            log.warn("Failed to log scan event: {}", e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String hashIp(String ip) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception e) {
            return "unknown";
        }
    }
}
