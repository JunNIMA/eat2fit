package com.eat2fit.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * AI服务启动类
 */
@SpringBootApplication(scanBasePackages = {"com.eat2fit.ai"})
@EnableDiscoveryClient
public class AiApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiApplication.class, args);
    }
} 