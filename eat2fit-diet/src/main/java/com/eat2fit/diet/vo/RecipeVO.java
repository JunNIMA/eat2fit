package com.eat2fit.diet.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 食谱列表视图对象
 */
@Data
public class RecipeVO {

    /**
     * 食谱ID
     */
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
     * 总时长(分钟)
     */
    private Integer totalTime;

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
     * 健身目标文本描述
     */
    private String fitnessGoalText;

    /**
     * 难度 1:简单 2:中等 3:复杂
     */
    private Integer difficulty;

    /**
     * 难度文本描述
     */
    private String difficultyText;

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
     * 是否已收藏
     */
    private Boolean isFavorite;
} 