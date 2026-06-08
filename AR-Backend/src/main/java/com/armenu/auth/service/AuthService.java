package com.armenu.auth.service;

import com.armenu.auth.dto.request.LoginRequest;
import com.armenu.auth.dto.request.RegisterRequest;
import com.armenu.auth.dto.response.AuthResponse;
import com.armenu.auth.dto.response.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserDto getCurrentUser(String email);
}
