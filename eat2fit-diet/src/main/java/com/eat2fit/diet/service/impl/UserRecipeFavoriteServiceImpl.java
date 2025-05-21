package com.eat2fit.diet.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.diet.entity.Recipe;
import com.eat2fit.diet.entity.UserRecipeFavorite;
import com.eat2fit.diet.mapper.RecipeMapper;
import com.eat2fit.diet.mapper.UserRecipeFavoriteMapper;
import com.eat2fit.diet.service.UserRecipeFavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户收藏服务实现类
 */
@Service
public class UserRecipeFavoriteServiceImpl extends ServiceImpl<UserRecipeFavoriteMapper, UserRecipeFavorite> implements UserRecipeFavoriteService {

    @Autowired
    private RecipeMapper recipeMapper;

    @Override
    public boolean addFavorite(Long userId, Long recipeId) {
        // 检查是否已收藏
        if (isFavorite(userId, recipeId)) {
            return true;
        }
        
        // 创建收藏记录
        UserRecipeFavorite favorite = new UserRecipeFavorite();
        favorite.setUserId(userId);
        favorite.setRecipeId(recipeId);
        favorite.setCreateTime(LocalDateTime.now());
        
        return save(favorite);
    }

    @Override
    public boolean cancelFavorite(Long userId, Long recipeId) {
        LambdaQueryWrapper<UserRecipeFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserRecipeFavorite::getUserId, userId)
                   .eq(UserRecipeFavorite::getRecipeId, recipeId);
        
        return remove(queryWrapper);
    }

    @Override
    public boolean isFavorite(Long userId, Long recipeId) {
        LambdaQueryWrapper<UserRecipeFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserRecipeFavorite::getUserId, userId)
                   .eq(UserRecipeFavorite::getRecipeId, recipeId);
        
        return count(queryWrapper) > 0;
    }

    @Override
    public Page<Map<String, Object>> getFavoriteRecipes(Long userId, Page<UserRecipeFavorite> page) {
        // 查询用户收藏
        LambdaQueryWrapper<UserRecipeFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserRecipeFavorite::getUserId, userId)
                   .orderByDesc(UserRecipeFavorite::getCreateTime);
        
        Page<UserRecipeFavorite> favoriteList = page(page, queryWrapper);
        
        // 构建结果
        Page<Map<String, Object>> resultPage = new Page<>();
        resultPage.setCurrent(favoriteList.getCurrent());
        resultPage.setSize(favoriteList.getSize());
        resultPage.setTotal(favoriteList.getTotal());
        resultPage.setPages(favoriteList.getPages());
        
        List<Map<String, Object>> records = new ArrayList<>();
        for (UserRecipeFavorite favorite : favoriteList.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            
            // 收藏信息
            map.put("favoriteId", favorite.getId());
            map.put("favoriteTime", favorite.getCreateTime());
            
            // 食谱信息
            Recipe recipe = recipeMapper.selectById(favorite.getRecipeId());
            if (recipe != null) {
                map.put("recipe", recipe);
            }
            
            records.add(map);
        }
        
        resultPage.setRecords(records);
        return resultPage;
    }
} 