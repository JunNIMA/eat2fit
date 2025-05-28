package com.eat2fit.fitness.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eat2fit.common.response.Result;
import com.eat2fit.common.util.AliyunOSSOperator;
import com.eat2fit.common.util.UserContext;
import com.eat2fit.fitness.dto.PlanCreateDTO;
import com.eat2fit.fitness.dto.PlanQueryDTO;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.entity.WorkoutPlanDetail;
import com.eat2fit.fitness.service.UserFavoriteService;
import com.eat2fit.fitness.service.WorkoutCourseService;
import com.eat2fit.fitness.service.WorkoutPlanService;
import com.eat2fit.fitness.vo.CourseVO;
import com.eat2fit.fitness.vo.PlanDetailVO;
import com.eat2fit.fitness.vo.PlanVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.util.HashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * 训练计划控制器
 */
@Slf4j
@RestController
@RequestMapping("/fitness/plans")
@Tag(name = "训练计划接口", description = "提供训练计划相关接口")
public class WorkoutPlanController {

    @Autowired
    private WorkoutPlanService planService;
    
    @Autowired
    private UserFavoriteService favoriteService;
    
    @Autowired
    private WorkoutCourseService courseService;
    
    @Autowired
    private AliyunOSSOperator aliyunOSSOperator;

    @GetMapping("/page")
    @Operation(summary = "分页查询计划", description = "根据条件分页查询训练计划列表")
    public Result<Page<PlanVO>> pageList(@Parameter(description = "查询参数") PlanQueryDTO queryDTO) {
        Page<WorkoutPlan> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        page = planService.pageList(page, queryDTO.getFitnessGoal(), queryDTO.getDifficulty(), queryDTO.getKeyword());
        
        // 转换为VO
        Page<PlanVO> resultPage = new Page<>();
        BeanUtils.copyProperties(page, resultPage, "records");
        
        List<PlanVO> voList = new ArrayList<>();
        for (WorkoutPlan plan : page.getRecords()) {
            PlanVO vo = new PlanVO();
            BeanUtils.copyProperties(plan, vo);
            
            // 设置文本描述
            setDifficultyAndGoalText(vo);
            
            // 计算总训练天数
            if (plan.getDurationWeeks() != null && plan.getSessionsPerWeek() != null) {
                vo.setTotalDays(plan.getDurationWeeks() * plan.getSessionsPerWeek());
            }
            
            voList.add(vo);
        }
        resultPage.setRecords(voList);
        
        return Result.success(resultPage);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取计划详情", description = "根据ID获取计划详情")
    public Result<PlanVO> getDetail(
            @Parameter(description = "计划ID") @PathVariable Long id) {
        
        WorkoutPlan plan = planService.getById(id);
        if (plan == null) {
            return Result.failed("计划不存在");
        }
        
        // 转换为VO
        PlanVO vo = new PlanVO();
        BeanUtils.copyProperties(plan, vo);
        setDifficultyAndGoalText(vo);
        
        // 计算总训练天数
        if (plan.getDurationWeeks() != null && plan.getSessionsPerWeek() != null) {
            vo.setTotalDays(plan.getDurationWeeks() * plan.getSessionsPerWeek());
        }
        
        // 从UserContext获取用户ID并设置是否已收藏
        Long userId = UserContext.getUser();
        if (userId != null) {
            boolean isFavorite = favoriteService.isFavorite(userId, 2, id);
            vo.setIsFavorite(isFavorite);
        }
        
        return Result.success(vo);
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "获取计划的训练详情", description = "获取计划的所有训练安排")
    public Result<List<PlanDetailVO>> getPlanDetails(
            @Parameter(description = "计划ID") @PathVariable Long id) {
        
        List<WorkoutPlanDetail> details = planService.getPlanDetails(id);
        
        // 转换为VO
        List<PlanDetailVO> voList = new ArrayList<>();
        for (WorkoutPlanDetail detail : details) {
            PlanDetailVO vo = new PlanDetailVO();
            BeanUtils.copyProperties(detail, vo);
            
            // 如果有关联课程，获取课程信息
            if (detail.getCourseId() != null) {
                var course = courseService.getById(detail.getCourseId());
                if (course != null) {
                    CourseVO courseVO = new CourseVO();
                    BeanUtils.copyProperties(course, courseVO);
                    vo.setCourse(courseVO);
                }
            }
            
            voList.add(vo);
        }
        
        return Result.success(voList);
    }

    @GetMapping("/recommend")
    @Operation(summary = "推荐计划", description = "获取推荐计划列表")
    public Result<List<PlanVO>> recommendPlans(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "6") Integer limit) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        List<WorkoutPlan> plans = planService.getRecommendPlans(userId, limit);
        
        // 转换为VO
        List<PlanVO> voList = new ArrayList<>();
        for (WorkoutPlan plan : plans) {
            PlanVO vo = new PlanVO();
            BeanUtils.copyProperties(plan, vo);
            
            // 设置文本描述
            setDifficultyAndGoalText(vo);
            
            // 计算总训练天数
            if (plan.getDurationWeeks() != null && plan.getSessionsPerWeek() != null) {
                vo.setTotalDays(plan.getDurationWeeks() * plan.getSessionsPerWeek());
            }
            
            // 设置是否已收藏
            boolean isFavorite = favoriteService.isFavorite(userId, 2, plan.getId());
            vo.setIsFavorite(isFavorite);
            
            voList.add(vo);
        }
        
        return Result.success(voList);
    }

    @GetMapping("/stats")
    @Operation(summary = "计划统计", description = "获取健身计划统计数据")
    public Result<Map<String, Object>> getPlanStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 查询计划总数
        long totalCount = planService.count();
        stats.put("totalCount", totalCount);
        
        // 查询今日新增计划数
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<WorkoutPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.ge(WorkoutPlan::getCreateTime, today.atStartOfDay());
        long todayNewCount = planService.count(queryWrapper);
        stats.put("todayNewCount", todayNewCount);
        
        return Result.success(stats);
    }

    /**
     * 以下是管理接口，需要管理员权限
     */
    
    @PostMapping
    @Operation(summary = "添加计划", description = "添加新的训练计划及其详情")
    public Result<Boolean> addPlan(@RequestBody PlanCreateDTO createDTO) {
        // DTO转实体
        WorkoutPlan plan = new WorkoutPlan();
        BeanUtils.copyProperties(createDTO, plan);
        
        boolean result = planService.savePlanWithDetails(plan, createDTO.getDetails());
        return Result.success(result);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新计划", description = "更新已有训练计划及其详情")
    public Result<Boolean> updatePlan(
            @Parameter(description = "计划ID") @PathVariable Long id,
            @RequestBody PlanCreateDTO createDTO) {
        
        WorkoutPlan plan = new WorkoutPlan();
        BeanUtils.copyProperties(createDTO, plan);
        plan.setId(id);
        
        boolean result = planService.updatePlanWithDetails(plan, createDTO.getDetails());
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除计划", description = "删除指定训练计划")
    public Result<Boolean> deletePlan(@PathVariable Long id) {
        boolean removed = planService.removeById(id);
        return Result.success(removed);
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
     * 上传计划封面图片
     */
    @PostMapping("/upload/cover")
    @Operation(summary = "上传封面图片", description = "上传训练计划封面图片")
    public Result<String> uploadCoverImage(MultipartFile file) throws Exception {
        log.info("上传计划封面图片: {}", file.getOriginalFilename());
        // 上传文件到阿里云OSS
        String fileUrl = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
        log.info("上传封面图片成功，OSS URL: {}", fileUrl);
        return Result.success(fileUrl);
    }
} 