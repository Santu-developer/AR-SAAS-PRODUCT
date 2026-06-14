package com.armenu.auth.controller;

import com.armenu.auth.dto.request.LoginRequest;
import com.armenu.auth.dto.request.RegisterRequest;
import com.armenu.auth.dto.response.AuthResponse;
import com.armenu.auth.dto.response.UserDto;
import com.armenu.auth.service.AuthService;
import com.armenu.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:5173")
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register restaurant owner")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<UserDto>> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDto user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User fetched", user));
    }
}