package com.eat2fit.user.dto;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 用户注册DTO
 */
@Data
public class UserRegisterDTO {

    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名长度需在4-20之间")
    private String username;

    /**
     *
     */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度需在6-20之间")
    private String password;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 手机号
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    /**
     * 邮箱
     */
    @Email(message = "邮箱格式不正确")
    private String email;

    /**
     * 性别 1:男 2:女 0:未知
     */
    private Integer gender;

    /**
     * 年龄
     */
    private Integer age;

    /**
     * 身高（厘米）
     */
    private Double height;

    /**
     * 体重（公斤）
     */
    private Double weight;

    /**
     * 健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;
} 