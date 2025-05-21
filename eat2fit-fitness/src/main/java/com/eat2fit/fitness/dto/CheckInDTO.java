package com.eat2fit.fitness.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 训练打卡DTO
 */
@Data
@Schema(description = "训练打卡参数")
public class CheckInDTO {

    @Schema(description = "用户ID", required = true)
    private Long userId;

    @Schema(description = "用户计划ID")
    private Long userPlanId;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "打卡日期(默认当天)")
    private LocalDate checkInDate;

    @Schema(description = "训练时长(分钟)")
    private Integer duration;

    @Schema(description = "消耗卡路里")
    private Integer calorieConsumption;

    @Schema(description = "感受 1:轻松 2:适中 3:疲惫")
    private Integer feeling;

    @Schema(description = "打卡内容")
    private String content;

    @Schema(description = "图片URL，多个用逗号分隔")
    private String images;
} 