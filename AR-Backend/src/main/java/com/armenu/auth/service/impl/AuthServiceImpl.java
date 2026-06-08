package com.armenu.auth.service.impl;

import com.armenu.auth.dto.request.LoginRequest;
import com.armenu.auth.dto.request.RegisterRequest;
import com.armenu.auth.dto.response.AuthResponse;
import com.armenu.auth.dto.response.UserDto;
import com.armenu.auth.entity.RefreshToken;
import com.armenu.auth.entity.User;
import com.armenu.auth.mapper.UserMapper;
import com.armenu.auth.repository.RefreshTokenRepository;
import com.armenu.auth.repository.UserRepository;
import com.armenu.auth.service.AuthService;
import com.armenu.auth.service.JwtService;
import com.armenu.common.enums.UserRole;
import com.armenu.common.exception.DuplicateResourceException;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.common.exception.UnauthorizedException;
import com.armenu.email.service.EmailService;
import com.armenu.restaurant.entity.Restaurant;
import com.armenu.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RestaurantRepository restaurantRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        UUID tenantId = UUID.randomUUID();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.RESTAURANT_OWNER)
                .isActive(true)
                .build();
        user.setTenantId(tenantId);

        User saved = userRepository.save(user);

        // Auto-create restaurant from registation name
        Restaurant restaurant = Restaurant.builder()
                .name(request.getRestaurantName())
                .ownerId(saved.getId())
                .build();
        restaurant.setTenantId(tenantId);
        restaurantRepository.save(restaurant);

        // Send welcome email async — never blocks registration
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), request.getRestaurantName());

        return buildAuthResponse(saved);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }

        refreshTokenRepository.revokeAllByUserId(user.getId());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndIsRevokedFalse(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (refreshToken.isExpired()) {
            throw new UnauthorizedException("Refresh token expired, please login again");
        }

        User user = refreshToken.getUser();
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String token) {
        refreshTokenRepository.findByTokenAndIsRevokedFalse(token)
                .ifPresent(rt -> {
                    rt.setIsRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    @Override
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(userMapper.toDto(user))
                .build();
    }
}
