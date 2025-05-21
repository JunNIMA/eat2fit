package com.eat2fit.diet.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.diet.entity.UserRecipeFavorite;

import java.util.Map;

/**
 * 用户收藏服务接口
 */
public interface UserRecipeFavoriteService extends IService<UserRecipeFavorite> {
    
    /**
     * 添加收藏
     * @param userId 用户ID
     * @param recipeId 食谱ID
     * @return 是否成功
     */
    boolean addFavorite(Long userId, Long recipeId);
    
    /**
     * 取消收藏
     * @param userId 用户ID
     * @param recipeId 食谱ID
     * @return 是否成功
     */
    boolean cancelFavorite(Long userId, Long recipeId);
    
    /**
     * 检查是否已收藏
     * @param userId 用户ID
     * @param recipeId 食谱ID
     * @return 是否已收藏
     */
    boolean isFavorite(Long userId, Long recipeId);
    
    /**
     * 获取用户收藏的食谱列表
     * @param userId 用户ID
     * @param page 分页参数
     * @return 收藏食谱分页列表
     */
    Page<Map<String, Object>> getFavoriteRecipes(Long userId, Page<UserRecipeFavorite> page);
} 