package com.armenu.auth.dto.response;


import com.armenu.common.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private UserRole role;
    private UUID tenantId;
}