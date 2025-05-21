package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 训练打卡VO
 */
@Data
@Schema(description = "训练打卡视图对象")
public class CheckInVO {

    @Schema(description = "打卡ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户计划ID")
    private Long userPlanId;

    @Schema(description = "用户计划信息")
    private UserPlanVO userPlan;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程信息")
    private CourseVO course;

    @Schema(description = "打卡日期")
    private LocalDate checkInDate;

    @Schema(description = "训练时长(分钟)")
    private Integer duration;

    @Schema(description = "消耗卡路里")
    private Integer calorieConsumption;

    @Schema(description = "感受 1:轻松 2:适中 3:疲惫")
    private Integer feeling;

    @Schema(description = "感受文本")
    private String feelingText;

    @Schema(description = "打卡内容")
    private String content;

    @Schema(description = "图片URL列表")
    private String[] imageList;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
} 