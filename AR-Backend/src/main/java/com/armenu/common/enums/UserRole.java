package com.armenu.common.enums;

public enum UserRole {
    SUPER_ADMIN,
    RESTAURANT_ADMIN,   // was RESTAURANT_OWNER — restaurant daily operations
    RESTAURANT_OWNER,   // kept for backward compatibility (legacy registrations)
    MANAGER,
    STAFF,
    CUSTOMER
}