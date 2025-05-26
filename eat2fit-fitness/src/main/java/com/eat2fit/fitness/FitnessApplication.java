package com.eat2fit.fitness;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * 健身服务启动类
 */
@SpringBootApplication(scanBasePackages = {"com.eat2fit.fitness", "com.eat2fit.common"})
@EnableDiscoveryClient
@MapperScan("com.eat2fit.fitness.mapper")

public class FitnessApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitnessApplication.class, args);
    }
} 