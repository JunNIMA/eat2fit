package com.eat2fit.fitness.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.fitness.entity.UserFavorite;
import com.eat2fit.fitness.service.UserFavoriteService;
import com.eat2fit.common.util.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户课程收藏控制器
 */
@RestController
@RequestMapping("/fitness/favorites")
@Tag(name = "用户收藏接口", description = "提供用户收藏相关接口")
public class UserFavoriteController {

    @Autowired
    private UserFavoriteService favoriteService;

    @PostMapping("/add")
    @Operation(summary = "添加收藏", description = "用户添加收藏")
    public Result<Boolean> addFavorite(
            @Parameter(description = "类型 1:课程 2:计划") @RequestParam Integer type,
            @Parameter(description = "目标ID") @RequestParam Long targetId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.addFavorite(userId, type, targetId);
        return Result.success(result);
    }

    @PostMapping("/cancel")
    @Operation(summary = "取消收藏", description = "用户取消收藏")
    public Result<Boolean> cancelFavorite(
            @Parameter(description = "类型 1:课程 2:计划") @RequestParam Integer type,
            @Parameter(description = "目标ID") @RequestParam Long targetId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.cancelFavorite(userId, type, targetId);
        return Result.success(result);
    }

    @GetMapping("/check")
    @Operation(summary = "检查收藏", description = "检查用户是否已收藏")
    public Result<Boolean> checkFavorite(
            @Parameter(description = "类型 1:课程 2:计划") @RequestParam Integer type,
            @Parameter(description = "目标ID") @RequestParam Long targetId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean result = favoriteService.isFavorite(userId, type, targetId);
        return Result.success(result);
    }

    @GetMapping("/courses")
    @Operation(summary = "收藏课程", description = "获取用户收藏的课程列表")
    public Result<Page<Map<String, Object>>> getFavoriteCourses(
            @Parameter(description = "当前页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<UserFavorite> page = new Page<>(current, size);
        Page<Map<String, Object>> result = favoriteService.getFavoriteCourses(userId, page);
        
        return Result.success(result);
    }

    @GetMapping("/plans")
    @Operation(summary = "收藏计划", description = "获取用户收藏的计划列表")
    public Result<Page<Map<String, Object>>> getFavoritePlans(
            @Parameter(description = "当前页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<UserFavorite> page = new Page<>(current, size);
        Page<Map<String, Object>> result = favoriteService.getFavoritePlans(userId, page);
        
        return Result.success(result);
    }
} 