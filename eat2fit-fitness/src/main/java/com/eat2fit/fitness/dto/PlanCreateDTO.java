package com.eat2fit.fitness.dto;

import com.eat2fit.fitness.entity.WorkoutPlanDetail;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 训练计划创建DTO
 */
@Data
@Schema(description = "训练计划创建参数")
public class PlanCreateDTO {

    @Schema(description = "计划名称", required = true)
    private String name;

    @Schema(description = "计划描述")
    private String description;

    @Schema(description = "健身目标 1:增肌 2:减脂 3:塑形 4:维持", required = true)
    private Integer fitnessGoal;

    @Schema(description = "难度 1:初级 2:中级 3:高级", required = true)
    private Integer difficulty;

    @Schema(description = "重点锻炼部位，多个用逗号分隔")
    private String bodyFocus;

    @Schema(description = "计划持续周数", required = true)
    private Integer durationWeeks;

    @Schema(description = "每周训练次数", required = true)
    private Integer sessionsPerWeek;

    @Schema(description = "封面图片URL")
    private String coverImg;

    @Schema(description = "所需器材，多个用逗号分隔")
    private String equipmentNeeded;

    @Schema(description = "是否AI生成 1:是 0:否", defaultValue = "0")
    private Integer isAiGenerated = 0;

    @Schema(description = "是否为模板 1:是 0:否", defaultValue = "0")
    private Integer isTemplate = 0;

    @Schema(description = "状态 1:正常 0:下线", defaultValue = "1")
    private Integer status = 1;

    @Schema(description = "计划详情列表", required = true)
    private List<WorkoutPlanDetail> details;
} 