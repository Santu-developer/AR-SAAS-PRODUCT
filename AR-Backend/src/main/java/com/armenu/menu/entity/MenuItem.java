package com.armenu.menu.entity;

import com.armenu.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "model_url")
    private String modelUrl;

    @Column(name = "has_ar_model", nullable = false)
    @Builder.Default
    private Boolean hasArModel = false;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private MenuItemStatus status = MenuItemStatus.ACTIVE;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    public enum MenuItemStatus {
        /** Fully live — visible to customers */
        ACTIVE,
        /** Uploaded by restaurant, waiting for admin to create 3D model */
        PENDING_3D_MODEL,
        /** Disabled by admin or restaurant admin */
        DISABLED
    }
}
