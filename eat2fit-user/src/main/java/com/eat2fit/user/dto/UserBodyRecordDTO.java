package com.eat2fit.user.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 用户身体数据记录DTO
 */
@Data
public class UserBodyRecordDTO {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 体重（公斤）
     */
    @NotNull(message = "体重不能为空")
    private BigDecimal weight;

    /**
     * 体脂率（%）
     */
    private BigDecimal bodyFat;

    /**
     * 记录日期
     */
    @NotNull(message = "记录日期不能为空")
    private LocalDate recordDate;
} 