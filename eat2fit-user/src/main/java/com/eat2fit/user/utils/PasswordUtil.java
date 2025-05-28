package com.eat2fit.user.utils;

import java.security.SecureRandom;
import java.util.Random;

/**
 * 密码工具类
 */
public class PasswordUtil {

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String DATA_FOR_RANDOM_STRING = CHAR_LOWER + CHAR_UPPER + NUMBER;
    private static final Random RANDOM = new SecureRandom();

    /**
     * 生成随机密码
     *
     * @param length 密码长度
     * @return 随机密码
     */
    public static String generateRandomPassword(int length) {
        if (length < 1) {
            throw new IllegalArgumentException("密码长度必须大于0");
        }

        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomCharAt = RANDOM.nextInt(DATA_FOR_RANDOM_STRING.length());
            char randomChar = DATA_FOR_RANDOM_STRING.charAt(randomCharAt);
            sb.append(randomChar);
        }
        return sb.toString();
    }
} 