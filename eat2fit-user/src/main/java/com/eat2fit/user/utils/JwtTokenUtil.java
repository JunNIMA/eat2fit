package com.eat2fit.user.utils;

import com.eat2fit.common.exception.BusinessException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JWT工具类
 */
@Slf4j
@Component
public class JwtTokenUtil {

    // 重要：这个密钥必须与网关服务中的密钥完全一致
    private static final String SECRET_KEY = "eat2fit-jwt-secret-key-must-be-at-least-32-bytes-long";
    // 使用固定密钥而不是动态生成
    private static final SecretKey JWT_KEY = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

    private static final long EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    /**
     * 根据用户信息生成token
     */
    public String generateToken(Map<String,Object> claims) {
        String jwt =  Jwts.builder()
                .signWith(JWT_KEY, SignatureAlgorithm.HS256) // 使用安全的密钥和算法
                .setClaims(claims)
                .setIssuedAt(new Date())  // 设置签发时间
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 设置过期时间
                .compact(); // 生成令牌
        log.info("生成JWT令牌，包含用户ID: {}", claims.get("id"));
        return jwt;
    }

    /**
     * 解析token
     * @param token JWT令牌
     * @return 用户ID
     */
    public Long parseToken(String token){
        //1.校验token是否为空
        if(!StringUtils.hasText(token)){
            log.warn("token为空");
            throw new BusinessException("token不能为空");
        }
        
        //2.如果有Bearer前缀，去掉
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        //3.校验并解析token
        try {
            log.info("开始解析token");
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            
            // 验证id字段
            if (!claims.containsKey("id")) {
                log.error("token中缺少id字段");
                throw new BusinessException("无效的token格式");
            }
            
            // 获取并验证用户ID
            Long userId;
            try {
                userId = Long.parseLong(claims.get("id").toString());
            } catch (NumberFormatException e) {
                log.error("token中id字段不是有效的数字: {}", claims.get("id"));
                throw new BusinessException("无效的用户ID");
            }
            
            log.info("token解析成功，用户ID: {}", userId);
            return userId;
        } catch (ExpiredJwtException e) {
            log.error("token已过期", e);
            throw new BusinessException("token已过期");
        } catch (UnsupportedJwtException e) {
            log.error("不支持的token格式", e);
            throw new BusinessException("不支持的token格式");
        } catch (MalformedJwtException e) {
            log.error("token格式错误", e);
            throw new BusinessException("token格式错误");
        } catch (Exception e) {
            log.error("token解析失败: {}", e.getMessage(), e);
            throw new BusinessException("token无效: " + e.getMessage());
        }
    }
} 