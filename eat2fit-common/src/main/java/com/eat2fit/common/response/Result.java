package com.eat2fit.common.response;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果类
 * @param <T> 返回数据类型
 */
@Data
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 状态码 */
    private Integer code;

    /** 提示信息 */
    private String message;

    /** 返回数据 */
    private T data;

    /** 是否成功 */
    private Boolean success;

    /**
     * 私有构造方法，禁止直接创建
     */
    private Result() {}

    /**
     * 成功返回结果
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 成功返回结果
     * @param data 返回数据
     */
    public static <T> Result<T> success(T data) {
        return success(data, "操作成功");
    }

    /**
     * 成功返回结果
     * @param data 返回数据
     * @param message 提示信息
     */
    public static <T> Result<T> success(T data, String message) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        result.setSuccess(true);
        return result;
    }

    /**
     * 失败返回结果
     * @param errorCode 错误码
     */
    public static <T> Result<T> failed(int errorCode, String message) {
        Result<T> result = new Result<>();
        result.setCode(errorCode);
        result.setMessage(message);
        result.setSuccess(false);
        return result;
    }

    /**
     * 失败返回结果
     * @param message 提示信息
     */
    public static <T> Result<T> failed(String message) {
        return failed(500, message);
    }

    /**
     * 失败返回结果
     */
    public static <T> Result<T> failed() {
        return failed("操作失败");
    }

    /**
     * 参数验证失败返回结果
     */
    public static <T> Result<T> validateFailed(String message) {
        return failed(400, message);
    }

    /**
     * 未登录返回结果
     */
    public static <T> Result<T> unauthorized(String message) {
        return failed(401, message);
    }

    /**
     * 未授权返回结果
     */
    public static <T> Result<T> forbidden(String message) {
        return failed(403, message);
    }
} 