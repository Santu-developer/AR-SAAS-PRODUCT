package com.armenu.analytics.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScanDataPoint {
    private String date;   // "yyyy-MM-dd"
    private long count;
}
