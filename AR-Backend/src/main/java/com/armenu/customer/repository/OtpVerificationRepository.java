package com.armenu.customer.repository;

import com.armenu.customer.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findTopByPhoneAndIsUsedFalseOrderByCreatedAtDesc(String phone);

    /** Clean up expired / used OTPs older than 1 hour */
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :cutoff OR o.isUsed = true")
    void deleteExpiredOrUsed(LocalDateTime cutoff);
}
