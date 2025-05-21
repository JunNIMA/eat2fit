package com.eat2fit.diet.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 食谱食材实体类
 */
@Data
@TableName("recipe_ingredient")
public class RecipeIngredient implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
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
     * 创建时间
     */
    private LocalDateTime createTime;
} 