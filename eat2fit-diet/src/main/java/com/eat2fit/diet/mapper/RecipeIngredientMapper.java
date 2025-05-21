package com.eat2fit.diet.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.diet.entity.RecipeIngredient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 食谱食材Mapper接口
 */
@Mapper
public interface RecipeIngredientMapper extends BaseMapper<RecipeIngredient> {
    
    /**
     * 批量保存食谱食材
     * @param recipeId 食谱ID
     * @param ingredients 食材列表
     * @return 影响行数
     */
    int batchSave(@Param("recipeId") Long recipeId, @Param("list") List<RecipeIngredient> ingredients);
} 