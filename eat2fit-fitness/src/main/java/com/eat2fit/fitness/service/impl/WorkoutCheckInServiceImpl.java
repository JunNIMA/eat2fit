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
import java.util.HashMap;
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
        
        // 查询用户总打卡次数
        LambdaQueryWrapper<WorkoutCheckIn> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutCheckIn::getUserId, userId);
        long totalCheckIns = baseMapper.selectCount(queryWrapper);
        stats.put("totalCheckIns", totalCheckIns);
        
        // 查询最近30天打卡次数
        LambdaQueryWrapper<WorkoutCheckIn> recentQueryWrapper = new LambdaQueryWrapper<>();
        recentQueryWrapper.eq(WorkoutCheckIn::getUserId, userId)
                         .ge(WorkoutCheckIn::getCheckInDate, LocalDate.now().minusDays(30));
        long recentCheckIns = baseMapper.selectCount(recentQueryWrapper);
        stats.put("recentCheckIns", recentCheckIns);
        
        // 查询连续打卡天数（简化实现）
        int consecutiveDays = 0;
        LocalDate checkDate = LocalDate.now();
        
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
        
        stats.put("consecutiveDays", consecutiveDays);
        
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
        
        return baseMapper.selectCount(queryWrapper) > 0;
    }
} 