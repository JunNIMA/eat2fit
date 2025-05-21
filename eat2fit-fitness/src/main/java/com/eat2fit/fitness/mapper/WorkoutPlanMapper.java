package com.eat2fit.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.fitness.entity.WorkoutPlan;
import org.apache.ibatis.annotations.Mapper;

/**
 * 训练计划Mapper接口
 */
@Mapper
public interface WorkoutPlanMapper extends BaseMapper<WorkoutPlan> {
} 