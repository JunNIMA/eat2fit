package com.eat2fit.common.exception;

import lombok.Getter;

/**
 * 错误码枚举类
 */
@Getter
public enum ErrorCode {

    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 客户端错误
     */
    BAD_REQUEST(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "方法不允许"),

    /**
     * 服务端错误
     */
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),

    /**
     * 通用业务错误
     */
    OPERATION_FAILED(1000, "操作失败"),

    /**
     * 业务错误-用户相关
     */
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "用户名或密码错误"),
    USER_ACCOUNT_LOCKED(1003, "账号已被锁定"),
    USER_ACCOUNT_EXPIRED(1004, "账号已过期"),
    USER_ALREADY_EXISTS(1005, "用户已存在"),
    USER_LOGIN_ERROR(1006, "账号或密码错误"),
    USER_ACCOUNT_DISABLED(1007, "账号已被禁用"),
    USER_USERNAME_EXISTS(1008, "用户名已存在"),
    USER_PHONE_EXISTS(1009, "手机号已存在"),
    USER_EMAIL_EXISTS(1010, "邮箱已存在"),
    
    /**
     * 业务错误-健身相关
     */
    FITNESS_PLAN_NOT_FOUND(2001, "健身计划不存在"),
    FITNESS_RECORD_NOT_FOUND(2002, "训练记录不存在"),
    FITNESS_COURSE_NOT_FOUND(2003, "课程不存在"),
    FITNESS_PLAN_ALREADY_IN_PROGRESS(2004, "已有进行中的计划，请先完成或放弃当前计划"),
    FITNESS_PLAN_INVALID_OPERATION(2005, "无效的计划操作"),
    FITNESS_PLAN_NO_ACCESS(2006, "无权访问此计划"),
    FITNESS_CHECK_IN_DUPLICATE(2007, "今天已经打卡过了"),
    
    /**
     * 业务错误-饮食相关
     */
    DIET_PLAN_NOT_FOUND(3001, "饮食计划不存在"),
    DIET_RECORD_NOT_FOUND(3002, "饮食记录不存在"),
    DIET_RECIPE_NOT_FOUND(3003, "食谱不存在"),
    
    /**
     * 业务错误-文件相关
     */
    FILE_UPLOAD_ERROR(4001, "文件上传失败"),
    FILE_DOWNLOAD_ERROR(4002, "文件下载失败"),
    FILE_TYPE_NOT_SUPPORT(4003, "不支持的文件类型"),
    FILE_SIZE_EXCEED(4004, "文件大小超出限制");

    /**
     * 错误码
     */
    private final int code;

    /**
     * 错误信息
     */
    private final String message;

    /**
     * 构造方法
     * @param code 错误码
     * @param message 错误信息
     */
    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
} 