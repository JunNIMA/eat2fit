package com.eat2fit.diet.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.diet.entity.Recipe;
import com.eat2fit.diet.entity.RecipeIngredient;
import com.eat2fit.diet.mapper.RecipeIngredientMapper;
import com.eat2fit.diet.mapper.RecipeMapper;
import com.eat2fit.diet.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 食谱服务实现类
 */
@Service
public class RecipeServiceImpl extends ServiceImpl<RecipeMapper, Recipe> implements RecipeService {

    @Autowired
    private RecipeIngredientMapper ingredientMapper;

    @Override
    public Page<Recipe> pageList(Page<Recipe> page, Integer fitnessGoal, String mealType, Integer difficulty, String keyword) {
        LambdaQueryWrapper<Recipe> queryWrapper = new LambdaQueryWrapper<>();
        
        // 设置状态为正常
        queryWrapper.eq(Recipe::getStatus, 1);
        
        // 按健身目标查询
        if (fitnessGoal != null) {
            queryWrapper.eq(Recipe::getFitnessGoal, fitnessGoal);
        }
        
        // 按餐食类型查询
        if (StringUtils.hasText(mealType)) {
            queryWrapper.like(Recipe::getMealType, mealType);
        }
        
        // 按难度查询
        if (difficulty != null) {
            queryWrapper.eq(Recipe::getDifficulty, difficulty);
        }
        
        // 按关键词查询
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> 
                wrapper.like(Recipe::getTitle, keyword)
                    .or()
                    .like(Recipe::getDescription, keyword)
                    .or()
                    .like(Recipe::getTags, keyword)
            );
        }
        
        // 排序
        queryWrapper.orderByDesc(Recipe::getCreateTime);
        
        return page(page, queryWrapper);
    }

    @Override
    public Recipe getRecipeDetail(Long id) {
        return getById(id);
    }

    @Override
    public List<RecipeIngredient> getRecipeIngredients(Long recipeId) {
        LambdaQueryWrapper<RecipeIngredient> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(RecipeIngredient::getRecipeId, recipeId);
        return ingredientMapper.selectList(queryWrapper);
    }

    @Override
    public boolean increaseViewCount(Long id) {
        return baseMapper.increaseViewCount(id) > 0;
    }

    @Override
    public boolean like(Long id, boolean isLike) {
        return baseMapper.updateLikeCount(id, isLike) > 0;
    }

    @Override
    public List<Recipe> getRecommendRecipes(Long userId, Integer limit) {
        // 简单实现，返回最新的几个食谱作为推荐
        LambdaQueryWrapper<Recipe> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Recipe::getStatus, 1)
                .orderByDesc(Recipe::getCreateTime)
                .last("LIMIT " + limit);
        return list(queryWrapper);
    }
} 