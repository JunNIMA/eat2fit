package com.eat2fit.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.fitness.entity.UserFavorite;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户收藏Mapper接口
 */
@Mapper
public interface UserFavoriteMapper extends BaseMapper<UserFavorite> {
} 