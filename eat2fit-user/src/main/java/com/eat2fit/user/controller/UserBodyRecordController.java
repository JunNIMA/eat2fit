package com.eat2fit.user.controller;

import com.eat2fit.common.response.Result;
import com.eat2fit.user.dto.UserBodyRecordDTO;
import com.eat2fit.user.service.UserBodyRecordService;
import com.eat2fit.user.vo.UserBodyRecordVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 用户身体数据记录控制器
 */
@RestController
@RequestMapping("/user/body-record")
public class UserBodyRecordController {

    @Autowired
    private UserBodyRecordService userBodyRecordService;

    /**
     * 添加身体数据记录
     */
    @PostMapping
    public Result<Long> addRecord(@Validated @RequestBody UserBodyRecordDTO userBodyRecordDTO) {
        Long recordId = userBodyRecordService.addRecord(userBodyRecordDTO);
        return Result.success(recordId);
    }

    /**
     * 获取用户最近的身体记录
     */
    @GetMapping("/latest/{userId}")
    public Result<List<UserBodyRecordVO>> getLatestRecords(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int limit) {
        List<UserBodyRecordVO> records = userBodyRecordService.getLatestRecords(userId, limit);
        return Result.success(records);
    }

    /**
     * 获取用户某个日期范围内的身体记录
     */
    @GetMapping("/range/{userId}")
    public Result<List<UserBodyRecordVO>> getRecordsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<UserBodyRecordVO> records = userBodyRecordService.getRecordsByDateRange(userId, startDate, endDate);
        return Result.success(records);
    }

    /**
     * 获取用户特定日期的身体记录
     */
    @GetMapping("/date/{userId}")
    public Result<UserBodyRecordVO> getRecordByDate(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordDate) {
        UserBodyRecordVO record = userBodyRecordService.getRecordByDate(userId, recordDate);
        return Result.success(record);
    }

    /**
     * 删除身体数据记录
     */
    @DeleteMapping("/{recordId}")
    public Result<Boolean> deleteRecord(
            @PathVariable Long recordId,
            @RequestParam Long userId) {
        boolean result = userBodyRecordService.deleteRecord(recordId, userId);
        return Result.success(result);
    }
} 