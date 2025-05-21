package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 计划详情VO
 */
@Data
@Schema(description = "计划详情视图对象")
public class PlanDetailVO {

    @Schema(description = "详情ID")
    private Long id;

    @Schema(description = "计划ID")
    private Long planId;

    @Schema(description = "第几周")
    private Integer weekNum;

    @Schema(description = "第几天")
    private Integer dayNum;

    @Schema(description = "关联的课程ID")
    private Long courseId;

    @Schema(description = "训练标题")
    private String title;

    @Schema(description = "描述")
    private String description;

    @Schema(description = "相关课程信息")
    private CourseVO course;
} 