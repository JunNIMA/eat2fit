package com.eat2fit.diet.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 食物视图对象
 */
@Data
public class FoodVO {

    /**
     * 食物ID
     */
    private Long id;

    /**
     * 食物名称
     */
    private String name;

    /**
     * 食物类别
     */
    private String category;

    /**
     * 卡路里(每100克)
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
     * 纤维素(克)
     */
    private BigDecimal fiber;

    /**
     * 图片URL
     */
    private String imageUrl;

    /**
     * 计量单位
     */
    private String unit;
} 