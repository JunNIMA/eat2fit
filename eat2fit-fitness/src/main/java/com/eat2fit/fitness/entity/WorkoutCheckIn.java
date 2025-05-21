package com.eat2fit.fitness.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 训练打卡记录实体类
 */
@Data
@TableName("workout_check_in")
public class WorkoutCheckIn implements Serializable {

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
     * 用户计划ID
     */
    private Long userPlanId;

    /**
     * 课程ID
     */
    private Long courseId;

    /**
     * 打卡日期
     */
    private LocalDate checkInDate;

    /**
     * 训练时长(分钟)
     */
    private Integer duration;

    /**
     * 消耗卡路里
     */
    private Integer calorieConsumption;

    /**
     * 感受 1:轻松 2:适中 3:疲惫
     */
    private Integer feeling;

    /**
     * 打卡内容
     */
    private String content;

    /**
     * 图片URL，多个用逗号分隔
     */
    private String images;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
} 