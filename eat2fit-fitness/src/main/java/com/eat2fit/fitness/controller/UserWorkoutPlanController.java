package com.eat2fit.fitness.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.exception.ErrorCode;
import com.eat2fit.common.response.Result;
import com.eat2fit.fitness.dto.UserPlanDTO;
import com.eat2fit.fitness.entity.UserWorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;
import com.eat2fit.fitness.service.UserWorkoutPlanService;
import com.eat2fit.fitness.service.WorkoutCourseService;
import com.eat2fit.fitness.service.WorkoutPlanService;
import com.eat2fit.fitness.vo.CourseVO;
import com.eat2fit.fitness.vo.PlanDetailVO;
import com.eat2fit.fitness.vo.PlanVO;
import com.eat2fit.fitness.vo.UserPlanVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.eat2fit.common.util.UserContext;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 用户训练计划控制器
 */
@RestController
@RequestMapping("/fitness/plans")
@Tag(name = "用户训练计划接口", description = "提供用户训练计划相关接口")
public class UserWorkoutPlanController {

    @Autowired
    private UserWorkoutPlanService userPlanService;
    
    @Autowired
    private WorkoutPlanService planService;
    
    @Autowired
    private WorkoutCourseService courseService;

    @GetMapping("/list")
    @Operation(summary = "用户计划列表", description = "获取用户的训练计划列表")
    public Result<Page<UserPlanVO>> getUserPlanList(
            @Parameter(description = "计划状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "当前页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<UserWorkoutPlan> page = new Page<>(current, size);
        Page<Map<String, Object>> originPage = userPlanService.getUserPlanList(userId, status, page);
        
        // 转换为VO
        Page<UserPlanVO> resultPage = new Page<>();
        BeanUtils.copyProperties(originPage, resultPage, "records");
        
        List<UserPlanVO> voList = new ArrayList<>();
        for (Map<String, Object> item : originPage.getRecords()) {
            UserWorkoutPlan userPlan = (UserWorkoutPlan) item.get("userPlan");
            WorkoutPlan plan = (WorkoutPlan) item.get("plan");
            
            UserPlanVO vo = new UserPlanVO();
            BeanUtils.copyProperties(userPlan, vo);
            
            // 设置计划信息
            if (plan != null) {
                PlanVO planVO = new PlanVO();
                BeanUtils.copyProperties(plan, planVO);
                setDifficultyAndGoalText(planVO);
                
                // 计算总训练天数
                if (plan.getDurationWeeks() != null && plan.getSessionsPerWeek() != null) {
                    planVO.setTotalDays(plan.getDurationWeeks() * plan.getSessionsPerWeek());
                }
                
                vo.setPlan(planVO);
            }
            
            // 设置状态文本
            setStatusText(vo);
            
            // 格式化进度百分比
            if (vo.getCompletionRate() != null) {
                vo.setProgressPercent(vo.getCompletionRate().multiply(new BigDecimal(100))
                        .setScale(0, RoundingMode.DOWN) + "%");
            }
            
            voList.add(vo);
        }
        resultPage.setRecords(voList);
        
        return Result.success(resultPage);
    }

    @PostMapping("/choose")
    @Operation(summary = "选择计划", description = "用户选择一个训练计划")
    public Result<Long> choosePlan(@RequestBody UserPlanDTO planDTO) {
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Long userPlanId = userPlanService.choosePlan(userId, planDTO.getPlanId());
        return Result.success(userPlanId);
    }

    @GetMapping("/current")
    @Operation(summary = "当前计划", description = "获取用户当前进行中的计划")
    public Result<UserPlanVO> getCurrentPlan() {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Map<String, Object> planInfo = userPlanService.getCurrentPlan(userId);
        if (planInfo == null) {
            return Result.failed("当前没有进行中的计划");
        }
        
        // 转换为VO
        UserWorkoutPlan userPlan = (UserWorkoutPlan) planInfo.get("userPlan");
        WorkoutPlan plan = (WorkoutPlan) planInfo.get("plan");
        @SuppressWarnings("unchecked")
        List<WorkoutPlanDetail> planDetails = (List<WorkoutPlanDetail>) planInfo.get("planDetails");
        
        UserPlanVO vo = new UserPlanVO();
        BeanUtils.copyProperties(userPlan, vo);
        
        // 设置计划信息
        if (plan != null) {
            PlanVO planVO = new PlanVO();
            BeanUtils.copyProperties(plan, planVO);
            setDifficultyAndGoalText(planVO);
            
            // 计算总训练天数
            if (plan.getDurationWeeks() != null && plan.getSessionsPerWeek() != null) {
                planVO.setTotalDays(plan.getDurationWeeks() * plan.getSessionsPerWeek());
            }
            
            vo.setPlan(planVO);
        }
        
        // 设置状态文本
        setStatusText(vo);
        
        // 格式化进度百分比
        if (vo.getCompletionRate() != null) {
            vo.setProgressPercent(vo.getCompletionRate().multiply(new BigDecimal(100))
                    .setScale(0, RoundingMode.DOWN) + "%");
        }
        
        return Result.success(vo);
    }

    @GetMapping("/today")
    @Operation(summary = "今日训练", description = "获取用户今日训练内容")
    public Result<PlanDetailVO> getTodayWorkout(
            @Parameter(description = "用户计划ID") @RequestParam Long userPlanId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed(ErrorCode.UNAUTHORIZED.getCode(), "用户未登录");
        }
        
        // 验证用户计划属于当前登录用户
        UserWorkoutPlan userPlan = userPlanService.getById(userPlanId);
        if (userPlan == null || !userPlan.getUserId().equals(userId)) {
            return Result.failed(ErrorCode.FITNESS_PLAN_NO_ACCESS.getCode(), ErrorCode.FITNESS_PLAN_NO_ACCESS.getMessage());
        }
        
        try {
            Map<String, Object> workoutInfo = userPlanService.getTodayWorkout(userPlanId);
            
            // 转换为VO
            userPlan = (UserWorkoutPlan) workoutInfo.get("userPlan");
            WorkoutPlanDetail todayWorkout = (WorkoutPlanDetail) workoutInfo.get("todayWorkout");
            
            if (todayWorkout == null) {
                return Result.failed("今日没有训练安排");
            }
            
            PlanDetailVO vo = new PlanDetailVO();
            BeanUtils.copyProperties(todayWorkout, vo);
            
            // 如果有关联课程，获取课程信息
            if (todayWorkout.getCourseId() != null) {
                var course = courseService.getById(todayWorkout.getCourseId());
                if (course != null) {
                    CourseVO courseVO = new CourseVO();
                    BeanUtils.copyProperties(course, courseVO);
                    vo.setCourse(courseVO);
                }
            }
            
            return Result.success(vo);
        } catch (BusinessException e) {
            return Result.failed(e.getCode(), e.getMessage());
        } catch (Exception e) {
            return Result.failed(e.getMessage());
        }
    }

