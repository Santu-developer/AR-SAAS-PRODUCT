package com.armenu.ar.controller;

import com.armenu.ar.dto.ArItemResponse;
import com.armenu.ar.dto.ArMenuResponse;
import com.armenu.ar.dto.ScanRequest;
import com.armenu.ar.service.ArService;
import com.armenu.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "AR Public", description = "Public AR menu APIs — no authentication required")
public class ArController {

    private final ArService arService;

    @GetMapping("/ar/table/{tableId}")
    @Operation(summary = "Get full menu for customer (Redis cached 5 min)")
    public ResponseEntity<ApiResponse<ArMenuResponse>> getMenuForTable(@PathVariable UUID tableId) {
        return ResponseEntity.ok(ApiResponse.success("Menu loaded",
                arService.getMenuForTable(tableId)));
    }

    @GetMapping("/ar/item/{itemId}")
    @Operation(summary = "Get single item AR data")
    public ResponseEntity<ApiResponse<ArItemResponse>> getItemDetail(@PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success("Item loaded",
                arService.getItemDetail(itemId)));
    }

    @PostMapping("/analytics/scan")
    @Operation(summary = "Log QR scan event (async, non-blocking)")
    public ResponseEntity<ApiResponse<Void>> logScan(
            @RequestBody ScanRequest request,
            HttpServletRequest httpRequest) {
        arService.logScan(request, httpRequest);  // @Async — returns immediately
        return ResponseEntity.ok(ApiResponse.success("Scan logged"));
    }
}
