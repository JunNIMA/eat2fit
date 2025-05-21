package com.eat2fit.diet.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.diet.entity.UserRecipeFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户收藏Mapper接口
 */
@Mapper
public interface UserRecipeFavoriteMapper extends BaseMapper<UserRecipeFavorite> {
} 