package com.eat2fit.user.service;

import com.eat2fit.user.dto.UserBodyRecordDTO;
import com.eat2fit.user.vo.UserBodyRecordVO;

import java.time.LocalDate;
import java.util.List;

/**
 * 用户身体数据记录服务接口
 */
public interface UserBodyRecordService {

    /**
     * 添加身体数据记录
     * 
     * @param userBodyRecordDTO 身体数据记录
     * @return 记录ID
     */
    Long addRecord(UserBodyRecordDTO userBodyRecordDTO);

    /**
     * 获取用户最近的身体记录
     * 
     * @param userId 用户ID
     * @param limit 记录条数
     * @return 身体记录列表
     */
    List<UserBodyRecordVO> getLatestRecords(Long userId, int limit);

    /**
     * 获取用户某个日期范围内的身体记录
     * 
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 身体记录列表
     */
    List<UserBodyRecordVO> getRecordsByDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取用户特定日期的身体记录
     * 
     * @param userId 用户ID
     * @param recordDate 记录日期
     * @return 身体记录
     */
    UserBodyRecordVO getRecordByDate(Long userId, LocalDate recordDate);

    /**
     * 删除身体数据记录
     * 
     * @param recordId 记录ID
     * @param userId 用户ID（用于验证操作权限）
     * @return 删除结果
     */
    boolean deleteRecord(Long recordId, Long userId);
} 