package com.eat2fit.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "ef.auth")
public class AuthProperties {
    
    /**
     * 不需要认证的路径
     */
    private List<String> includePaths;

    private List<String> excludePaths;
}
