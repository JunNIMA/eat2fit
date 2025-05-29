package com.eat2fit.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.exception.ErrorCode;
import com.eat2fit.fitness.entity.WorkoutCheckIn;
import com.eat2fit.fitness.mapper.WorkoutCheckInMapper;
import com.eat2fit.fitness.service.UserWorkoutPlanService;
import com.eat2fit.fitness.service.WorkoutCheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 训练打卡记录服务实现类
 */
@Service
public class WorkoutCheckInServiceImpl extends ServiceImpl<WorkoutCheckInMapper, WorkoutCheckIn> implements WorkoutCheckInService {

    @Autowired
    private UserWorkoutPlanService userPlanService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long checkIn(WorkoutCheckIn checkIn) {
        // 设置打卡日期为当天
        if (checkIn.getCheckInDate() == null) {
            checkIn.setCheckInDate(LocalDate.now());
        }
        
        // 检查是否已打卡
        if (hasCheckedInToday(checkIn.getUserId(), checkIn.getUserPlanId())) {
            throw new BusinessException(ErrorCode.FITNESS_CHECK_IN_DUPLICATE);
        }
        
        // 保存打卡记录
        save(checkIn);
        
        // 如果关联了用户计划，更新计划进度
        if (checkIn.getUserPlanId() != null) {
            userPlanService.updatePlanProgress(checkIn.getUserPlanId(), true);
        }
        
        return checkIn.getId();
    }

    @Override
    public Page<WorkoutCheckIn> getUserCheckIns(Long userId, LocalDate startDate, LocalDate endDate, Page<WorkoutCheckIn> page) {
        LambdaQueryWrapper<WorkoutCheckIn> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutCheckIn::getUserId, userId);
        
        if (startDate != null) {
            queryWrapper.ge(WorkoutCheckIn::getCheckInDate, startDate);
        }
        
        if (endDate != null) {
            queryWrapper.le(WorkoutCheckIn::getCheckInDate, endDate);
        }
        
        queryWrapper.orderByDesc(WorkoutCheckIn::getCheckInDate);
        
        return baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public Map<String, Object> getUserCheckInStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取当前日期
        LocalDate today = LocalDate.now();
        
        // 查询用户总打卡次数
        LambdaQueryWrapper<WorkoutCheckIn> totalQueryWrapper = new LambdaQueryWrapper<>();
        totalQueryWrapper.eq(WorkoutCheckIn::getUserId, userId);
        long totalCheckIns = baseMapper.selectCount(totalQueryWrapper);
        stats.put("totalCount", totalCheckIns);
        
        // 查询本周打卡次数（周一到周日）
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        
        LambdaQueryWrapper<WorkoutCheckIn> weekQueryWrapper = new LambdaQueryWrapper<>();
        weekQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                       .ge(WorkoutCheckIn::getCheckInDate, startOfWeek)
                       .le(WorkoutCheckIn::getCheckInDate, endOfWeek);
        long thisWeekCount = baseMapper.selectCount(weekQueryWrapper);
        stats.put("thisWeekCount", thisWeekCount);
        
        // 查询本月打卡次数
        YearMonth yearMonth = YearMonth.from(today);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();
        
        LambdaQueryWrapper<WorkoutCheckIn> monthQueryWrapper = new LambdaQueryWrapper<>();
        monthQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                        .ge(WorkoutCheckIn::getCheckInDate, startOfMonth)
                        .le(WorkoutCheckIn::getCheckInDate, endOfMonth);
        long thisMonthCount = baseMapper.selectCount(monthQueryWrapper);
        stats.put("thisMonthCount", thisMonthCount);
        
        // 查询最近30天打卡次数
        LambdaQueryWrapper<WorkoutCheckIn> recentQueryWrapper = new LambdaQueryWrapper<>();
        recentQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                         .ge(WorkoutCheckIn::getCheckInDate, today.minusDays(30));
        long recentCheckIns = baseMapper.selectCount(recentQueryWrapper);
        stats.put("recentCheckIns", recentCheckIns);
        
        // 查询连续打卡天数
        int consecutiveDays = 0;
        LocalDate checkDate = today;
        
        while (true) {
            LambdaQueryWrapper<WorkoutCheckIn> dayQueryWrapper = new LambdaQueryWrapper<>();
            dayQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                          .eq(WorkoutCheckIn::getCheckInDate, checkDate);
            
            if (baseMapper.selectCount(dayQueryWrapper) > 0) {
                consecutiveDays++;
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }
        
        stats.put("continuousCount", consecutiveDays);
        
        // 计算累计训练时长和消耗卡路里
        LambdaQueryWrapper<WorkoutCheckIn> statsQueryWrapper = new LambdaQueryWrapper<>();
        statsQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                        .select(WorkoutCheckIn::getDuration, WorkoutCheckIn::getCalorieConsumption);
        
        List<WorkoutCheckIn> checkIns = baseMapper.selectList(statsQueryWrapper);
        
        long totalDuration = 0;
        long totalCalories = 0;
        
        for (WorkoutCheckIn checkIn : checkIns) {
            if (checkIn.getDuration() != null) {
                totalDuration += checkIn.getDuration();
            }
            
            if (checkIn.getCalorieConsumption() != null) {
                totalCalories += checkIn.getCalorieConsumption();
            }
        }
        
        stats.put("totalDuration", totalDuration);
        stats.put("totalCalories", totalCalories);
        
        return stats;
    }

    @Override
    public boolean hasCheckedInToday(Long userId, Long userPlanId) {
        LambdaQueryWrapper<WorkoutCheckIn> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                   .eq(WorkoutCheckIn::getCheckInDate, LocalDate.now());

        if (userPlanId != null) {
            queryWrapper.eq(WorkoutCheckIn::getUserPlanId, userPlanId);
        }

            return false;
    }
} 