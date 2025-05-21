package com.eat2fit.diet.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.diet.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 食谱Mapper接口
 */
@Mapper
public interface RecipeMapper extends BaseMapper<Recipe> {
    
    /**
     * 增加浏览次数
     * @param id 食谱ID
     * @return 影响行数
     */
    int increaseViewCount(@Param("id") Long id);
    
    /**
     * 增加或减少点赞次数
     * @param id 食谱ID
     * @param increment 是否增加
     * @return 影响行数
     */
    int updateLikeCount(@Param("id") Long id, @Param("increment") boolean increment);
} 