package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户训练计划VO
 */
@Data
@Schema(description = "用户训练计划视图对象")
public class UserPlanVO {

    @Schema(description = "用户计划ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "计划ID")
    private Long planId;

    @Schema(description = "计划信息")
    private PlanVO plan;

    @Schema(description = "开始日期")
    private LocalDate startDate;

    @Schema(description = "结束日期")
    private LocalDate endDate;

    @Schema(description = "当前进行到第几周")
    private Integer currentWeek;

    @Schema(description = "当前进行到第几天")
    private Integer currentDay;

    @Schema(description = "完成率")
    private BigDecimal completionRate;

    @Schema(description = "完成进度百分比")
    private String progressPercent;

    @Schema(description = "状态 1:进行中 2:已完成 3:已放弃")
    private Integer status;

    @Schema(description = "状态文本")
    private String statusText;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "今日训练详情")
    private PlanDetailVO todayWorkout;
} 