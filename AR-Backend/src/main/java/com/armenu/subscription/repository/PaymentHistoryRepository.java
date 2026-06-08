package com.armenu.subscription.repository;

import com.armenu.subscription.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, UUID> {

    List<PaymentHistory> findByUserIdAndIsDeletedFalseOrderByPaidAtDesc(UUID userId);
}
