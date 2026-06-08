package com.armenu.qr.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.qr.dto.QrCodeDto;
import com.armenu.qr.service.QrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
@Tag(name = "QR Codes", description = "QR code generation and management APIs")
public class QrController {

    private final QrService qrService;

    @PostMapping("/generate/table/{tableId}")
    @Operation(summary = "Generate QR code for a table (uploads PNG to Cloudinary)")
    public ResponseEntity<ApiResponse<QrCodeDto>> generateForTable(@PathVariable UUID tableId) {
        return ResponseEntity.ok(ApiResponse.success("QR generated",
                qrService.generateQrForTable(tableId)));
    }

    @GetMapping("/table/{tableId}")
    @Operation(summary = "Get QR code details for a table")
    public ResponseEntity<ApiResponse<QrCodeDto>> getByTable(@PathVariable UUID tableId) {
        return ResponseEntity.ok(ApiResponse.success("QR fetched",
                qrService.getQrByTable(tableId)));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "List all QR codes for a restaurant")
    public ResponseEntity<ApiResponse<List<QrCodeDto>>> getByRestaurant(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success("QRs fetched",
                qrService.getQrsByRestaurant(restaurantId)));
    }
}
