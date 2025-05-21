package com.eat2fit.diet.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.diet.dto.FavoriteDTO;
import com.eat2fit.diet.entity.Recipe;
import com.eat2fit.diet.entity.UserRecipeFavorite;
import com.eat2fit.diet.service.UserRecipeFavoriteService;
import com.eat2fit.diet.vo.FavoriteRecipeVO;
import com.eat2fit.diet.vo.RecipeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.eat2fit.common.util.UserContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 用户收藏控制器
 */
@RestController
@RequestMapping("/diet/favorites")
@Tag(name = "用户食谱收藏接口", description = "提供用户食谱收藏相关接口")
public class UserRecipeFavoriteController {

    @Autowired
    private UserRecipeFavoriteService favoriteService;

    @PostMapping("/add")
    @Operation(summary = "添加收藏", description = "用户添加食谱收藏")
    public Result<Boolean> addFavorite(@RequestBody FavoriteDTO favoriteDTO) {
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.addFavorite(userId, favoriteDTO.getRecipeId());
        return Result.success(result);
    }

    @PostMapping("/cancel")
    @Operation(summary = "取消收藏", description = "用户取消食谱收藏")
    public Result<Boolean> cancelFavorite(@RequestBody FavoriteDTO favoriteDTO) {
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.cancelFavorite(userId, favoriteDTO.getRecipeId());
        return Result.success(result);
    }

    @GetMapping("/check")
    @Operation(summary = "检查收藏", description = "检查用户是否已收藏食谱")
    public Result<Boolean> checkFavorite(
            @Parameter(description = "食谱ID") @RequestParam Long recipeId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.isFavorite(userId, recipeId);
        return Result.success(result);
    }

    @GetMapping("/list")
    @Operation(summary = "收藏列表", description = "获取用户收藏的食谱列表")
    public Result<Page<FavoriteRecipeVO>> getFavoriteRecipes(
            @Parameter(description = "当前页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<UserRecipeFavorite> page = new Page<>(current, size);
        Page<Map<String, Object>> result = favoriteService.getFavoriteRecipes(userId, page);
        
        // 转换为VO
        Page<FavoriteRecipeVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage, "records");
        
        List<FavoriteRecipeVO> voList = new ArrayList<>();
        for (Map<String, Object> item : result.getRecords()) {
            FavoriteRecipeVO vo = new FavoriteRecipeVO();
            
            // 设置收藏信息
            vo.setFavoriteId((Long) item.get("favoriteId"));
            vo.setFavoriteTime((java.time.LocalDateTime) item.get("favoriteTime"));
            
            // 设置食谱信息
            Recipe recipe = (Recipe) item.get("recipe");
            if (recipe != null) {
                RecipeVO recipeVO = new RecipeVO();
                BeanUtils.copyProperties(recipe, recipeVO);
                
                // 计算总时长
                if (recipe.getPrepTime() != null && recipe.getCookTime() != null) {
                    recipeVO.setTotalTime(recipe.getPrepTime() + recipe.getCookTime());
                }
                
                // 设置文本描述
                setDifficultyAndGoalText(recipeVO);
                
                vo.setRecipe(recipeVO);
            }
            
            voList.add(vo);
        }
        voPage.setRecords(voList);
        
        return Result.success(voPage);
    }
    
    /**
     * 设置难度和目标的文本描述
     */
    private void setDifficultyAndGoalText(RecipeVO vo) {
        // 设置难度文本
        if (vo.getDifficulty() != null) {
            switch (vo.getDifficulty()) {
                case 1:
                    vo.setDifficultyText("简单");
                    break;
                case 2:
                    vo.setDifficultyText("中等");
                    break;
                case 3:
                    vo.setDifficultyText("复杂");
                    break;
                default:
                    vo.setDifficultyText("未知");
            }
        }
        
        // 设置健身目标文本
        if (vo.getFitnessGoal() != null) {
            switch (vo.getFitnessGoal()) {
                case 1:
                    vo.setFitnessGoalText("增肌");
                    break;
                case 2:
                    vo.setFitnessGoalText("减脂");
                    break;
                case 3:
                    vo.setFitnessGoalText("塑形");
                    break;
                case 4:
                    vo.setFitnessGoalText("维持");
                    break;
                default:
                    vo.setFitnessGoalText("未知");
            }
        }
    }
} 