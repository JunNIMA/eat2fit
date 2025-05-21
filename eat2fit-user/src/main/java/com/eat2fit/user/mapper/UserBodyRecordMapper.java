package com.eat2fit.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eat2fit.user.entity.UserBodyRecord;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 用户身体数据记录Mapper接口
 */
public interface UserBodyRecordMapper extends BaseMapper<UserBodyRecord> {

    /**
     * 获取用户最近的身体记录
     * @param userId 用户ID
     * @param limit 记录条数
     * @return 身体记录列表
     */
    @Select("SELECT * FROM user_body_record WHERE user_id = #{userId} ORDER BY record_date DESC LIMIT #{limit}")
    List<UserBodyRecord> getLatestRecords(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 获取用户某个日期范围内的身体记录
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 身体记录列表
     */
    @Select("SELECT * FROM user_body_record WHERE user_id = #{userId} AND record_date BETWEEN #{startDate} AND #{endDate} ORDER BY record_date")
    List<UserBodyRecord> getRecordsByDateRange(@Param("userId") Long userId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
} 