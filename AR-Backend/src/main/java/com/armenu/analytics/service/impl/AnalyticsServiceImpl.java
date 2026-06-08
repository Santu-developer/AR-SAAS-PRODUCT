package com.armenu.analytics.service.impl;

import com.armenu.analytics.dto.AnalyticsSummaryDto;
import com.armenu.analytics.dto.ScanDataPoint;
import com.armenu.analytics.dto.TopItemDto;
import com.armenu.analytics.entity.ScanEvent;
import com.armenu.analytics.repository.ScanEventRepository;
import com.armenu.analytics.service.AnalyticsService;
import com.armenu.common.util.SecurityUtils;
import com.armenu.menu.entity.MenuItem;
import com.armenu.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ScanEventRepository scanEventRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public AnalyticsSummaryDto getSummary() {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        long totalScans = scanEventRepository.countByTenantIdAndScannedAtAfter(tenantId, thirtyDaysAgo);
        long scansToday = scanEventRepository.countByTenantIdAndScannedAtAfter(tenantId, today);
        long uniqueTables = scanEventRepository
                .countUniqueTablesByTenantIdAndScannedAtAfter(tenantId, thirtyDaysAgo);

        List<TopItemDto> topItems = getTopItems(5);
        String mostViewedItemName = topItems.isEmpty() ? null : topItems.get(0).getItemName();

        // Peak hour from last 7 days
        List<ScanEvent> recentScans = scanEventRepository
                .findByTenantIdAndScannedAtAfterOrderByScannedAtDesc(
                        tenantId, LocalDateTime.now().minusDays(7));

        String peakHour = recentScans.stream()
                .collect(Collectors.groupingBy(s -> s.getScannedAt().getHour(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> String.format("%02d:00-%02d:00", e.getKey(), e.getKey() + 1))
                .orElse("N/A");

        return AnalyticsSummaryDto.builder()
                .totalScans(totalScans)
                .scansToday(scansToday)
                .uniqueTablesScanned(uniqueTables)
                .mostViewedItemName(mostViewedItemName)
                .peakHour(peakHour)
                .topItems(topItems)
                .build();
    }

    @Override
    public List<ScanDataPoint> getScansByPeriod(int days) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        List<ScanEvent> events = scanEventRepository
                .findByTenantIdAndScannedAtBetweenOrderByScannedAtDesc(tenantId, start, end);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> grouped = events.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getScannedAt().format(fmt),
                        Collectors.counting()
                ));

        // Fill every day (including days with 0 scans)
        List<ScanDataPoint> result = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            String date = LocalDate.now().minusDays(i).format(fmt);
            result.add(ScanDataPoint.builder()
                    .date(date)
                    .count(grouped.getOrDefault(date, 0L))
                    .build());
        }
        return result;
    }

    @Override
    public List<TopItemDto> getTopItems(int limit) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        List<Object[]> rows = scanEventRepository.findTopItemsByTenantId(tenantId);

        return rows.stream()
                .limit(limit)
                .map(row -> {
                    UUID itemId = (UUID) row[0];
                    long count = ((Number) row[1]).longValue();
                    MenuItem item = menuItemRepository.findById(itemId).orElse(null);
                    return TopItemDto.builder()
                            .itemId(itemId)
                            .itemName(item != null ? item.getName() : "Unknown")
                            .imageUrl(item != null ? item.getImageUrl() : null)
                            .viewCount(count)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
