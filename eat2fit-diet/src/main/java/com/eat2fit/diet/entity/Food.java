package com.eat2fit.diet.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 食物营养素实体类
 */
@Data
@TableName("food")
public class Food implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 食物ID
     */
    @TableId(value = "id", type = IdType.AUTO)
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

    /**
     * 状态 1:正常 0:禁用
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