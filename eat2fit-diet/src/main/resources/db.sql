-- 创建饮食模块数据库
create schema eat2fit_diet collate utf8mb4_general_ci;

use eat2fit_diet;

-- 1. 食物营养素表
CREATE TABLE IF NOT EXISTS `food`
(
    `id`            bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '食物ID',
    `name`          varchar(100) NOT NULL COMMENT '食物名称',
    `category`      varchar(50)           DEFAULT NULL COMMENT '食物类别',
    `calories`      int(5)                DEFAULT NULL COMMENT '卡路里(每100克)',
    `protein`       decimal(6, 2)         DEFAULT NULL COMMENT '蛋白质(克)',
    `fat`           decimal(6, 2)         DEFAULT NULL COMMENT '脂肪(克)',
    `carbs`         decimal(6, 2)         DEFAULT NULL COMMENT '碳水化合物(克)',
    `fiber`         decimal(6, 2)         DEFAULT NULL COMMENT '纤维素(克)',
    `image_url`     varchar(255)          DEFAULT NULL COMMENT '图片URL',
    `unit`          varchar(20)           DEFAULT '克' COMMENT '计量单位',
    `status`        tinyint(1)            DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
    `create_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    FULLTEXT KEY `ft_idx_search` (`name`, `category`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='食物营养素表';

-- 2. 食谱表
CREATE TABLE IF NOT EXISTS `recipe`
(
    `id`            bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '食谱ID',
    `title`         varchar(100) NOT NULL COMMENT '食谱标题',
    `description`   text                  DEFAULT NULL COMMENT '食谱简介',
    `cover_img`     varchar(255)          DEFAULT NULL COMMENT '封面图片URL',
    `prep_time`     int(5)                DEFAULT NULL COMMENT '准备时间(分钟)',
    `cook_time`     int(5)                DEFAULT NULL COMMENT '烹饪时间(分钟)',
    `servings`      int(2)                DEFAULT NULL COMMENT '份量(人份)',
    `calories`      int(5)                DEFAULT NULL COMMENT '总卡路里',
    `protein`       decimal(6, 2)         DEFAULT NULL COMMENT '蛋白质(克)',
    `fat`           decimal(6, 2)         DEFAULT NULL COMMENT '脂肪(克)',
    `carbs`         decimal(6, 2)         DEFAULT NULL COMMENT '碳水化合物(克)',
    `meal_type`     varchar(50)           DEFAULT NULL COMMENT '餐食类型(早餐/午餐/晚餐/加餐)',
    `tags`          varchar(255)          DEFAULT NULL COMMENT '标签,多个用逗号分隔',
    `fitness_goal`  tinyint(1)            DEFAULT NULL COMMENT '适合的健身目标 1:增肌 2:减脂 3:塑形 4:维持',
    `difficulty`    tinyint(1)   NOT NULL DEFAULT 2 COMMENT '难度 1:简单 2:中等 3:复杂',
    `steps`         text                  DEFAULT NULL COMMENT '烹饪步骤(JSON格式)',
    `author_id`     bigint(20)            DEFAULT NULL COMMENT '作者ID(如果是用户创建)',
    `author_name`   varchar(50)           DEFAULT NULL COMMENT '作者名称',
    `view_count`    bigint(20)            DEFAULT 0 COMMENT '浏览次数',
    `like_count`    bigint(20)            DEFAULT 0 COMMENT '点赞次数',
    `status`        tinyint(1)            DEFAULT 1 COMMENT '状态 1:正常 0:下线',
    `create_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_fitness_goal` (`fitness_goal`),
    KEY `idx_meal_type` (`meal_type`),
    FULLTEXT KEY `ft_idx_search` (`title`, `description`, `tags`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='食谱表';

-- 3. 食谱食材表
CREATE TABLE IF NOT EXISTS `recipe_ingredient`
(
    `id`            bigint(20)   NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `recipe_id`     bigint(20)   NOT NULL COMMENT '食谱ID',
    `food_id`       bigint(20)            DEFAULT NULL COMMENT '食物ID',
    `name`          varchar(100) NOT NULL COMMENT '食材名称',
    `amount`        decimal(8, 2) NOT NULL COMMENT '数量',
    `unit`          varchar(20)           DEFAULT '克' COMMENT '单位',
    `create_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_recipe_id` (`recipe_id`),
    KEY `idx_food_id` (`food_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='食谱食材表';

-- 4. 用户收藏表(仅食谱)
CREATE TABLE IF NOT EXISTS `user_recipe_favorite`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id`     bigint(20) NOT NULL COMMENT '用户ID',
    `recipe_id`   bigint(20) NOT NULL COMMENT '食谱ID',
    `create_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_recipe` (`user_id`, `recipe_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户食谱收藏表';