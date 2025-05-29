package com.eat2fit.user.interceptor;

import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.exception.ErrorCode;
import com.eat2fit.user.annotation.RequiresAdmin;
import com.eat2fit.user.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

import io.jsonwebtoken.Claims;

/**
 * 管理员权限拦截器
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 如果不是映射到方法，直接通过
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        // 获取方法上的注解
        RequiresAdmin requiresAdmin = handlerMethod.getMethodAnnotation(RequiresAdmin.class);
        // 如果方法上没有注解，则获取类上的注解
        if (requiresAdmin == null) {
            requiresAdmin = handlerMethod.getBeanType().getAnnotation(RequiresAdmin.class);
        }

        // 如果没有添加权限注解，则直接通过
        if (requiresAdmin == null) {
            return true;
        }

        // 从请求头中获取token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        try {
            // 验证token
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(token);
            // 验证是否是管理员
            Integer role = claims.get("role", Integer.class);
            if (role == null || role != 1) {
                throw new BusinessException(ErrorCode.FORBIDDEN.getCode(), requiresAdmin.message());
            }
            
            return true;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }
} 