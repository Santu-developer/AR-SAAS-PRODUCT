package com.armenu.ar.service;

import com.armenu.ar.dto.ArItemResponse;
import com.armenu.ar.dto.ArMenuResponse;
import com.armenu.ar.dto.ScanRequest;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

public interface ArService {

    ArMenuResponse getMenuForTable(UUID tableId);

    ArItemResponse getItemDetail(UUID itemId);

    void logScan(ScanRequest request, HttpServletRequest httpRequest);
}
