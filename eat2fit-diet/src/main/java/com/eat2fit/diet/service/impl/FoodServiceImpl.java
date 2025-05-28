package com.eat2fit.diet.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.diet.entity.Food;
import com.eat2fit.diet.mapper.FoodMapper;
import com.eat2fit.diet.service.FoodService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 食物服务实现类
 */
@Service
public class FoodServiceImpl extends ServiceImpl<FoodMapper, Food> implements FoodService {

    @Override
    public Page<Food> pageList(Page<Food> page, String category, String keyword) {
        LambdaQueryWrapper<Food> queryWrapper = new LambdaQueryWrapper<>();
        
        // 构建查询条件
        queryWrapper.eq(Food::getStatus, 1); // 只查询状态正常的食物
        
        if (StringUtils.hasText(category)) {
            queryWrapper.eq(Food::getCategory, category);
        }
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> 
                wrapper.like(Food::getName, keyword)
                       .or()
                       .like(Food::getCategory, keyword)
            );
        }
        
        queryWrapper.orderByDesc(Food::getCreateTime);
        
        return baseMapper.selectPage(page, queryWrapper);
    }
    
    @Override
    public List<String> getAllCategories() {
        QueryWrapper<Food> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("DISTINCT category")
                   .isNotNull("category")
                   .eq("status", 1);
        
        List<Object> categories = listObjs(queryWrapper);
        
        List<String> result = categories.stream()
                .map(obj -> obj != null ? obj.toString() : null)
                .filter(s -> s != null && !s.isEmpty())
                .collect(Collectors.toList());
        
        return result;
    }
} 