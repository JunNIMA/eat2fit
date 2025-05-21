package com.eat2fit.fitness.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.fitness.entity.UserFavorite;

import java.util.Map;

/**
 * 用户收藏服务接口
 */
public interface UserFavoriteService extends IService<UserFavorite> {

    /**
     * 添加收藏
     * @param userId 用户ID
     * @param type 类型 1:训练课程 2:训练计划
     * @param targetId 目标ID
     * @return 是否成功
     */
    boolean addFavorite(Long userId, Integer type, Long targetId);

    /**
     * 取消收藏
     * @param userId 用户ID
     * @param type 类型 1:训练课程 2:训练计划
     * @param targetId 目标ID
     * @return 是否成功
     */
    boolean cancelFavorite(Long userId, Integer type, Long targetId);

    /**
     * 检查是否已收藏
     * @param userId 用户ID
     * @param type 类型 1:训练课程 2:训练计划
     * @param targetId 目标ID
     * @return 是否已收藏
     */
    boolean isFavorite(Long userId, Integer type, Long targetId);

    /**
     * 获取用户收藏的课程列表
     * @param userId 用户ID
     * @param page 分页参数
     * @return 分页结果
     */
    Page<Map<String, Object>> getFavoriteCourses(Long userId, Page<UserFavorite> page);

    /**
     * 获取用户收藏的计划列表
     * @param userId 用户ID
     * @param page 分页参数
     * @return 分页结果
     */
    Page<Map<String, Object>> getFavoritePlans(Long userId, Page<UserFavorite> page);
} 