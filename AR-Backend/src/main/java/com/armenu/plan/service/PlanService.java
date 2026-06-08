package com.armenu.plan.service;

import com.armenu.plan.dto.PlanDto;
import com.armenu.plan.dto.PlanRequest;

import java.util.List;
import java.util.UUID;

public interface PlanService {

    /** Public — any authenticated user can see active plans */
    List<PlanDto> getActivePlans();

    /** Admin only */
    List<PlanDto> getAllPlans();

    PlanDto create(PlanRequest request);

    PlanDto update(UUID id, PlanRequest request);

    void deactivate(UUID id);
}
