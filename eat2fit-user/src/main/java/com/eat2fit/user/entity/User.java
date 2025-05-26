package com.eat2fit.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户实体类
 */
@Data
@TableName("user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 头像URL
     */
    private String avatar;

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
     * 账号状态 1:正常 0:禁用
     */
    private Integer status;

    /**
     * 健身目标 1:增肌 2:减脂 3:塑形 4:维持
     */
    private Integer fitnessGoal;
    
    /**
     * 用户角色 0:普通用户 1:管理员
     */
    private Integer role;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
} 