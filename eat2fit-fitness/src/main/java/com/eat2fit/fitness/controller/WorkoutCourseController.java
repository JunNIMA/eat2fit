package com.eat2fit.fitness.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.common.util.AliyunOSSOperator;
import com.eat2fit.fitness.dto.CourseQueryDTO;
import com.eat2fit.fitness.entity.WorkoutCourse;
import com.eat2fit.fitness.service.UserFavoriteService;
import com.eat2fit.fitness.service.WorkoutCourseService;
import com.eat2fit.fitness.vo.CourseVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.eat2fit.common.util.UserContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * 训练课程控制器
 */
@Slf4j
@RestController
@RequestMapping("/fitness/courses")
@Tag(name = "训练课程接口", description = "提供训练课程相关接口")
public class WorkoutCourseController {

    @Autowired
    private WorkoutCourseService courseService;
    
    @Autowired
    private UserFavoriteService favoriteService;
    
    @Autowired
    private AliyunOSSOperator aliyunOSSOperator;

    @GetMapping("/page")
    @Operation(summary = "分页查询课程", description = "根据条件分页查询课程列表")
    public Result<Page<CourseVO>> pageList(@Parameter(description = "查询参数") CourseQueryDTO queryDTO) {
        Page<WorkoutCourse> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        page = courseService.pageList(page, queryDTO.getFitnessGoal(), queryDTO.getDifficulty(), queryDTO.getKeyword());
        
        // 转换为VO
        Page<CourseVO> resultPage = new Page<>();
        BeanUtils.copyProperties(page, resultPage, "records");
        
        List<CourseVO> voList = new ArrayList<>();
        for (WorkoutCourse course : page.getRecords()) {
            CourseVO vo = new CourseVO();
            BeanUtils.copyProperties(course, vo);
            // 设置文本描述
            setDifficultyAndGoalText(vo);
            voList.add(vo);
        }
        resultPage.setRecords(voList);
        
        return Result.success(resultPage);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取课程详情", description = "根据ID获取课程详情")
    public Result<CourseVO> getDetail(
            @Parameter(description = "课程ID") @PathVariable Long id) {
        
        WorkoutCourse course = courseService.getById(id);
        if (course == null) {
            return Result.failed("课程不存在");
        }
        
        // 增加观看次数
        courseService.increaseViewCount(id);
        
        // 转换为VO
        CourseVO vo = new CourseVO();
        BeanUtils.copyProperties(course, vo);
        setDifficultyAndGoalText(vo);
        
        // 从UserContext获取用户ID并设置是否已收藏
        Long userId = UserContext.getUser();
        if (userId != null) {
            boolean isFavorite = favoriteService.isFavorite(userId, 1, id);
            vo.setIsFavorite(isFavorite);
        }
        
        return Result.success(vo);
    }

    @PostMapping("/like/{id}")
    @Operation(summary = "点赞课程", description = "对指定课程进行点赞")
    public Result<Boolean> likeCourse(
            @Parameter(description = "课程ID") @PathVariable Long id) {
        
        boolean result = courseService.likeCourse(id, true);
        return Result.success(result);
    }

    @PostMapping("/unlike/{id}")
    @Operation(summary = "取消点赞", description = "取消对指定课程的点赞")
    public Result<Boolean> unlikeCourse(
            @Parameter(description = "课程ID") @PathVariable Long id) {
        
        boolean result = courseService.likeCourse(id, false);
        return Result.success(result);
    }

    @GetMapping("/recommend")
    @Operation(summary = "推荐课程", description = "获取推荐课程列表")
    public Result<List<CourseVO>> recommendCourses(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "6") Integer limit) {
        
        // 从UserContext获取用户ID
        Long userId = UserContext.getUser();
        if (userId == null) {
            return Result.failed("用户未登录");
        }
        
        Page<WorkoutCourse> page = courseService.getRecommendCourses(userId, limit);
        
        // 转换为VO
        List<CourseVO> voList = new ArrayList<>();
        for (WorkoutCourse course : page.getRecords()) {
            CourseVO vo = new CourseVO();
            BeanUtils.copyProperties(course, vo);
            setDifficultyAndGoalText(vo);
            
            // 设置是否已收藏
            boolean isFavorite = favoriteService.isFavorite(userId, 1, course.getId());
            vo.setIsFavorite(isFavorite);
            
            voList.add(vo);
        }
        
        return Result.success(voList);
    }

    /**
     * 以下是管理接口，需要管理员权限
     */
    
    @PostMapping
    @Operation(summary = "添加课程", description = "添加新的训练课程")
    public Result<Boolean> addCourse(@RequestBody WorkoutCourse course) {
        boolean saved = courseService.save(course);
        return Result.success(saved);
    }

    @PutMapping
    @Operation(summary = "更新课程", description = "更新已有训练课程")
    public Result<Boolean> updateCourse(@RequestBody WorkoutCourse course) {
        boolean updated = courseService.updateById(course);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除课程", description = "删除指定训练课程")
    public Result<Boolean> deleteCourse(@PathVariable Long id) {
        boolean removed = courseService.removeById(id);
        return Result.success(removed);
    }
    
    /**
     * 上传课程封面图片
     */
    @PostMapping("/upload/cover")
    @Operation(summary = "上传封面图片", description = "上传训练课程封面图片")
    public Result<String> uploadCoverImage(MultipartFile file) throws Exception {
        log.info("上传课程封面图片: {}", file.getOriginalFilename());
        // 上传文件到阿里云OSS
        String fileUrl = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
        log.info("上传封面图片成功，OSS URL: {}", fileUrl);
        return Result.success(fileUrl);
    }

    /**
     * 上传课程视频
     */
    @PostMapping("/upload/video")
    @Operation(summary = "上传课程视频", description = "上传训练课程视频")
    public Result<String> uploadVideo(MultipartFile file) throws Exception {
        log.info("上传课程视频: {}", file.getOriginalFilename());
        // 上传文件到阿里云OSS
        String fileUrl = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
        log.info("上传视频成功，OSS URL: {}", fileUrl);
        return Result.success(fileUrl);
    }
    
    /**
     * 设置难度和目标的文本描述
     */
    private void setDifficultyAndGoalText(CourseVO vo) {
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
} 