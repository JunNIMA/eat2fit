package com.eat2fit.diet.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.diet.entity.Food;
import com.eat2fit.diet.mapper.FoodMapper;
import com.eat2fit.diet.service.FoodService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 食物服务实现类
 */
@Service
public class FoodServiceImpl extends ServiceImpl<FoodMapper, Food> implements FoodService {

    @Override
    public Page<Food> pageList(Page<Food> page, String category, String keyword) {
        LambdaQueryWrapper<Food> queryWrapper = new LambdaQueryWrapper<>();
        
        // 设置状态为正常
        queryWrapper.eq(Food::getStatus, 1);
        
        // 按类别查询
        if (StringUtils.hasText(category)) {
            queryWrapper.eq(Food::getCategory, category);
        }
        
        // 按关键词查询
        if (StringUtils.hasText(keyword)) {
            queryWrapper.like(Food::getName, keyword);
        }
        
        // 排序
        queryWrapper.orderByDesc(Food::getCreateTime);
        
        return page(page, queryWrapper);
    }
} 