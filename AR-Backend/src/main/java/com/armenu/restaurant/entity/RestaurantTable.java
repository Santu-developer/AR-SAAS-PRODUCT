package com.armenu.restaurant.entity;

import com.armenu.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable extends BaseEntity {

    @Column(name = "table_number", nullable = false)
    private String tableNumber;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "has_qr", nullable = false)
    @Builder.Default
    private Boolean hasQr = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
