package com.armenu.customer.service.impl;

import com.armenu.auth.entity.User;
import com.armenu.auth.service.JwtService;
import com.armenu.common.enums.UserRole;
import com.armenu.common.exception.UnauthorizedException;
import com.armenu.customer.dto.CustomerAuthResponse;
import com.armenu.customer.dto.SendOtpRequest;
import com.armenu.customer.dto.VerifyOtpRequest;
import com.armenu.customer.entity.Customer;
import com.armenu.customer.entity.OtpVerification;
import com.armenu.customer.repository.CustomerRepository;
import com.armenu.customer.repository.OtpVerificationRepository;
import com.armenu.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final OtpVerificationRepository otpRepository;
    private final JwtService jwtService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    @Transactional
    public void sendOtp(SendOtpRequest request) {
        String otp = generateOtp();

        OtpVerification verification = OtpVerification.builder()
                .phone(request.getPhone())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpRepository.save(verification);

        // In production: call SMS provider (Twilio, MSG91, etc.)
        // In development: log the OTP
        log.info("OTP for {} : {} (replace with SMS in production)", request.getPhone(), otp);
    }

    @Override
    @Transactional
    public CustomerAuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpVerification verification = otpRepository
                .findTopByPhoneAndIsUsedFalseOrderByCreatedAtDesc(request.getPhone())
                .orElseThrow(() -> new UnauthorizedException("No OTP sent for this number"));

        if (verification.isExpired()) {
            throw new UnauthorizedException("OTP has expired. Please request a new one");
        }

        if (!verification.getOtp().equals(request.getOtp())) {
            throw new UnauthorizedException("Invalid OTP");
        }

        // Mark OTP as used
        verification.setIsUsed(true);
        otpRepository.save(verification);

        // Get or create customer
        Customer customer = customerRepository.findByPhone(request.getPhone())
                .orElseGet(() -> {
                    Customer c = Customer.builder()
                            .phone(request.getPhone())
                            .name(request.getName())
                            .isVerified(true)
                            .build();
                    return customerRepository.save(c);
                });

        // Update name if provided
        if (request.getName() != null && !request.getName().isBlank()
                && (customer.getName() == null || customer.getName().isBlank())) {
            customer.setName(request.getName());
            customerRepository.save(customer);
        }

        // Generate JWT — reuse JwtService by building a synthetic User principal
        String token = generateCustomerToken(customer);

        return CustomerAuthResponse.builder()
                .customerId(customer.getId())
                .phone(customer.getPhone())
                .name(customer.getName())
                .accessToken(token)
                .build();
    }

    // ---- Helpers ----

    private String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    /**
     * We reuse JwtService which operates on User objects.
     * We create a transient User with CUSTOMER role to generate the token.
     * This token is short-lived and only valid for placing orders.
     */
    private String generateCustomerToken(Customer customer) {
        User synthetic = User.builder()
                .email(customer.getPhone())   // phone acts as the "username"
                .name(customer.getName() != null ? customer.getName() : customer.getPhone())
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();
        synthetic.setId(customer.getId());
        synthetic.setTenantId(UUID.fromString("00000000-0000-0000-0000-000000000000")); // no tenant
        return jwtService.generateAccessToken(synthetic);
    }
}
