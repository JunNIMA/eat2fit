package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 课程VO
 */
@Data
@Schema(description = "课程视图对象")
public class CourseVO {

    @Schema(description = "课程ID")
    private Long id;

    @Schema(description = "课程标题")
    private String title;

    @Schema(description = "课程描述")
    private String description;

    @Schema(description = "封面图片URL")
    private String coverImg;

    @Schema(description = "课程视频URL")
    private String videoUrl;

    @Schema(description = "时长(分钟)")
    private Integer duration;

    @Schema(description = "难度 1:初级 2:中级 3:高级")
    private Integer difficulty;

    @Schema(description = "难度文本")
    private String difficultyText;

    @Schema(description = "适合的健身目标 1:增肌 2:减脂 3:塑形 4:维持")
    private Integer fitnessGoal;

    @Schema(description = "健身目标文本")
    private String fitnessGoalText;

    @Schema(description = "锻炼部位，多个用逗号分隔")
    private String bodyParts;

    @Schema(description = "消耗卡路里")
    private Integer calories;

    @Schema(description = "教练名称")
    private String instructor;

    @Schema(description = "所需器材，多个用逗号分隔")
    private String equipment;

    @Schema(description = "观看次数")
    private Long viewCount;

    @Schema(description = "点赞次数")
    private Long likeCount;

    @Schema(description = "是否已收藏")
    private Boolean isFavorite;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
} 