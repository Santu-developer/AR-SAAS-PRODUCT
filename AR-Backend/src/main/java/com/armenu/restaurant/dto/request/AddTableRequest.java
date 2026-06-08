package com.armenu.restaurant.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AddTableRequest {

    @NotBlank(message = "Table number is required")
    private String tableNumber;
}
