package com.eat2fit.diet.dto;

import lombok.Data;

/**
 * 食物查询参数DTO
 */
@Data
public class FoodQueryDTO {

    /**
     * 当前页码
     */
    private Integer current = 1;

    /**
     * 每页大小
     */
    private Integer size = 10;

    /**
     * 食物类别
     */
    private String category;

    /**
     * 关键词(名称)
     */
    private String keyword;
} 