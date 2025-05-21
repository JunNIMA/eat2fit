package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 收藏课程VO
 */
@Data
@Schema(description = "收藏课程视图对象")
public class FavoriteCourseVO {

    @Schema(description = "收藏ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程信息")
    private CourseVO course;

    @Schema(description = "收藏时间")
    private LocalDateTime createTime;
} 