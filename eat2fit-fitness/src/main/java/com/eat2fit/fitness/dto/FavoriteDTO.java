package com.eat2fit.fitness.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 用户收藏DTO
 */
@Data
@Schema(description = "用户收藏参数")
public class FavoriteDTO {

    @Schema(description = "用户ID", required = true)
    private Long userId;

    @Schema(description = "类型 1:训练课程 2:训练计划", required = true)
    private Integer type;

    @Schema(description = "目标ID", required = true)
    private Long targetId;
} 