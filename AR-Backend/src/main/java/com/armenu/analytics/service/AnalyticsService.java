package com.armenu.analytics.service;

import com.armenu.analytics.dto.AnalyticsSummaryDto;
import com.armenu.analytics.dto.ScanDataPoint;
import com.armenu.analytics.dto.TopItemDto;

import java.util.List;

public interface AnalyticsService {

    AnalyticsSummaryDto getSummary();

    List<ScanDataPoint> getScansByPeriod(int days);

    List<TopItemDto> getTopItems(int limit);
}
