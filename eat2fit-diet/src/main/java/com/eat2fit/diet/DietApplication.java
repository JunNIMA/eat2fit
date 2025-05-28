package com.eat2fit.diet;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * 饮食服务启动类
 */
@SpringBootApplication(scanBasePackages = {"com.eat2fit.diet", "com.eat2fit.common"})
@EnableDiscoveryClient
@MapperScan("com.eat2fit.diet.mapper")
public class DietApplication {

    public static void main(String[] args) {
        SpringApplication.run(DietApplication.class, args);
    }
} 