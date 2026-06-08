package com.armenu.plan.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A Plan defines a subscription tier that can be assigned to a restaurant.
 * Plans are created and managed by SUPER_ADMIN only.
 * Note: Plan is NOT a multi-tenant entity — it doesn't extend BaseEntity.
 */
@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;   // e.g. 30, 365

    @Column(name = "max_restaurants", nullable = false)
    @Builder.Default
    private Integer maxRestaurants = 1;

    @Column(name = "max_menu_items", nullable = false)
    @Builder.Default
    private Integer maxMenuItems = 50;

    @Column(name = "analytics_enabled", nullable = false)
    @Builder.Default
    private Boolean analyticsEnabled = false;

    @Column(name = "razorpay_plan_id", length = 100)
    private String razorpayPlanId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
