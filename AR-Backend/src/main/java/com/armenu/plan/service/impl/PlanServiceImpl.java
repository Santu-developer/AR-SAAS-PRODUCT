package com.armenu.plan.service.impl;

import com.armenu.common.exception.DuplicateResourceException;
import com.armenu.common.exception.ResourceNotFoundException;
import com.armenu.plan.dto.PlanDto;
import com.armenu.plan.dto.PlanRequest;
import com.armenu.plan.entity.Plan;
import com.armenu.plan.repository.PlanRepository;
import com.armenu.plan.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService {

    private final PlanRepository planRepository;

    @Override
    public List<PlanDto> getActivePlans() {
        return planRepository.findByIsActiveTrueOrderByPriceAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<PlanDto> getAllPlans() {
        return planRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PlanDto create(PlanRequest request) {
        if (planRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Plan '" + request.getName() + "' already exists");
        }
        Plan plan = Plan.builder()
                .name(request.getName())
                .displayName(request.getDisplayName())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .maxRestaurants(request.getMaxRestaurants() != null ? request.getMaxRestaurants() : 1)
                .maxMenuItems(request.getMaxMenuItems() != null ? request.getMaxMenuItems() : 50)
                .analyticsEnabled(request.getAnalyticsEnabled() != null ? request.getAnalyticsEnabled() : false)
                .razorpayPlanId(request.getRazorpayPlanId())
                .description(request.getDescription())
                .build();
        return toDto(planRepository.save(plan));
    }

    @Override
    @Transactional
    public PlanDto update(UUID id, PlanRequest request) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        plan.setDisplayName(request.getDisplayName());
        plan.setPrice(request.getPrice());
        plan.setDurationDays(request.getDurationDays());
        if (request.getMaxRestaurants() != null) plan.setMaxRestaurants(request.getMaxRestaurants());
        if (request.getMaxMenuItems() != null) plan.setMaxMenuItems(request.getMaxMenuItems());
        if (request.getAnalyticsEnabled() != null) plan.setAnalyticsEnabled(request.getAnalyticsEnabled());
        if (request.getRazorpayPlanId() != null) plan.setRazorpayPlanId(request.getRazorpayPlanId());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        return toDto(planRepository.save(plan));
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    private PlanDto toDto(Plan plan) {
        return PlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .displayName(plan.getDisplayName())
                .price(plan.getPrice())
                .durationDays(plan.getDurationDays())
                .maxRestaurants(plan.getMaxRestaurants())
                .maxMenuItems(plan.getMaxMenuItems())
                .analyticsEnabled(plan.getAnalyticsEnabled())
                .razorpayPlanId(plan.getRazorpayPlanId())
                .description(plan.getDescription())
                .isActive(plan.getIsActive())
                .build();
    }
}
