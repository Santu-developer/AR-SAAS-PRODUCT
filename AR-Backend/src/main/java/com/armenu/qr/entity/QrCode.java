package com.armenu.qr.entity;

import com.armenu.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "qr_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrCode extends BaseEntity {

    @Column(name = "table_id", nullable = false, unique = true)
    private UUID tableId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "qr_image_url")
    private String qrImageUrl;

    @Column(name = "qr_url", nullable = false, columnDefinition = "TEXT")
    private String qrUrl;

    @Column(name = "scan_count", nullable = false)
    @Builder.Default
    private Long scanCount = 0L;
}
