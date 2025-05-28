package com.eat2fit.diet.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.diet.entity.Food;

import java.util.List;

/**
 * 食物服务接口
 */
public interface FoodService extends IService<Food> {
    
    /**
     * 分页获取食物列表
     * @param page 分页参数
     * @param category 食物类别
     * @param keyword 关键词
     * @return 食物分页列表
     */
    Page<Food> pageList(Page<Food> page, String category, String keyword);
    
    /**
     * 获取所有食物分类
     * @return 分类列表
     */
    List<String> getAllCategories();
} 
 