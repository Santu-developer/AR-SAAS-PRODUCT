package com.armenu.customer.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.customer.dto.CustomerAuthResponse;
import com.armenu.customer.dto.SendOtpRequest;
import com.armenu.customer.dto.VerifyOtpRequest;
import com.armenu.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/auth")
@RequiredArgsConstructor
@Tag(name = "Customer Auth", description = "OTP-based authentication for walk-in customers")
public class CustomerAuthController {

    private final CustomerService customerService;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to customer's phone number")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        customerService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and get access token")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        CustomerAuthResponse response = customerService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Verified successfully", response));
    }
}
