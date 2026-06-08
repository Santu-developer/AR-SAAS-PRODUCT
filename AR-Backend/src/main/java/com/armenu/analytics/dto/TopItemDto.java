package com.armenu.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class TopItemDto {
    private UUID itemId;
    private String itemName;
    private String imageUrl;
    private long viewCount;
}
