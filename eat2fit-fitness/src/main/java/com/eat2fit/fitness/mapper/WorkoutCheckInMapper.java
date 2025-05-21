package com.eat2fit.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.fitness.entity.WorkoutCheckIn;
import org.apache.ibatis.annotations.Mapper;

/**
 * 训练打卡记录Mapper接口
 */
@Mapper
public interface WorkoutCheckInMapper extends BaseMapper<WorkoutCheckIn> {
} 