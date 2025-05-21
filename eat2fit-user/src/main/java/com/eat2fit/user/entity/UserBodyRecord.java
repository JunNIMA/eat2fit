package com.eat2fit.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户身体数据记录实体类
 */
@Data
@TableName("user_body_record")
public class UserBodyRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(type = IdType.AUTO)
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
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
} 