package com.armenu.media.service.impl;

import com.armenu.common.exception.FileUploadException;
import com.armenu.media.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024L;  // 5 MB
    private static final long MAX_MODEL_SIZE = 20 * 1024 * 1024L; // 20 MB

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, "Image");

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            log.error("Image upload failed: {}", e.getMessage());
            throw new FileUploadException("Image upload failed: " + e.getMessage());
        }
    }

    @Override
    public String uploadModel(MultipartFile file, String folder) {
        // .glb files don't have a standard MIME type — browsers may send various types
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".glb")) {
            throw new FileUploadException("Only .glb files are allowed for 3D models");
        }
        if (file.getSize() > MAX_MODEL_SIZE) {
            throw new FileUploadException("3D model file must be under 20 MB");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "raw",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            log.error("Model upload failed: {}", e.getMessage());
            throw new FileUploadException("Model upload failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String publicId, String resourceType) {
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file, List<String> allowedTypes, long maxSize, String label) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException(label + " file is required");
        }
        if (!allowedTypes.contains(file.getContentType())) {
            throw new FileUploadException(label + " must be one of: " + String.join(", ", allowedTypes));
        }
        if (file.getSize() > maxSize) {
            throw new FileUploadException(label + " file must be under " + (maxSize / (1024 * 1024)) + " MB");
        }
    }
}
