package com.eat2fit.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.user.dto.UserBodyRecordDTO;
import com.eat2fit.user.entity.UserBodyRecord;
import com.eat2fit.user.mapper.UserBodyRecordMapper;
import com.eat2fit.user.service.UserBodyRecordService;
import com.eat2fit.user.vo.UserBodyRecordVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户身体数据记录服务实现类
 */
@Service
public class UserBodyRecordServiceImpl extends ServiceImpl<UserBodyRecordMapper, UserBodyRecord> implements UserBodyRecordService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addRecord(UserBodyRecordDTO userBodyRecordDTO) {
        // 检查同一天是否已有记录
        UserBodyRecord existRecord = getRecordByUserAndDate(userBodyRecordDTO.getUserId(), userBodyRecordDTO.getRecordDate());
        
        UserBodyRecord record;
        if (existRecord != null) {
            // 更新已有记录
            record = existRecord;
            record.setWeight(userBodyRecordDTO.getWeight());
            record.setBodyFat(userBodyRecordDTO.getBodyFat());
            // 重新计算BMI
            record.setBmi(calculateBMI(userBodyRecordDTO.getWeight(), userBodyRecordDTO.getUserId()));
            
            updateById(record);
        } else {
            // 创建新记录
            record = new UserBodyRecord();
            BeanUtils.copyProperties(userBodyRecordDTO, record);
            
            // 计算BMI
            record.setBmi(calculateBMI(userBodyRecordDTO.getWeight(), userBodyRecordDTO.getUserId()));
            
            save(record);
        }
        
        return record.getId();
    }

    @Override
    public List<UserBodyRecordVO> getLatestRecords(Long userId, int limit) {
        List<UserBodyRecord> records = baseMapper.getLatestRecords(userId, limit);
        return convertToVOList(records);
    }

    @Override
    public List<UserBodyRecordVO> getRecordsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<UserBodyRecord> records = baseMapper.getRecordsByDateRange(userId, startDate, endDate);
        return convertToVOList(records);
    }

    @Override
    public UserBodyRecordVO getRecordByDate(Long userId, LocalDate recordDate) {
        UserBodyRecord record = getRecordByUserAndDate(userId, recordDate);
        if (record == null) {
            return null;
        }
        
        return convertToVO(record);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRecord(Long recordId, Long userId) {
        LambdaQueryWrapper<UserBodyRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserBodyRecord::getId, recordId).eq(UserBodyRecord::getUserId, userId);
        
        return remove(queryWrapper);
    }
    
    /**
     * 根据用户ID和记录日期获取记录
     */
    private UserBodyRecord getRecordByUserAndDate(Long userId, LocalDate recordDate) {
        LambdaQueryWrapper<UserBodyRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserBodyRecord::getUserId, userId).eq(UserBodyRecord::getRecordDate, recordDate);
        
        return getOne(queryWrapper);
    }
    
    /**
     * 计算BMI指数
     */
    private BigDecimal calculateBMI(BigDecimal weight, Long userId) {
        // 这里假设在实际项目中会从用户服务获取身高信息
        // 为了演示，这里使用一个固定值
        BigDecimal height = new BigDecimal("1.75"); // 单位：米
        
        // BMI = 体重(kg) / 身高(m)²
        if (height.compareTo(BigDecimal.ZERO) > 0) {
            return weight.divide(height.pow(2), 2, RoundingMode.HALF_UP);
        }
        
        return null;
    }
    
    /**
     * 将实体转换为VO
     */
    private UserBodyRecordVO convertToVO(UserBodyRecord record) {
        UserBodyRecordVO vo = new UserBodyRecordVO();
        BeanUtils.copyProperties(record, vo);
        return vo;
    }
    
    /**
     * 将实体列表转换为VO列表
     */
    private List<UserBodyRecordVO> convertToVOList(List<UserBodyRecord> records) {
        return records.stream().map(this::convertToVO).collect(Collectors.toList());
    }
} 