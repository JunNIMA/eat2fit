package com.eat2fit.diet.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.diet.entity.Recipe;
import com.eat2fit.diet.entity.RecipeIngredient;

import java.util.List;

/**
 * 食谱服务接口
 */
public interface RecipeService extends IService<Recipe> {
    
    /**
     * 分页获取食谱列表
     * @param page 分页参数
     * @param fitnessGoal 健身目标
     * @param mealType 餐食类型
     * @param difficulty 难度
     * @param keyword 关键词
     * @return 食谱分页列表
     */
    Page<Recipe> pageList(Page<Recipe> page, Integer fitnessGoal, String mealType, Integer difficulty, String keyword);
    
    /**
     * 获取食谱详情
     * @param id 食谱ID
     * @return 食谱详情
     */
    Recipe getRecipeDetail(Long id);
    
    /**
     * 获取食谱食材
     * @param recipeId 食谱ID
     * @return 食材列表
     */
    List<RecipeIngredient> getRecipeIngredients(Long recipeId);
    
    /**
     * 增加浏览次数
     * @param id 食谱ID
     * @return 是否成功
     */
    boolean increaseViewCount(Long id);
    
    /**
     * 点赞/取消点赞
     * @param id 食谱ID
     * @param isLike true点赞，false取消点赞
     * @return 是否成功
     */
    boolean like(Long id, boolean isLike);
    
    /**
     * 获取推荐食谱
     * @param userId 用户ID
     * @param limit 数量限制
     * @return 推荐食谱列表
     */
    List<Recipe> getRecommendRecipes(Long userId, Integer limit);
} 