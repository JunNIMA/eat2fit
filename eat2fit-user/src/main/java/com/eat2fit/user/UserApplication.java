package com.eat2fit.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * 用户服务启动类
 */
@SpringBootApplication(scanBasePackages = {"com.eat2fit.user", "com.eat2fit.common"})
@EnableDiscoveryClient
@MapperScan("com.eat2fit.user.mapper")
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
} 