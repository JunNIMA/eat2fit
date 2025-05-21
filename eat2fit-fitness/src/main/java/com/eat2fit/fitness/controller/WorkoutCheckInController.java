package com.eat2fit.fitness.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.response.Result;
import com.eat2fit.fitness.entity.WorkoutCheckIn;
import com.eat2fit.fitness.service.WorkoutCheckInService;
import com.eat2fit.common.util.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * 训练打卡控制器
 */
@RestController
@RequestMapping("/fitness/checkin")
@Tag(name = "训练打卡接口", description = "提供训练打卡相关接口")
public class WorkoutCheckInController {

    @Autowired
    private WorkoutCheckInService checkInService;

    @PostMapping
    @Operation(summary = "训练打卡", description = "用户训练打卡记录")
    public Result<Long> checkIn(@RequestBody WorkoutCheckIn checkIn) {
        try {
            // 从UserContext获取用户ID
            Long userId = UserContext.getUser();
            if (userId == null) {
                return Result.failed("用户未登录");
            }
            
            // 设置用户ID
            checkIn.setUserId(userId);
            
            Long checkInId = checkInService.checkIn(checkIn);
            return Result.success(checkInId);
        } catch (BusinessException e) {
            return Result.failed(e.getCode(), e.getMessage());
        } catch (Exception e) {
            return Result.failed(e.getMessage());
        }
    }

    @GetMapping("/list")
    @Operation(summary = "打卡记录", description = "获取用户的训练打卡记录")
    public Result<Page<WorkoutCheckIn>> getCheckInList(
            @Parameter(description = "开始日期") @RequestParam(required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) 
                @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @Parameter(description = "当前页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<WorkoutCheckIn> page = new Page<>(current, size);
        page = checkInService.getUserCheckIns(userId, startDate, endDate, page);
        
        return Result.success(page);
    }

    @GetMapping("/stats")
    @Operation(summary = "打卡统计", description = "获取用户的训练打卡统计信息")
    public Result<Map<String, Object>> getCheckInStats() {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Map<String, Object> stats = checkInService.getUserCheckInStats(userId);
        return Result.success(stats);
    }

    @GetMapping("/check")
    @Operation(summary = "检查打卡", description = "检查用户今天是否已打卡")
    public Result<Boolean> hasCheckedInToday(
            @Parameter(description = "用户计划ID") @RequestParam(required = false) Long userPlanId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        boolean checked = checkInService.hasCheckedInToday(userId, userPlanId);
        return Result.success(checked);
    }
} 