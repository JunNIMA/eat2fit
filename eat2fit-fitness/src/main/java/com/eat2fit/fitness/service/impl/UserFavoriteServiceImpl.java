package com.eat2fit.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.fitness.entity.UserFavorite;
import com.eat2fit.fitness.entity.WorkoutCourse;
import com.eat2fit.fitness.entity.WorkoutPlan;
import com.eat2fit.fitness.mapper.UserFavoriteMapper;
import com.eat2fit.fitness.service.UserFavoriteService;
import com.eat2fit.fitness.service.WorkoutCourseService;
import com.eat2fit.fitness.service.WorkoutPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户收藏服务实现类
 */
@Service
public class UserFavoriteServiceImpl extends ServiceImpl<UserFavoriteMapper, UserFavorite> implements UserFavoriteService {

    @Autowired
    private WorkoutCourseService courseService;
    
    @Autowired
    private WorkoutPlanService planService;

    @Override
    public boolean addFavorite(Long userId, Integer type, Long targetId) {
        // 检查是否已收藏
        if (isFavorite(userId, type, targetId)) {
            return true;
        }
        
        // 创建收藏记录
        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setType(type);
        favorite.setTargetId(targetId);
        
        return save(favorite);
    }

    @Override
    public boolean cancelFavorite(Long userId, Integer type, Long targetId) {
        LambdaQueryWrapper<UserFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserFavorite::getUserId, userId)
                   .eq(UserFavorite::getType, type)
                   .eq(UserFavorite::getTargetId, targetId);
        
        return remove(queryWrapper);
    }

    @Override
    public boolean isFavorite(Long userId, Integer type, Long targetId) {
        LambdaQueryWrapper<UserFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserFavorite::getUserId, userId)
                   .eq(UserFavorite::getType, type)
                   .eq(UserFavorite::getTargetId, targetId);
        
        return baseMapper.selectCount(queryWrapper) > 0;
    }

    @Override
    public Page<Map<String, Object>> getFavoriteCourses(Long userId, Page<UserFavorite> page) {
        LambdaQueryWrapper<UserFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserFavorite::getUserId, userId)
                   .eq(UserFavorite::getType, 1) // 课程类型
                   .orderByDesc(UserFavorite::getCreateTime);
        
        Page<UserFavorite> favoritePage = baseMapper.selectPage(page, queryWrapper);
        
        // 获取课程ID列表
        List<Long> courseIds = favoritePage.getRecords().stream()
                                          .map(UserFavorite::getTargetId)
                                          .collect(Collectors.toList());
        
        // 查询课程信息
        List<WorkoutCourse> courses = courseIds.isEmpty() ? 
                                     List.of() : 
                                     courseService.listByIds(courseIds);
        
        // 组装结果
        Page<Map<String, Object>> resultPage = new Page<>();
        resultPage.setTotal(favoritePage.getTotal());
        resultPage.setCurrent(favoritePage.getCurrent());
        resultPage.setSize(favoritePage.getSize());
        
        List<Map<String, Object>> records = favoritePage.getRecords().stream().map(favorite -> {
            Map<String, Object> result = new HashMap<>();
            result.put("favorite", favorite);
            
            // 关联课程信息
            courses.stream()
                  .filter(course -> course.getId().equals(favorite.getTargetId()))
                  .findFirst()
                  .ifPresent(course -> result.put("course", course));
            
            return result;
        }).collect(Collectors.toList());
        
        resultPage.setRecords(records);
        return resultPage;
    }

    @Override
    public Page<Map<String, Object>> getFavoritePlans(Long userId, Page<UserFavorite> page) {
        LambdaQueryWrapper<UserFavorite> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserFavorite::getUserId, userId)
                   .eq(UserFavorite::getType, 2) // 计划类型
                   .orderByDesc(UserFavorite::getCreateTime);
        
        Page<UserFavorite> favoritePage = baseMapper.selectPage(page, queryWrapper);
        
        // 获取计划ID列表
        List<Long> planIds = favoritePage.getRecords().stream()
                                       .map(UserFavorite::getTargetId)
                                       .collect(Collectors.toList());
        
        // 查询计划信息
        List<WorkoutPlan> plans = planIds.isEmpty() ? 
                                List.of() : 
                                planService.listByIds(planIds);
        
        // 组装结果
        Page<Map<String, Object>> resultPage = new Page<>();
        resultPage.setTotal(favoritePage.getTotal());
        resultPage.setCurrent(favoritePage.getCurrent());
        resultPage.setSize(favoritePage.getSize());
        
        List<Map<String, Object>> records = favoritePage.getRecords().stream().map(favorite -> {
            Map<String, Object> result = new HashMap<>();
            result.put("favorite", favorite);
            
            // 关联计划信息
            plans.stream()
                .filter(plan -> plan.getId().equals(favorite.getTargetId()))
                .findFirst()
                .ifPresent(plan -> result.put("plan", plan));
            
            return result;
        }).collect(Collectors.toList());
        
        resultPage.setRecords(records);
        return resultPage;
    }
} 