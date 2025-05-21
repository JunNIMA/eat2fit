package com.eat2fit.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;
import com.eat2fit.fitness.mapper.WorkoutPlanMapper;
import com.eat2fit.fitness.service.WorkoutPlanDetailService;
import com.eat2fit.fitness.service.WorkoutPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 训练计划服务实现类
 */
@Service
public class WorkoutPlanServiceImpl extends ServiceImpl<WorkoutPlanMapper, WorkoutPlan> implements WorkoutPlanService {

    @Autowired
    private WorkoutPlanDetailService planDetailService;

    @Override
    public Page<WorkoutPlan> pageList(Page<WorkoutPlan> page, Integer fitnessGoal, Integer difficulty, String keyword) {
        LambdaQueryWrapper<WorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        
        // 构建查询条件
        queryWrapper.eq(WorkoutPlan::getStatus, 1); // 只查询状态正常的计划
        
        if (fitnessGoal != null) {
            queryWrapper.eq(WorkoutPlan::getFitnessGoal, fitnessGoal);
        }
        
        if (difficulty != null) {
            queryWrapper.eq(WorkoutPlan::getDifficulty, difficulty);
        }
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> 
                wrapper.like(WorkoutPlan::getName, keyword)
                       .or()
                       .like(WorkoutPlan::getDescription, keyword)
                       .or()
                       .like(WorkoutPlan::getBodyFocus, keyword)
            );
        }
        
        queryWrapper.orderByDesc(WorkoutPlan::getCreateTime);
        
        return baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public List<WorkoutPlanDetail> getPlanDetails(Long planId) {
        LambdaQueryWrapper<WorkoutPlanDetail> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutPlanDetail::getPlanId, planId)
                   .orderByAsc(WorkoutPlanDetail::getWeekNum)
                   .orderByAsc(WorkoutPlanDetail::getDayNum);
                   
        return planDetailService.list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean savePlanWithDetails(WorkoutPlan plan, List<WorkoutPlanDetail> detailList) {
        // 保存计划基本信息
        boolean saved = save(plan);
        
        if (saved && detailList != null && !detailList.isEmpty()) {
            // 设置计划ID
            for (WorkoutPlanDetail detail : detailList) {
                detail.setPlanId(plan.getId());
            }
            
            // 批量保存计划详情
            planDetailService.saveBatch(detailList);
        }
        
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePlanWithDetails(WorkoutPlan plan, List<WorkoutPlanDetail> detailList) {
        // 更新计划基本信息
        boolean updated = updateById(plan);
        
        if (updated && detailList != null && !detailList.isEmpty()) {
            // 删除原有计划详情
            LambdaQueryWrapper<WorkoutPlanDetail> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(WorkoutPlanDetail::getPlanId, plan.getId());
            planDetailService.remove(queryWrapper);
            
            // 重新设置计划ID并保存新的计划详情
            for (WorkoutPlanDetail detail : detailList) {
                detail.setPlanId(plan.getId());
            }
            
            planDetailService.saveBatch(detailList);
        }
        
        return updated;
    }

    @Override
    public List<WorkoutPlan> getRecommendPlans(Long userId, int limit) {
        // 简单实现：先返回与用户目标匹配的热门计划
        // 实际场景可基于用户历史、偏好等实现复杂推荐算法
        
        // 假设通过远程调用获取了用户的健身目标
        Integer userFitnessGoal = 1; // 默认增肌，实际应从用户服务获取
        
        LambdaQueryWrapper<WorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutPlan::getStatus, 1)
                   .eq(WorkoutPlan::getFitnessGoal, userFitnessGoal)
                   .eq(WorkoutPlan::getIsTemplate, 1) // 只推荐模板计划
                   .last("LIMIT " + limit);
        
        return list(queryWrapper);
    }
} 