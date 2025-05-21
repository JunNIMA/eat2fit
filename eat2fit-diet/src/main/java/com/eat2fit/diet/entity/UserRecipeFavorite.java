package com.eat2fit.diet.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户食谱收藏实体类
 */
@Data
@TableName("user_recipe_favorite")
public class UserRecipeFavorite implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 食谱ID
     */
    private Long recipeId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
} 