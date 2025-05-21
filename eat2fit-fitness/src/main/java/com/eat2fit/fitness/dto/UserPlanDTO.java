package com.eat2fit.fitness.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 用户选择训练计划DTO
 */
@Data
@Schema(description = "用户选择训练计划参数")
public class UserPlanDTO {

    @Schema(description = "计划ID", required = true)
    private Long planId;
} 