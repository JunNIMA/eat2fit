-- 创建健身模块数据库
create schema eat2fit_fitness collate utf8mb4_general_ci;

use eat2fit_fitness;

-- 1. 训练课程表
CREATE TABLE IF NOT EXISTS `workout_course`
(
    `id`           bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '课程ID',
    `title`        varchar(100) NOT NULL COMMENT '课程标题',
    `description`  text                  DEFAULT NULL COMMENT '课程描述',
    `cover_img`    varchar(255)          DEFAULT NULL COMMENT '封面图片URL',
    `video_url`    varchar(255)          DEFAULT NULL COMMENT '课程视频URL',
    `duration`     int(5)                DEFAULT NULL COMMENT '时长(分钟)',
    `difficulty`   tinyint(1)   NOT NULL DEFAULT 2 COMMENT '难度 1:初级 2:中级 3:高级',
    `fitness_goal` tinyint(1)            DEFAULT NULL COMMENT '适合的健身目标 1:增肌 2:减脂 3:塑形 4:维持',
    `body_parts`   varchar(255)          DEFAULT NULL COMMENT '锻炼部位，多个用逗号分隔',
    `calories`     int(5)                DEFAULT NULL COMMENT '消耗卡路里',
    `instructor`   varchar(50)           DEFAULT NULL COMMENT '教练名称',
    `equipment`    varchar(255)          DEFAULT NULL COMMENT '所需器材，多个用逗号分隔',
    `view_count`   bigint(20)            DEFAULT 0 COMMENT '观看次数',
    `like_count`   bigint(20)            DEFAULT 0 COMMENT '点赞次数',
    `status`       tinyint(1)            DEFAULT 1 COMMENT '状态 1:正常 0:下线',
    `create_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_fitness_goal` (`fitness_goal`),
    KEY `idx_difficulty` (`difficulty`),
    FULLTEXT KEY `ft_idx_search` (`title`, `description`, `body_parts`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='训练课程表';

-- 2. 训练计划表
CREATE TABLE IF NOT EXISTS `workout_plan`
(
    `id`                bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '计划ID',
    `name`              varchar(100) NOT NULL COMMENT '计划名称',
    `description`       text                  DEFAULT NULL COMMENT '计划描述',
    `fitness_goal`      tinyint(1)   NOT NULL COMMENT '健身目标 1:增肌 2:减脂 3:塑形 4:维持',
    `difficulty`        tinyint(1)   NOT NULL DEFAULT 2 COMMENT '难度 1:初级 2:中级 3:高级',
    `body_focus`        varchar(255)          DEFAULT NULL COMMENT '重点锻炼部位，多个用逗号分隔',
    `duration_weeks`    int(2)       NOT NULL COMMENT '计划持续周数',
    `sessions_per_week` int(1)       NOT NULL COMMENT '每周训练次数',
    `cover_img`         varchar(255)          DEFAULT NULL COMMENT '封面图片URL',
    `equipment_needed`  varchar(255)          DEFAULT NULL COMMENT '所需器材，多个用逗号分隔',
    `is_ai_generated`   tinyint(1)            DEFAULT 0 COMMENT '是否AI生成 1:是 0:否',
    `is_template`       tinyint(1)            DEFAULT 0 COMMENT '是否为模板 1:是 0:否',
    `status`            tinyint(1)            DEFAULT 1 COMMENT '状态 1:正常 0:下线',
    `create_time`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_fitness_goal` (`fitness_goal`),
    KEY `idx_difficulty` (`difficulty`),
    FULLTEXT KEY `ft_idx_search` (`name`, `description`, `body_focus`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='训练计划表';

-- 3. 计划详情表（每周每天的训练安排）
CREATE TABLE IF NOT EXISTS `workout_plan_detail`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `plan_id`     bigint(20) NOT NULL COMMENT '计划ID',
    `week_num`    int(2)     NOT NULL COMMENT '第几周',
    `day_num`     int(1)     NOT NULL COMMENT '第几天',
    `course_id`   bigint(20)          DEFAULT NULL COMMENT '关联的课程ID',
    `title`       varchar(100)        DEFAULT NULL COMMENT '训练标题',
    `description` varchar(255)        DEFAULT NULL COMMENT '描述',
    `create_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_plan_id` (`plan_id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='计划详情表';

-- 4. 用户训练计划表
CREATE TABLE IF NOT EXISTS `user_workout_plan`
(
    `id`              bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id`         bigint(20) NOT NULL COMMENT '用户ID',
    `plan_id`         bigint(20) NOT NULL COMMENT '计划ID',
    `start_date`      date       NOT NULL COMMENT '开始日期',
    `end_date`        date                DEFAULT NULL COMMENT '结束日期',
    `current_week`    int(2)              DEFAULT 1 COMMENT '当前进行到第几周',
    `current_day`     int(1)              DEFAULT 1 COMMENT '当前进行到第几天',
    `completion_rate` decimal(5, 2)       DEFAULT 0.00 COMMENT '完成率',
    `status`          tinyint(1)          DEFAULT 1 COMMENT '状态 1:进行中 2:已完成 3:已放弃',
    `create_time`     datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_plan_id` (`plan_id`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户训练计划表';

-- 5. 训练打卡记录表
CREATE TABLE IF NOT EXISTS `workout_check_in`
(
    `id`                  bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id`             bigint(20) NOT NULL COMMENT '用户ID',
    `user_plan_id`        bigint(20)          DEFAULT NULL COMMENT '用户计划ID',
    `course_id`           bigint(20)          DEFAULT NULL COMMENT '课程ID',
    `check_in_date`       date       NOT NULL COMMENT '打卡日期',
    `duration`            int(5)              DEFAULT NULL COMMENT '训练时长(分钟)',
    `calorie_consumption` int(5)              DEFAULT NULL COMMENT '消耗卡路里',
    `feeling`             tinyint(1)          DEFAULT NULL COMMENT '感受 1:轻松 2:适中 3:疲惫',
    `content`             varchar(255)        DEFAULT NULL COMMENT '打卡内容',
    `images`              varchar(1000)       DEFAULT NULL COMMENT '图片URL，多个用逗号分隔',
    `create_time`         datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`         datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_check_in_date` (`check_in_date`),
    KEY `idx_user_plan_id` (`user_plan_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='训练打卡记录表';

-- 6. 用户收藏表
CREATE TABLE IF NOT EXISTS `user_favorite`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id`     bigint(20) NOT NULL COMMENT '用户ID',
    `type`        tinyint(1) NOT NULL COMMENT '类型 1:训练课程 2:训练计划',
    `target_id`   bigint(20) NOT NULL COMMENT '目标ID',
    `create_time` datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_type_target` (`user_id`, `type`, `target_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户收藏表';