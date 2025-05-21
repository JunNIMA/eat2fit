package com.eat2fit.diet.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.diet.entity.Food;
import org.apache.ibatis.annotations.Mapper;

/**
 * 食物Mapper接口
 */
@Mapper
public interface FoodMapper extends BaseMapper<Food> {
} 