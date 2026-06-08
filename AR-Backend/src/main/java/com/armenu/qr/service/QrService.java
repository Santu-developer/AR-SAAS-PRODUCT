package com.armenu.qr.service;

import com.armenu.qr.dto.QrCodeDto;

import java.util.List;
import java.util.UUID;

public interface QrService {

    QrCodeDto generateQrForTable(UUID tableId);

    QrCodeDto getQrByTable(UUID tableId);

    List<QrCodeDto> getQrsByRestaurant(UUID restaurantId);
}