    @PostMapping("/progress")
    @Operation(summary = "更新进度", description = "完成当天训练，更新计划进度")
    public Result<Boolean> updateProgress(
            @Parameter(description = "用户计划ID") @RequestParam Long userPlanId,
            @Parameter(description = "是否完成") @RequestParam(defaultValue = "true") Boolean completed) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed(ErrorCode.UNAUTHORIZED.getCode(), "用户未登录");
        }
        
        // 验证用户计划属于当前登录用户
        UserWorkoutPlan userPlan = userPlanService.getById(userPlanId);
        if (userPlan == null || !userPlan.getUserId().equals(userId)) {
            return Result.failed(ErrorCode.FITNESS_PLAN_NO_ACCESS.getCode(), ErrorCode.FITNESS_PLAN_NO_ACCESS.getMessage());
        }
        
        boolean result = userPlanService.updatePlanProgress(userPlanId, completed);
        return Result.success(result);
    }

    @PostMapping("/abandon")
    @Operation(summary = "放弃计划", description = "放弃当前训练计划")
    public Result<Boolean> abandonPlan(
            @Parameter(description = "用户计划ID") @RequestParam Long userPlanId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed(ErrorCode.UNAUTHORIZED.getCode(), "用户未登录");
        }
        
        // 验证用户计划属于当前登录用户
        UserWorkoutPlan userPlan = userPlanService.getById(userPlanId);
        if (userPlan == null || !userPlan.getUserId().equals(userId)) {
            return Result.failed(ErrorCode.FITNESS_PLAN_NO_ACCESS.getCode(), ErrorCode.FITNESS_PLAN_NO_ACCESS.getMessage());
        }
        
        boolean result = userPlanService.abandonPlan(userPlanId);
        return Result.success(result);
    }

    @PostMapping("/complete")
    @Operation(summary = "完成计划", description = "手动标记计划为已完成")
    public Result<Boolean> completePlan(
            @Parameter(description = "用户计划ID") @RequestParam Long userPlanId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed(ErrorCode.UNAUTHORIZED.getCode(), "用户未登录");
        }
        
        // 验证用户计划属于当前登录用户
        UserWorkoutPlan userPlan = userPlanService.getById(userPlanId);
        if (userPlan == null || !userPlan.getUserId().equals(userId)) {
            return Result.failed(ErrorCode.FITNESS_PLAN_NO_ACCESS.getCode(), ErrorCode.FITNESS_PLAN_NO_ACCESS.getMessage());
        }
        
        boolean result = userPlanService.completePlan(userPlanId);
        return Result.success(result);
    }

    @GetMapping("/today/completed")
    @Operation(summary = "检查今日训练是否已完成", description = "检查用户今日的训练是否已经完成")
    public Result<Boolean> isWorkoutCompletedToday(
            @Parameter(description = "用户计划ID") @RequestParam Long userPlanId) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed(ErrorCode.UNAUTHORIZED.getCode(), "用户未登录");
        }
        
        // 验证用户计划属于当前登录用户
        UserWorkoutPlan userPlan = userPlanService.getById(userPlanId);
        if (userPlan == null || !userPlan.getUserId().equals(userId)) {
            return Result.failed(ErrorCode.FITNESS_PLAN_NO_ACCESS.getCode(), ErrorCode.FITNESS_PLAN_NO_ACCESS.getMessage());
        }
        
        try {
            // 获取今日训练信息
            Map<String, Object> workoutInfo = userPlanService.getTodayWorkout(userPlanId);
            
            // 获取今日周和日
            Integer todayWeek = (Integer) workoutInfo.get("todayWeek");
            Integer todayDay = (Integer) workoutInfo.get("todayDay");
            
            // 检查用户的当前进度是否已经超过了今日的进度
            // 如果当前周大于今日周，或者当前周等于今日周但当前日大于今日日，则表示今日训练已完成
            boolean completed = (userPlan.getCurrentWeek() > todayWeek) || 
                               (userPlan.getCurrentWeek().equals(todayWeek) && userPlan.getCurrentDay() > todayDay);
            
            return Result.success(completed);
        } catch (Exception e) {
            return Result.failed("检查今日训练状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 设置难度和目标的文本描述
     */
    private void setDifficultyAndGoalText(PlanVO vo) {
        // 设置难度文本
        if (vo.getDifficulty() != null) {
            switch (vo.getDifficulty()) {
                case 1:
                    vo.setDifficultyText("初级");
                    break;
                case 2:
                    vo.setDifficultyText("中级");
                    break;
                case 3:
                    vo.setDifficultyText("高级");
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
     * 设置状态文本
     */
    private void setStatusText(UserPlanVO vo) {
        if (vo.getStatus() != null) {
            switch (vo.getStatus()) {
                case 1:
                    vo.setStatusText("进行中");
                    break;
                case 2:
                    vo.setStatusText("已完成");
                    break;
                case 3:
                    vo.setStatusText("已放弃");
                    break;
                default:
                    vo.setStatusText("未知");
            }
        }
    }
} 