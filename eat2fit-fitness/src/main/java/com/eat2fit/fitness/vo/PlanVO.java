package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 训练计划VO
 */
@Data
@Schema(description = "训练计划视图对象")
public class PlanVO {

    @Schema(description = "计划ID")
    private Long id;

    @Schema(description = "计划名称")
    private String name;

    @Schema(description = "计划描述")
    private String description;

    @Schema(description = "健身目标 1:增肌 2:减脂 3:塑形 4:维持")
    private Integer fitnessGoal;

    @Schema(description = "健身目标文本")
    private String fitnessGoalText;

    @Schema(description = "难度 1:初级 2:中级 3:高级")
    private Integer difficulty;

    @Schema(description = "难度文本")
    private String difficultyText;

    @Schema(description = "重点锻炼部位，多个用逗号分隔")
    private String bodyFocus;

    @Schema(description = "计划持续周数")
    private Integer durationWeeks;

    @Schema(description = "每周训练次数")
    private Integer sessionsPerWeek;

    @Schema(description = "总训练天数")
    private Integer totalDays;

    @Schema(description = "封面图片URL")
    private String coverImg;

    @Schema(description = "所需器材，多个用逗号分隔")
    private String equipmentNeeded;

    @Schema(description = "是否AI生成 1:是 0:否")
    private Integer isAiGenerated;

    @Schema(description = "是否模板 1:是 0:否")
    private Integer isTemplate;

    @Schema(description = "是否已收藏")
    private Boolean isFavorite;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
} 