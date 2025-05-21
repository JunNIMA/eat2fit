package com.eat2fit.diet.dto;

import lombok.Data;

/**
 * 食谱查询参数DTO
 */
@Data
public class RecipeQueryDTO {

    /**
     * 当前页码
     */
    private Integer current = 1;

    /**
     * 每页大小
     */
    private Integer size = 10;

    /**
     * 健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;

    /**
     * 餐食类型(早餐/午餐/晚餐/加餐)
     */
    private String mealType;

    /**
     * 难度 1:简单 2:中等 3:复杂
     */
    private Integer difficulty;

    /**
     * 关键词(标题/描述/标签)
     */
    private String keyword;
} 