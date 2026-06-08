package com.armenu.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AnalyticsSummaryDto {
    private long totalScans;
    private long scansToday;
    private long uniqueTablesScanned;
    private String mostViewedItemName;
    private String peakHour;
    private List<TopItemDto> topItems;
}
