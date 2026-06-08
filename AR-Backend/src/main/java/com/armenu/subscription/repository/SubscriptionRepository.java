package com.armenu.subscription.repository;

import com.armenu.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByTenantIdAndIsDeletedFalse(UUID tenantId);

    Optional<Subscription> findByRazorpaySubscriptionId(String razorpaySubscriptionId);

    Optional<Subscription> findByRazorpayOrderId(String orderId);
}
