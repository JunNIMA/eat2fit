package com.eat2fit.diet.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 食谱食材视图对象
 */
@Data
public class RecipeIngredientVO {

    /**
     * ID
     */
    private Long id;

    /**
     * 食谱ID
     */
    private Long recipeId;

    /**
     * 食物ID
     */
    private Long foodId;

    /**
     * 食材名称
     */
    private String name;

    /**
     * 数量
     */
    private BigDecimal amount;

    /**
     * 单位
     */
    private String unit;

    /**
     * 食物详情(可能为null)
     */
    private FoodVO food;
} 