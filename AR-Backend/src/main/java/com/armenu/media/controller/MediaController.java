package com.armenu.media.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.media.dto.MediaResponse;
import com.armenu.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "File upload APIs")
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image (jpg/png/webp, max 5MB) → returns Cloudinary URL")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String url = cloudinaryService.uploadImage(file, "ar-menu/images");

        MediaResponse response = MediaResponse.builder()
                .url(url)
                .fileType(file.getContentType())
                .size(file.getSize())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Image uploaded", response));
    }

    @PostMapping(value = "/upload/model", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload 3D model (.glb only, max 20MB) → returns Cloudinary URL")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadModel(
            @RequestParam("file") MultipartFile file) {

        String url = cloudinaryService.uploadModel(file, "ar-menu/models");

        MediaResponse response = MediaResponse.builder()
                .url(url)
                .fileType("model/gltf-binary")
                .size(file.getSize())
                .build();

        return ResponseEntity.ok(ApiResponse.success("3D model uploaded", response));
    }
}
