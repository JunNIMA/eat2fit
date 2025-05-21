package com.eat2fit.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.fitness.entity.WorkoutCourse;
import com.eat2fit.fitness.mapper.WorkoutCourseMapper;
import com.eat2fit.fitness.service.WorkoutCourseService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 训练课程服务实现类
 */
@Service
public class WorkoutCourseServiceImpl extends ServiceImpl<WorkoutCourseMapper, WorkoutCourse> implements WorkoutCourseService {

    @Override
    public Page<WorkoutCourse> pageList(Page<WorkoutCourse> page, Integer fitnessGoal, Integer difficulty, String keyword) {
        LambdaQueryWrapper<WorkoutCourse> queryWrapper = new LambdaQueryWrapper<>();
        
        // 构建查询条件
        queryWrapper.eq(WorkoutCourse::getStatus, 1); // 只查询状态正常的课程
        
        if (fitnessGoal != null) {
            queryWrapper.eq(WorkoutCourse::getFitnessGoal, fitnessGoal);
        }
        
        if (difficulty != null) {
            queryWrapper.eq(WorkoutCourse::getDifficulty, difficulty);
        }
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> 
                wrapper.like(WorkoutCourse::getTitle, keyword)
                       .or()
                       .like(WorkoutCourse::getDescription, keyword)
                       .or()
                       .like(WorkoutCourse::getBodyParts, keyword)
            );
        }
        
        queryWrapper.orderByDesc(WorkoutCourse::getCreateTime);
        
        return baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public boolean increaseViewCount(Long courseId) {
        LambdaUpdateWrapper<WorkoutCourse> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(WorkoutCourse::getId, courseId)
                    .setSql("view_count = view_count + 1");
        
        return update(updateWrapper);
    }

    @Override
    public boolean likeCourse(Long courseId, boolean isLike) {
        LambdaUpdateWrapper<WorkoutCourse> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(WorkoutCourse::getId, courseId);
        
        if (isLike) {
            updateWrapper.setSql("like_count = like_count + 1");
        } else {
            updateWrapper.setSql("like_count = like_count - 1");
        }
        
        return update(updateWrapper);
    }

    @Override
    public Page<WorkoutCourse> getRecommendCourses(Long userId, int limit) {
        // 简单实现：按照点赞数和观看数综合排序的热门课程
        // 实际场景中可以基于用户历史记录、标签偏好等实现复杂的推荐算法
        
        Page<WorkoutCourse> page = new Page<>(1, limit);
        LambdaQueryWrapper<WorkoutCourse> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(WorkoutCourse::getStatus, 1)
                   .orderByDesc(course -> 
                        "view_count * 0.3 + like_count * 0.7"); // 综合排序公式
        
        return baseMapper.selectPage(page, queryWrapper);
    }
} 