package com.armenu.auth.service;

import com.armenu.auth.entity.User;

public interface JwtService {
    String generateAccessToken(User user);
    String generateRefreshToken(User user);
    String extractEmail(String token);
    boolean isTokenValid(String token, User user);
}
