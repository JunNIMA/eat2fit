package com.eat2fit.ai.vo;

import lombok.Data;

/**
 * 健康问答请求VO
 */
@Data
public class HealthQARequest {
    /**
     * 用户提问内容
     */
    private String prompt;
    
    /**
     * 会话ID
     */
    private String chatId;
} 