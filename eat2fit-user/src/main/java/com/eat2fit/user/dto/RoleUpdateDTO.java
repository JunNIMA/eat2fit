package com.eat2fit.user.dto;

import lombok.Data;

/**
 * 用户角色更新DTO
 */
@Data
public class RoleUpdateDTO {
    /**
     * 角色 0:普通用户 1:管理员
     */
    private Integer role;
} 