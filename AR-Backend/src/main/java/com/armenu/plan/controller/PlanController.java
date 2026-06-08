package com.armenu.plan.controller;

import com.armenu.common.dto.ApiResponse;
import com.armenu.plan.dto.PlanDto;
import com.armenu.plan.dto.PlanRequest;
import com.armenu.plan.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
@Tag(name = "Plans", description = "Subscription plan management — admin only for write operations")
public class PlanController {

    private final PlanService planService;

    @GetMapping
    @Operation(summary = "Get all active plans — visible to all authenticated users")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getActivePlans() {
        return ResponseEntity.ok(ApiResponse.success("Plans fetched", planService.getActivePlans()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all plans including inactive — SUPER_ADMIN only")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getAllPlans() {
        return ResponseEntity.ok(ApiResponse.success("Plans fetched", planService.getAllPlans()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new plan — SUPER_ADMIN only")
    public ResponseEntity<ApiResponse<PlanDto>> create(@Valid @RequestBody PlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plan created", planService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a plan — SUPER_ADMIN only")
    public ResponseEntity<ApiResponse<PlanDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Plan updated", planService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Deactivate a plan — SUPER_ADMIN only")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        planService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Plan deactivated"));
    }
}
