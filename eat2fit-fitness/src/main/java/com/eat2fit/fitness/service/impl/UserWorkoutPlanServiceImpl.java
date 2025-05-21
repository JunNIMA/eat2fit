package com.eat2fit.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.exception.ErrorCode;
import com.eat2fit.fitness.entity.UserWorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;
import com.eat2fit.fitness.mapper.UserWorkoutPlanMapper;
import com.eat2fit.fitness.service.UserWorkoutPlanService;
import com.eat2fit.fitness.service.WorkoutPlanDetailService;
import com.eat2fit.fitness.service.WorkoutPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户训练计划服务实现类
 */
@Service
public class UserWorkoutPlanServiceImpl extends ServiceImpl<UserWorkoutPlanMapper, UserWorkoutPlan> implements UserWorkoutPlanService {

    @Autowired
    private WorkoutPlanService planService;

    @Autowired
    private WorkoutPlanDetailService planDetailService;

    @Override
    public Page<Map<String, Object>> getUserPlanList(Long userId, Integer status, Page<UserWorkoutPlan> page) {
        LambdaQueryWrapper<UserWorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserWorkoutPlan::getUserId, userId);
        
        if (status != null) {
            queryWrapper.eq(UserWorkoutPlan::getStatus, status);
        }
        
        queryWrapper.orderByDesc(UserWorkoutPlan::getCreateTime);
        
        Page<UserWorkoutPlan> userPlansPage = baseMapper.selectPage(page, queryWrapper);
        
        // 组装结果，关联计划信息
        Page<Map<String, Object>> resultPage = new Page<>();
        resultPage.setTotal(userPlansPage.getTotal());
        resultPage.setCurrent(userPlansPage.getCurrent());
        resultPage.setSize(userPlansPage.getSize());
        
        List<Map<String, Object>> records = userPlansPage.getRecords().stream().map(userPlan -> {
            Map<String, Object> result = new HashMap<>();
            result.put("userPlan", userPlan);
            
            // 获取关联的计划信息
            WorkoutPlan plan = planService.getById(userPlan.getPlanId());
            result.put("plan", plan);
            
            return result;
        }).collect(Collectors.toList());
        
        resultPage.setRecords(records);
        return resultPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long choosePlan(Long userId, Long planId) {
        // 检查是否已有进行中的计划
        LambdaQueryWrapper<UserWorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserWorkoutPlan::getUserId, userId)
                   .eq(UserWorkoutPlan::getStatus, 1); // 进行中
        
        if (baseMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException(ErrorCode.FITNESS_PLAN_ALREADY_IN_PROGRESS);
        }
        
        // 获取计划信息
        WorkoutPlan plan = planService.getById(planId);
        if (plan == null) {
            throw new BusinessException(ErrorCode.FITNESS_PLAN_NOT_FOUND);
        }
        
        // 创建用户计划
        UserWorkoutPlan userPlan = new UserWorkoutPlan();
        userPlan.setUserId(userId);
        userPlan.setPlanId(planId);
        userPlan.setStartDate(LocalDate.now());
        userPlan.setEndDate(LocalDate.now().plusWeeks(plan.getDurationWeeks()));
        userPlan.setCurrentWeek(1);
        userPlan.setCurrentDay(1);
        userPlan.setCompletionRate(BigDecimal.ZERO);
        userPlan.setStatus(1); // 进行中
        
        save(userPlan);
        
