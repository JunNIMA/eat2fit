package com.eat2fit.fitness.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户训练计划实体类
 */
@Data
@TableName("user_workout_plan")
public class UserWorkoutPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 计划ID
     */
    private Long planId;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;

    /**
     * 当前进行到第几周
     */
    private Integer currentWeek;

    /**
     * 当前进行到第几天
     */
    private Integer currentDay;

    /**
     * 完成率
     */
    private BigDecimal completionRate;

    /**
     * 状态 1:进行中 2:已完成 3:已放弃
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