package com.armenu.media.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    /**
     * Uploads a JPEG/PNG/WebP image to Cloudinary.
     * @param file     the image file
     * @param folder   Cloudinary folder path
     * @return CDN URL of the uploaded image
     */
    String uploadImage(MultipartFile file, String folder);

    /**
     * Uploads a .glb 3D model file to Cloudinary as a raw resource.
     * @param file     the .glb file
     * @param folder   Cloudinary folder path
     * @return CDN URL of the uploaded model
     */
    String uploadModel(MultipartFile file, String folder);

    /**
     * Deletes a file from Cloudinary by its public ID.
     */
    void deleteFile(String publicId, String resourceType);
}
