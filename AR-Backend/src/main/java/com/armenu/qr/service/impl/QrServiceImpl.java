package com.armenu.qr.service.impl;

import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.common.exception.UnauthorizedException;
import com.armenu.common.util.ByteArrayMultipartFile;
import com.armenu.common.util.SecurityUtils;
import com.armenu.media.service.CloudinaryService;
import com.armenu.qr.dto.QrCodeDto;
import com.armenu.qr.entity.QrCode;
import com.armenu.qr.repository.QrCodeRepository;
import com.armenu.qr.service.QrService;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.entity.RestaurantTable;
import com.armenu.restaurant.repository.RestaurantRepository;
import com.armenu.restaurant.repository.RestaurantTableRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrServiceImpl implements QrService {

    private final QrCodeRepository qrCodeRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${frontend.ar-url}")
    private String arBaseUrl;

    @Override
    @Transactional
    public QrCodeDto generateQrForTable(UUID tableId) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();

        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (!table.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }

        Restaurant restaurant = restaurantRepository
                .findByTenantIdAndIsDeletedFalse(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Build the AR URL that will be embedded in the QR
        String qrUrl = arBaseUrl + "/ar/" + restaurant.getId() + "/table/" + tableId;

        // Generate QR PNG bytes using ZXing
        byte[] qrBytes = generateQrPng(qrUrl);

        // Upload QR image to Cloudinary using a lightweight MultipartFile wrapper
        ByteArrayMultipartFile mockFile = new ByteArrayMultipartFile(
                "file", "qr-" + tableId + ".png", "image/png", qrBytes);
        String qrImageUrl = cloudinaryService.uploadImage(mockFile, "ar-menu/qrcodes");

        // Mark table as having a QR
        table.setHasQr(true);
        tableRepository.save(table);

        // Upsert QrCode record
        QrCode qrCode = qrCodeRepository
                .findByTableIdAndIsDeletedFalse(tableId)
                .orElse(QrCode.builder()
                        .tableId(tableId)
                        .restaurantId(restaurant.getId())
                        .build());

        qrCode.setQrUrl(qrUrl);
        qrCode.setQrImageUrl(qrImageUrl);
        if (qrCode.getId() == null) {
            qrCode.setTenantId(tenantId);
        }

        QrCode saved = qrCodeRepository.save(qrCode);
        return toDto(saved, table.getTableNumber());
    }

    @Override
    public QrCodeDto getQrByTable(UUID tableId) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        QrCode qrCode = qrCodeRepository.findByTableIdAndIsDeletedFalse(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("QR code not found for this table"));
        if (!qrCode.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }
        RestaurantTable table = tableRepository.findById(tableId).orElse(null);
        String tableNumber = table != null ? table.getTableNumber() : "";
        return toDto(qrCode, tableNumber);
    }

    @Override
    public List<QrCodeDto> getQrsByRestaurant(UUID restaurantId) {
        UUID tenantId = SecurityUtils.getCurrentTenantId();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        if (!restaurant.getTenantId().equals(tenantId)) {
            throw new UnauthorizedException("Access denied");
        }

        List<RestaurantTable> tables = tableRepository
                .findByRestaurantIdAndIsDeletedFalseOrderByTableNumberAsc(restaurantId);

        return qrCodeRepository
                .findByRestaurantIdAndTenantIdAndIsDeletedFalse(restaurantId, tenantId)
                .stream()
                .map(qr -> {
                    String tableNumber = tables.stream()
                            .filter(t -> t.getId().equals(qr.getTableId()))
                            .map(RestaurantTable::getTableNumber)
                            .findFirst()
                            .orElse("");
                    return toDto(qr, tableNumber);
                })
                .collect(Collectors.toList());
    }

    private byte[] generateQrPng(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("QR generation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage());
        }
    }

    private QrCodeDto toDto(QrCode qrCode, String tableNumber) {
        return QrCodeDto.builder()
                .id(qrCode.getId())
                .tableId(qrCode.getTableId())
                .tableNumber(tableNumber)
                .restaurantId(qrCode.getRestaurantId())
                .qrImageUrl(qrCode.getQrImageUrl())
                .qrUrl(qrCode.getQrUrl())
                .scanCount(qrCode.getScanCount())
                .build();
    }
}