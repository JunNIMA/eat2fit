package com.eat2fit.user.dto;

import lombok.Data;

/**
 * 用户状态更新DTO
 */
@Data
public class StatusUpdateDTO {
    /**
     * 状态 0:禁用 1:正常
     */
    private Integer status;
} 