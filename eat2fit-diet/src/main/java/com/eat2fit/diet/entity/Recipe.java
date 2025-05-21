package com.eat2fit.diet.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 食谱实体类
 */
@Data
@TableName("recipe")
public class Recipe implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 食谱ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 食谱标题
     */
    private String title;

    /**
     * 食谱简介
     */
    private String description;

    /**
     * 封面图片URL
     */
    private String coverImg;

    /**
     * 准备时间(分钟)
     */
    private Integer prepTime;

    /**
     * 烹饪时间(分钟)
     */
    private Integer cookTime;

    /**
     * 份量(人份)
     */
    private Integer servings;

    /**
     * 总卡路里
     */
    private Integer calories;

    /**
     * 蛋白质(克)
     */
    private BigDecimal protein;

    /**
     * 脂肪(克)
     */
    private BigDecimal fat;

    /**
     * 碳水化合物(克)
     */
    private BigDecimal carbs;

    /**
     * 餐食类型(早餐/午餐/晚餐/加餐)
     */
    private String mealType;

    /**
     * 标签,多个用逗号分隔
     */
    private String tags;

    /**
     * 适合的健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;

    /**
     * 难度 1:简单 2:中等 3:复杂
     */
    private Integer difficulty;

    /**
     * 烹饪步骤(JSON格式)
     */
    private String steps;

    /**
     * 作者ID(如果是用户创建)
     */
    private Long authorId;

    /**
     * 作者名称
     */
    private String authorName;

    /**
     * 浏览次数
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