package com.eat2fit.ai.controller;

import com.eat2fit.ai.constants.SystemConstants;
import com.eat2fit.ai.repository.ChatHistoryRepository;
import com.eat2fit.ai.vo.HealthQARequest;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.util.UUID;

import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY;

/**
 * 健康知识问答控制器
 */
@RestController
@RequestMapping("/ai/health")
@RequiredArgsConstructor
public class HealthQAController {

    private final ChatClient healthQAChatClient;

    
    private final ChatHistoryRepository chatHistoryRepository;

    /**
     * 健康知识问答
     * @param request 包含prompt和chatId的请求对象
     * @return 流式响应
     */
    @PostMapping(value = "/qa", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> answerHealthQuestion(@RequestBody HealthQARequest request) {
        // 保存会话ID
        chatHistoryRepository.save("health-qa", request.getChatId());
        
        // 调用AI模型
        return healthQAChatClient.prompt()
                .user(request.getPrompt())
                .advisors(a -> a.param(CHAT_MEMORY_CONVERSATION_ID_KEY, request.getChatId()))
                .stream()
                .content();
    }

} 