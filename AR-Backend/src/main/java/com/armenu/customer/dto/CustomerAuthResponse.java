package com.armenu.customer.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CustomerAuthResponse {
    private UUID customerId;
    private String phone;
    private String name;
    /** Short-lived JWT for placing orders */
    private String accessToken;
}
