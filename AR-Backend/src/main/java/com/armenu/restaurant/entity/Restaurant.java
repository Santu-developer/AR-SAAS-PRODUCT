package com.armenu.restaurant.entity;

import com.armenu.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "cuisine_type", length = 100)
    private String cuisineType;

    @Column(name = "logo_url")
    private String logoUrl;

    // The user (owner) ID who owns this restaurant
    @Column(name = "owner_id", nullable = false)
    private java.util.UUID ownerId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
