package com.eat2fit.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.fitness.entity.UserWorkoutPlan;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户训练计划Mapper接口
 */
@Mapper
public interface UserWorkoutPlanMapper extends BaseMapper<UserWorkoutPlan> {
} 