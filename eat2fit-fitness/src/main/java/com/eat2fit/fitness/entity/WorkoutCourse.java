package com.eat2fit.fitness.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 训练课程实体类
 */
@Data
@TableName("workout_course")
public class WorkoutCourse implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 课程ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 课程标题
     */
    private String title;

    /**
     * 课程描述
     */
    private String description;

    /**
     * 封面图片URL
     */
    private String coverImg;

    /**
     * 课程视频URL
     */
    private String videoUrl;

    /**
     * 时长(分钟)
     */
    private Integer duration;

    /**
     * 难度 1:初级 2:中级 3:高级
     */
    private Integer difficulty;

    /**
     * 适合的健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;

    /**
     * 锻炼部位，多个用逗号分隔
     */
    private String bodyParts;

    /**
     * 消耗卡路里
     */
    private Integer calories;

    /**
     * 教练名称
     */
    private String instructor;

    /**
     * 所需器材，多个用逗号分隔
     */
    private String equipment;

    /**
     * 观看次数
     */
    private Long viewCount;

    /**
     * 点赞次数
     */
    private Long likeCount;

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