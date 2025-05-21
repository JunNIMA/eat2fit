package com.eat2fit.common.constant;

/**
 * 常量类
 */
public class Constants {

    /**
     * 令牌前缀
     */
    public static final String TOKEN_PREFIX = "Bearer ";

    /**
     * 令牌头部
     */
    public static final String TOKEN_HEADER = "Authorization";

    /**
     * 用户信息在Redis中的前缀
     */
    public static final String REDIS_USER_PREFIX = "user:";

    /**
     * 用户Token在Redis中的前缀
     */
    public static final String REDIS_TOKEN_PREFIX = "token:";

    /**
     * 登录用户Redis缓存过期时间（7天）
     */
    public static final long LOGIN_EXPIRE = 7 * 24 * 60 * 60;

    /**
     * 验证码在Redis中的前缀
     */
    public static final String REDIS_CAPTCHA_PREFIX = "captcha:";

    /**
     * 验证码有效期（5分钟）
     */
    public static final long CAPTCHA_EXPIRE = 5 * 60;

    /**
     * 短信验证码在Redis中的前缀
     */
    public static final String REDIS_SMS_CODE_PREFIX = "sms:code:";

    /**
     * 短信验证码有效期（5分钟）
     */
    public static final long SMS_CODE_EXPIRE = 5 * 60;

    /**
     * 默认页码
     */
    public static final int DEFAULT_PAGE_NUM = 1;

    /**
     * 默认每页数量
     */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /**
     * 最大页数限制
     */
    public static final int MAX_PAGE_SIZE = 100;

    /**
     * 健身计划缓存前缀
     */
    public static final String REDIS_FITNESS_PLAN_PREFIX = "fitness:plan:";

    /**
     * 食谱缓存前缀
     */
    public static final String REDIS_DIET_RECIPE_PREFIX = "diet:recipe:";

    /**
     * 性别：男
     */
    public static final int GENDER_MALE = 1;

    /**
     * 性别：女
     */
    public static final int GENDER_FEMALE = 2;

    /**
     * 性别：未知
     */
    public static final int GENDER_UNKNOWN = 0;

    /**
     * 账号状态：正常
     */
    public static final int STATUS_NORMAL = 1;

    /**
     * 账号状态：禁用
     */
    public static final int STATUS_DISABLED = 0;

    /**
     * 健身目标：增肌
     */
    public static final int FITNESS_GOAL_GAIN_MUSCLE = 1;

    /**
     * 健身目标：减脂
     */
    public static final int FITNESS_GOAL_LOSE_FAT = 2;

    /**
     * 健身目标：塑形
     */
    public static final int FITNESS_GOAL_SHAPE = 3;

    /**
     * 健身目标：维持状态
     */
    public static final int FITNESS_GOAL_MAINTAIN = 4;

    /**
     * 文件上传路径
     */
    public static final String UPLOAD_PATH = "/upload/";

    /**
     * 允许上传的图片类型
     */
    public static final String[] ALLOWED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".gif"};

    /**
     * 允许上传的视频类型
     */
    public static final String[] ALLOWED_VIDEO_TYPES = {".mp4", ".avi", ".mov", ".wmv"};

    /**
     * 最大文件上传大小（5MB）
     */
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 最大视频上传大小（50MB）
     */
    public static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;
} 