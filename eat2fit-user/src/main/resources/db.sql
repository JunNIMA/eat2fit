create schema eat2fit_user collate utf8mb4_general_ci;

use eat2fit_user;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `user`
(
    `id`           bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username`     varchar(50)  NOT NULL COMMENT '用户名',
    `password`     varchar(100) NOT NULL COMMENT '密码',
    `nickname`     varchar(50)           DEFAULT NULL COMMENT '昵称',
    `phone`        varchar(20)           DEFAULT NULL COMMENT '手机号',
    `email`        varchar(100)          DEFAULT NULL COMMENT '邮箱',
    `avatar`       varchar(255)          DEFAULT NULL COMMENT '头像URL',
    `gender`       tinyint(1)            DEFAULT '0' COMMENT '性别 1:男 2:女 0:未知',
    `age`          int(3)                DEFAULT NULL COMMENT '年龄',
    `height`       decimal(5, 2)         DEFAULT NULL COMMENT '身高（厘米）',
    `weight`       decimal(5, 2)         DEFAULT NULL COMMENT '体重（公斤）',
    `fitness_goal` tinyint(1)            DEFAULT NULL COMMENT '健身目标 1:增肌 2:减脂 3:塑形 4:维持',
    `status`       tinyint(1)            DEFAULT '1' COMMENT '账号状态 1:正常 0:禁用',
    `role`         INTEGER               DEFAULT '0' COMMENT '角色 0:普通用户 1:管理员',
    `create_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户表';

-- 用户身体数据记录表（保留，用于记录用户身体变化）
CREATE TABLE IF NOT EXISTS `user_body_record`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id`     bigint(20) NOT NULL COMMENT '用户ID',
    `weight`      decimal(5, 2)       DEFAULT NULL COMMENT '体重（公斤）',
    `body_fat`    decimal(5, 2)       DEFAULT NULL COMMENT '体脂率（%）',
    `bmi`         decimal(5, 2)       DEFAULT NULL COMMENT 'BMI指数',
    `record_date` date       NOT NULL COMMENT '记录日期',
    `create_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_record_date` (`record_date`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户身体数据记录表';
