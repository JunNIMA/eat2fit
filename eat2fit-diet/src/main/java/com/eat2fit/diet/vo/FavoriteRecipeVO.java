package com.eat2fit.diet.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户收藏食谱视图对象
 */
@Data
public class FavoriteRecipeVO {

    /**
     * 收藏ID
     */
    private Long favoriteId;

    /**
     * 收藏时间
     */
    private LocalDateTime favoriteTime;

    /**
     * 食谱信息
     */
    private RecipeVO recipe;
} 