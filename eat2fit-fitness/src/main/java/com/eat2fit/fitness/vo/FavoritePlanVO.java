package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 收藏计划VO
 */
@Data
@Schema(description = "收藏计划视图对象")
public class FavoritePlanVO {

    @Schema(description = "收藏ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "计划ID")
    private Long planId;

    @Schema(description = "计划信息")
    private PlanVO plan;

    @Schema(description = "收藏时间")
    private LocalDateTime createTime;
} 