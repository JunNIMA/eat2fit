package com.eat2fit.fitness.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.eat2fit.fitness.entity.WorkoutCourse;

/**
 * 训练课程服务接口
 */
public interface WorkoutCourseService extends IService<WorkoutCourse> {

    /**
     * 分页查询课程列表
     * @param page 分页参数
     * @param fitnessGoal 健身目标
     * @param difficulty 难度
     * @param keyword 关键词
     * @return 分页结果
     */
    Page<WorkoutCourse> pageList(Page<WorkoutCourse> page, Integer fitnessGoal, Integer difficulty, String keyword);

    /**
     * 增加课程观看次数
     * @param courseId 课程ID
     * @return 是否成功
     */
    boolean increaseViewCount(Long courseId);

    /**
     * 点赞/取消点赞课程
     * @param courseId 课程ID
     * @param isLike 是否点赞
     * @return 是否成功
     */
    boolean likeCourse(Long courseId, boolean isLike);

    /**
     * 获取推荐课程
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 推荐课程列表
     */
    Page<WorkoutCourse> getRecommendCourses(Long userId, int limit);
} 