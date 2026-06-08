package com.armenu.analytics.controller;

import com.armenu.analytics.dto.AnalyticsSummaryDto;
import com.armenu.analytics.dto.ScanDataPoint;
import com.armenu.analytics.dto.TopItemDto;
import com.armenu.analytics.service.AnalyticsService;
import com.armenu.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get analytics summary (total scans, top items, peak hour)")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Summary fetched",
                analyticsService.getSummary()));
    }

    @GetMapping("/scans")
    @Operation(summary = "Get scan data points by period (default 7 days)")
    public ResponseEntity<ApiResponse<List<ScanDataPoint>>> getScans(
            @RequestParam(defaultValue = "7") int days) {
        if (days < 1 || days > 90) days = 7;
        return ResponseEntity.ok(ApiResponse.success("Scan data fetched",
                analyticsService.getScansByPeriod(days)));
    }

    @GetMapping("/top-items")
    @Operation(summary = "Get top viewed menu items")
    public ResponseEntity<ApiResponse<List<TopItemDto>>> getTopItems(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Top items fetched",
                analyticsService.getTopItems(limit)));
    }
}
