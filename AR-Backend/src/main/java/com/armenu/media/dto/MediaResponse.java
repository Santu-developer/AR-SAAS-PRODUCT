package com.armenu.media.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MediaResponse {
    private String url;
    private String publicId;
    private String fileType;
    private long size;
}
