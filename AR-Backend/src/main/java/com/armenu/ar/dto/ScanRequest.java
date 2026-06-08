package com.armenu.ar.dto;

import lombok.Getter;

import java.util.UUID;

@Getter
public class ScanRequest {
    private UUID tableId;
    private UUID itemId;      // optional — null for page-load scan, set for item views
    private UUID restaurantId;
}
