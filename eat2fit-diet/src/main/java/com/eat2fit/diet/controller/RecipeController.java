package com.eat2fit.diet.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.common.util.AliyunOSSOperator;
import com.eat2fit.diet.dto.RecipeQueryDTO;
import com.eat2fit.diet.entity.Food;
import com.eat2fit.diet.entity.Recipe;
import com.eat2fit.diet.entity.RecipeIngredient;
import com.eat2fit.diet.service.FoodService;
import com.eat2fit.diet.service.RecipeService;
import com.eat2fit.diet.service.UserRecipeFavoriteService;
import com.eat2fit.diet.vo.FoodVO;
import com.eat2fit.diet.vo.RecipeDetailVO;
import com.eat2fit.diet.vo.RecipeIngredientVO;
import com.eat2fit.diet.vo.RecipeVO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import com.eat2fit.common.util.UserContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 食谱控制器
 */
@Slf4j
@RestController
@RequestMapping("/diet/recipes")
@Tag(name = "食谱接口", description = "提供食谱相关接口")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;
    
    @Autowired
    private FoodService foodService;
    
    @Autowired
    private UserRecipeFavoriteService favoriteService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private AliyunOSSOperator aliyunOSSOperator;

    @GetMapping("/page")
    @Operation(summary = "分页查询食谱", description = "根据条件分页查询食谱列表")
    public Result<Page<RecipeVO>> pageList(@Parameter(description = "查询参数") RecipeQueryDTO queryDTO) {
        Page<Recipe> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        page = recipeService.pageList(page, queryDTO.getFitnessGoal(), 
                                   queryDTO.getMealType(), queryDTO.getDifficulty(), 
                                   queryDTO.getKeyword());
        
        // 转换为VO
        Page<RecipeVO> resultPage = new Page<>();
        BeanUtils.copyProperties(page, resultPage, "records");
        
        List<RecipeVO> voList = new ArrayList<>();
        for (Recipe recipe : page.getRecords()) {
            RecipeVO vo = new RecipeVO();
            BeanUtils.copyProperties(recipe, vo);
            
            // 计算总时长
            if (recipe.getPrepTime() != null && recipe.getCookTime() != null) {
                vo.setTotalTime(recipe.getPrepTime() + recipe.getCookTime());
            }
            
            // 设置文本描述
            setDifficultyAndGoalText(vo);
            
            voList.add(vo);
        }
        resultPage.setRecords(voList);
        
        return Result.success(resultPage);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取食谱详情", description = "根据ID获取食谱详情")
    public Result<RecipeDetailVO> getDetail(
            @Parameter(description = "食谱ID") @PathVariable Long id) {
        
        Recipe recipe = recipeService.getById(id);
        if (recipe == null) {
            return Result.failed("食谱不存在");
        }
        
        // 增加观看次数
        recipeService.increaseViewCount(id);
        
        // 转换为VO
        RecipeDetailVO vo = new RecipeDetailVO();
        BeanUtils.copyProperties(recipe, vo);
        
        // 计算总时长
        if (recipe.getPrepTime() != null && recipe.getCookTime() != null) {
            vo.setTotalTime(recipe.getPrepTime() + recipe.getCookTime());
        }
        
        // 设置文本描述
        setDifficultyAndGoalText(vo);
        
        // 设置标签列表
        if (StringUtils.hasText(recipe.getTags())) {
            vo.setTagList(Arrays.asList(recipe.getTags().split(",")));
        } else {
            vo.setTagList(new ArrayList<>());
        }
        
        // 从UserContext获取用户ID并设置是否已收藏
        Long userId = UserContext.getUser();
        if (userId != null) {
            boolean isFavorite = favoriteService.isFavorite(userId, id);
            vo.setIsFavorite(isFavorite);
        }
        
        // 获取食谱的食材列表
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(id);
        List<RecipeIngredientVO> ingredientVOList = new ArrayList<>();
        
        for (RecipeIngredient ingredient : ingredients) {
            RecipeIngredientVO ingredientVO = new RecipeIngredientVO();
            BeanUtils.copyProperties(ingredient, ingredientVO);
            
            // 如果有关联食物ID，获取食物详情
            if (ingredient.getFoodId() != null) {
                Food food = foodService.getById(ingredient.getFoodId());
                if (food != null) {
                    FoodVO foodVO = new FoodVO();
                    BeanUtils.copyProperties(food, foodVO);
                    ingredientVO.setFood(foodVO);
                }
            }
            
            ingredientVOList.add(ingredientVO);
        }
        vo.setIngredients(ingredientVOList);
        
        // 设置烹饪步骤
        if (StringUtils.hasText(recipe.getSteps())) {
            try {
                List<Map<String, Object>> stepsList = objectMapper.readValue(recipe.getSteps(), 
                        new TypeReference<List<Map<String, Object>>>() {});
                vo.setSteps(stepsList);
            } catch (JsonProcessingException e) {
                log.error("解析烹饪步骤失败", e);
                vo.setSteps(new ArrayList<>());
            }
        } else {
            vo.setSteps(new ArrayList<>());
        }
        
        return Result.success(vo);
    }

    @GetMapping("/recommend")
    @Operation(summary = "推荐食谱", description = "获取推荐食谱列表")
    public Result<List<RecipeVO>> recommendRecipes(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "6") Integer limit) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        List<Recipe> recipes = recipeService.getRecommendRecipes(userId, limit);
        
        // 转换为VO
        List<RecipeVO> voList = new ArrayList<>();
        for (Recipe recipe : recipes) {
            RecipeVO vo = new RecipeVO();
            BeanUtils.copyProperties(recipe, vo);
            
            // 计算总时长
            if (recipe.getPrepTime() != null && recipe.getCookTime() != null) {
                vo.setTotalTime(recipe.getPrepTime() + recipe.getCookTime());
            }
            
            setDifficultyAndGoalText(vo);
            
            // 设置是否已收藏
            boolean isFavorite = favoriteService.isFavorite(userId, recipe.getId());
            vo.setIsFavorite(isFavorite);
            
            voList.add(vo);
        }
        
        return Result.success(voList);
    }
    
    /**
     * 以下是管理接口，需要管理员权限
     */
    
    @PostMapping
    @Operation(summary = "添加食谱", description = "添加新的食谱")
    public Result<Boolean> addRecipe(@RequestBody Recipe recipe) {
        boolean saved = recipeService.save(recipe);
        return Result.success(saved);
    }
    
    @PutMapping
    @Operation(summary = "更新食谱", description = "更新已有食谱")
    public Result<Boolean> updateRecipe(@RequestBody Recipe recipe) {
        boolean updated = recipeService.updateById(recipe);
        return Result.success(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除食谱", description = "删除指定食谱")
    public Result<Boolean> deleteRecipe(@PathVariable Long id) {
        boolean removed = recipeService.removeById(id);
        return Result.success(removed);
    }
    
    /**
     * 上传食谱封面图片
     */
    @PostMapping("/upload/cover")
    @Operation(summary = "上传封面图片", description = "上传食谱封面图片")
    public Result<String> uploadCoverImage(MultipartFile file) throws Exception {
        log.info("上传食谱封面图片: {}", file.getOriginalFilename());
        // 上传文件到阿里云OSS
        String fileUrl = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
        log.info("上传封面图片成功，OSS URL: {}", fileUrl);
        return Result.success(fileUrl);
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
        
        // 设置目标文本
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
    
    /**
     * 为DetailVO设置难度和目标的文本描述
     */
    private void setDifficultyAndGoalText(RecipeDetailVO vo) {
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
        
        // 设置目标文本
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