package com.eat2fit.user.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户身体数据记录VO
 */
@Data
public class UserBodyRecordVO {

    /**
     * ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 体重（公斤）
     */
    private BigDecimal weight;

    /**
     * 体脂率（%）
     */
    private BigDecimal bodyFat;

    /**
     * BMI指数
     */
    private BigDecimal bmi;

    /**
     * 记录日期
     */
    private LocalDate recordDate;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
} 