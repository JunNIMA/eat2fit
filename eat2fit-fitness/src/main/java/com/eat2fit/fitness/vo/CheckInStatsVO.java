package com.eat2fit.fitness.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 打卡统计VO
 */
@Data
@Schema(description = "打卡统计视图对象")
public class CheckInStatsVO {

    @Schema(description = "总打卡次数")
    private Long totalCheckIns;

    @Schema(description = "最近30天打卡次数")
    private Long recentCheckIns;

    @Schema(description = "连续打卡天数")
    private Integer consecutiveDays;

    @Schema(description = "累计训练时长(分钟)")
    private Long totalDuration;

    @Schema(description = "累计消耗卡路里")
    private Long totalCalories;

    @Schema(description = "本月打卡次数")
    private Long monthlyCheckIns;

    @Schema(description = "本月训练时长(分钟)")
    private Long monthlyDuration;
} 