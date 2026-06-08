package com.armenu.qr.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class QrCodeDto {
    private UUID id;
    private UUID tableId;
    private String tableNumber;
    private UUID restaurantId;
    private String qrImageUrl;
    private String qrUrl;
    private Long scanCount;
}
