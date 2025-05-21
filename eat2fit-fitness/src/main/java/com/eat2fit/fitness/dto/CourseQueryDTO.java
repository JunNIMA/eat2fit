package com.eat2fit.fitness.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 课程查询DTO
 */
@Data
@Schema(description = "课程查询参数")
public class CourseQueryDTO {

    @Schema(description = "当前页码", defaultValue = "1")
    private Integer current = 1;

    @Schema(description = "每页大小", defaultValue = "10")
    private Integer size = 10;

    @Schema(description = "健身目标 1:增肌 2:减脂 3:塑形 4:维持")
    private Integer fitnessGoal;

    @Schema(description = "难度 1:初级 2:中级 3:高级")
    private Integer difficulty;

    @Schema(description = "搜索关键词")
    private String keyword;
} 