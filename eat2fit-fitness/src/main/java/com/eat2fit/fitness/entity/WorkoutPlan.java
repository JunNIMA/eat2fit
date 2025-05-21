package com.eat2fit.fitness.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 训练计划实体类
 */
@Data
@TableName("workout_plan")
public class WorkoutPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 计划ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 计划名称
     */
    private String name;

    /**
     * 计划描述
     */
    private String description;

    /**
     * 健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;

    /**
     * 难度 1:初级 2:中级 3:高级
     */
    private Integer difficulty;

    /**
     * 重点锻炼部位，多个用逗号分隔
     */
    private String bodyFocus;

    /**
     * 计划持续周数
     */
    private Integer durationWeeks;

    /**
     * 每周训练次数
     */
    private Integer sessionsPerWeek;

    /**
     * 封面图片URL
     */
    private String coverImg;

    /**
     * 所需器材，多个用逗号分隔
     */
    private String equipmentNeeded;

    /**
     * 是否AI生成 1:是 0:否
     */
    private Integer isAiGenerated;

    /**
     * 是否为模板 1:是 0:否
     */
    private Integer isTemplate;

    /**
     * 状态 1:正常 0:下线
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
} 