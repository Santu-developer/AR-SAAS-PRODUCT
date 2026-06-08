package com.armenu.common.util;

import com.armenu.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new RuntimeException("No authenticated user found");
    }

    public static UUID getCurrentTenantId() {
        return getCurrentUser().getTenantId();
    }
}