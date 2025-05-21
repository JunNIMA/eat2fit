package com.eat2fit.fitness.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;

import java.util.List;

/**
 * 训练计划服务接口
 */
public interface WorkoutPlanService extends IService<WorkoutPlan> {

    /**
     * 分页查询计划列表
     * @param page 分页参数
     * @param fitnessGoal 健身目标
     * @param difficulty 难度
     * @param keyword 关键词
     * @return 分页结果
     */
    Page<WorkoutPlan> pageList(Page<WorkoutPlan> page, Integer fitnessGoal, Integer difficulty, String keyword);

    /**
     * 获取计划详情
     * @param planId 计划ID
     * @return 计划详情列表
     */
    List<WorkoutPlanDetail> getPlanDetails(Long planId);

    /**
     * 保存计划及其详情
     * @param plan 计划
     * @param detailList 详情列表
     * @return 是否成功
     */
    boolean savePlanWithDetails(WorkoutPlan plan, List<WorkoutPlanDetail> detailList);

    /**
     * 更新计划及其详情
     * @param plan 计划
     * @param detailList 详情列表
     * @return 是否成功
     */
    boolean updatePlanWithDetails(WorkoutPlan plan, List<WorkoutPlanDetail> detailList);

    /**
     * 获取用户推荐计划
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 推荐计划列表
     */
    List<WorkoutPlan> getRecommendPlans(Long userId, int limit);
} 