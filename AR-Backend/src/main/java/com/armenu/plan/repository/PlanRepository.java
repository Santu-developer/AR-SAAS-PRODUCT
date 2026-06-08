package com.armenu.plan.repository;

import com.armenu.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<Plan, UUID> {

    List<Plan> findByIsActiveTrueOrderByPriceAsc();

    boolean existsByName(String name);
}
