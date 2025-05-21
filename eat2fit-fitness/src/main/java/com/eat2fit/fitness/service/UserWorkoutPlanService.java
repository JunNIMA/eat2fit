package com.eat2fit.fitness.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.fitness.entity.UserWorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;

import java.util.List;
import java.util.Map;

/**
 * 用户训练计划服务接口
 */
public interface UserWorkoutPlanService extends IService<UserWorkoutPlan> {

    /**
     * 获取用户计划列表
     * @param userId 用户ID
     * @param status 状态
     * @param page 分页参数
     * @return 分页结果
     */
    Page<Map<String, Object>> getUserPlanList(Long userId, Integer status, Page<UserWorkoutPlan> page);

    /**
     * 用户选择一个计划
     * @param userId 用户ID
     * @param planId 计划ID
     * @return 用户计划ID
     */
    Long choosePlan(Long userId, Long planId);

    /**
     * 获取用户当前计划
     * @param userId 用户ID
     * @return 用户计划信息
     */
    Map<String, Object> getCurrentPlan(Long userId);

    /**
     * 获取用户当天训练详情
     * @param userPlanId 用户计划ID
     * @return 训练详情
     */
    Map<String, Object> getTodayWorkout(Long userPlanId);

    /**
     * 更新用户计划进度
     * @param userPlanId 用户计划ID
     * @param completed 是否完成当天计划
     * @return 是否成功
     */
    boolean updatePlanProgress(Long userPlanId, boolean completed);

    /**
     * 放弃计划
     * @param userPlanId 用户计划ID
     * @return 是否成功
     */
    boolean abandonPlan(Long userPlanId);

    /**
     * 完成计划
     * @param userPlanId 用户计划ID
     * @return 是否成功
     */
    boolean completePlan(Long userPlanId);
} 