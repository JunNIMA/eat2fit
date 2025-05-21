package com.eat2fit.fitness.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.fitness.entity.WorkoutCheckIn;

import java.time.LocalDate;
import java.util.Map;

/**
 * 训练打卡记录服务接口
 */
public interface WorkoutCheckInService extends IService<WorkoutCheckIn> {

    /**
     * 创建打卡记录
     * @param checkIn 打卡记录
     * @return 打卡ID
     */
    Long checkIn(WorkoutCheckIn checkIn);

    /**
     * 获取用户打卡记录
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param page 分页参数
     * @return 分页结果
     */
    Page<WorkoutCheckIn> getUserCheckIns(Long userId, LocalDate startDate, LocalDate endDate, Page<WorkoutCheckIn> page);

    /**
     * 获取用户打卡统计
     * @param userId 用户ID
     * @return 统计结果
     */
    Map<String, Object> getUserCheckInStats(Long userId);

    /**
     * 检查用户当天是否已打卡
     * @param userId 用户ID
     * @param userPlanId 用户计划ID
     * @return 是否已打卡
     */
    boolean hasCheckedInToday(Long userId, Long userPlanId);
} 