        return userPlan.getId();
    }

    @Override
    public Map<String, Object> getCurrentPlan(Long userId) {
        // 查询用户当前进行中的计划
        LambdaQueryWrapper<UserWorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserWorkoutPlan::getUserId, userId)
                   .eq(UserWorkoutPlan::getStatus, 1) // 进行中
                   .orderByDesc(UserWorkoutPlan::getCreateTime)
                   .last("LIMIT 1");
        
        UserWorkoutPlan userPlan = getOne(queryWrapper);
        
        if (userPlan == null) {
            return null;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("userPlan", userPlan);
        
        // 获取计划基本信息
        WorkoutPlan plan = planService.getById(userPlan.getPlanId());
        result.put("plan", plan);
        
        // 获取计划详情
        List<WorkoutPlanDetail> planDetails = planService.getPlanDetails(userPlan.getPlanId());
        result.put("planDetails", planDetails);
        
        return result;
    }

    @Override
    public Map<String, Object> getTodayWorkout(Long userPlanId) {
        UserWorkoutPlan userPlan = getById(userPlanId);
        if (userPlan == null || userPlan.getStatus() != 1) {
            throw new BusinessException(ErrorCode.FITNESS_PLAN_INVALID_OPERATION);
        }
        
        // 获取计划信息
        WorkoutPlan plan = planService.getById(userPlan.getPlanId());
        if (plan == null) {
            throw new BusinessException(ErrorCode.FITNESS_PLAN_NOT_FOUND);
        }

        // 计算当前计划已经进行的天数（从开始日期到今天）
        LocalDate today = LocalDate.now();
        LocalDate startDate = userPlan.getStartDate();
        
        // 计算从开始日期到今天的天数差
        long daysSinceStart = ChronoUnit.DAYS.between(startDate, today);
        
        // 计算当天是第几周第几天（考虑每周训练次数）
        int sessionsPerWeek = plan.getSessionsPerWeek();
        int totalDays = (int)Math.min(daysSinceStart, plan.getDurationWeeks() * sessionsPerWeek);
        
        // 确保不超过计划总天数
        if (totalDays >= plan.getDurationWeeks() * sessionsPerWeek) {
            totalDays = plan.getDurationWeeks() * sessionsPerWeek - 1; // 索引从0开始
        }
        
        // 计算今天对应的周和天
        int todayWeek = (totalDays / sessionsPerWeek) + 1; // 周数从1开始
        int todayDay = (totalDays % sessionsPerWeek) + 1;  // 天数从1开始
        
        // 获取今天对应的训练内容
        LambdaQueryWrapper<WorkoutPlanDetail> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutPlanDetail::getPlanId, userPlan.getPlanId())
                   .eq(WorkoutPlanDetail::getWeekNum, todayWeek)
                   .eq(WorkoutPlanDetail::getDayNum, todayDay);
        
        WorkoutPlanDetail detail = planDetailService.getOne(queryWrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("userPlan", userPlan);
        result.put("todayWorkout", detail);
        result.put("todayWeek", todayWeek);
        result.put("todayDay", todayDay);
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePlanProgress(Long userPlanId, boolean completed) {
        UserWorkoutPlan userPlan = getById(userPlanId);
        if (userPlan == null || userPlan.getStatus() != 1) {
            throw new BusinessException(ErrorCode.FITNESS_PLAN_INVALID_OPERATION);
        }
        
        // 获取计划信息，计算总训练天数
        WorkoutPlan plan = planService.getById(userPlan.getPlanId());
        int totalDays = plan.getDurationWeeks() * plan.getSessionsPerWeek();
        
        // 计算当前是第几天
        int currentDay = (userPlan.getCurrentWeek() - 1) * plan.getSessionsPerWeek() + userPlan.getCurrentDay();
        
        // 更新完成率
        BigDecimal completedRatio = completed 
            ? new BigDecimal(currentDay).divide(new BigDecimal(totalDays), 2, RoundingMode.HALF_UP)
            : userPlan.getCompletionRate();
        
        // 判断是否需要进入下一天
        int nextWeek = userPlan.getCurrentWeek();
        int nextDay = userPlan.getCurrentDay() + 1;
        
        // 如果超过每周训练次数，进入下一周
        if (nextDay > plan.getSessionsPerWeek()) {
            nextWeek++;
            nextDay = 1;
        }
        
        // 判断计划是否已完成
        boolean isCompleted = nextWeek > plan.getDurationWeeks();
        
        // 更新用户计划
        LambdaUpdateWrapper<UserWorkoutPlan> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserWorkoutPlan::getId, userPlanId)
                    .set(UserWorkoutPlan::getCompletionRate, completedRatio);
        
        if (!isCompleted) {
            updateWrapper.set(UserWorkoutPlan::getCurrentWeek, nextWeek)
                         .set(UserWorkoutPlan::getCurrentDay, nextDay);
        } else {
            updateWrapper.set(UserWorkoutPlan::getStatus, 2) // 已完成
                         .set(UserWorkoutPlan::getCompletionRate, BigDecimal.ONE);
        }
        
        return update(updateWrapper);
    }

    @Override
    public boolean abandonPlan(Long userPlanId) {
        LambdaUpdateWrapper<UserWorkoutPlan> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserWorkoutPlan::getId, userPlanId)
                    .eq(UserWorkoutPlan::getStatus, 1) // 只能放弃进行中的计划
                    .set(UserWorkoutPlan::getStatus, 3); // 已放弃
        
        return update(updateWrapper);
    }

    @Override
    public boolean completePlan(Long userPlanId) {
        LambdaUpdateWrapper<UserWorkoutPlan> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserWorkoutPlan::getId, userPlanId)
                    .eq(UserWorkoutPlan::getStatus, 1) // 只能完成进行中的计划
                    .set(UserWorkoutPlan::getStatus, 2) // 已完成
                    .set(UserWorkoutPlan::getCompletionRate, BigDecimal.ONE);
        
        return update(updateWrapper);
    }
} 