package com.eat2fit.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
 * 日期工具类
 */
public class DateUtil {

    /**
     * 默认日期格式
     */
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    
    /**
     * 默认日期时间格式
     */
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    /**
     * 默认时间格式
     */
    public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";

    /**
     * 将Date转换为LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    /**
     * 将LocalDateTime转换为Date
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    /**
     * 将LocalDate转换为Date
     */
    public static Date toDate(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    /**
     * 获取当前日期，格式为yyyy-MM-dd
     */
    public static String getCurrentDate() {
        return format(LocalDate.now(), DEFAULT_DATE_FORMAT);
    }

    /**
     * 获取当前时间，格式为yyyy-MM-dd HH:mm:ss
     */
    public static String getCurrentDateTime() {
        return format(LocalDateTime.now(), DEFAULT_DATETIME_FORMAT);
    }

    /**
     * 格式化日期，格式为yyyy-MM-dd
     */
    public static String formatDate(LocalDate date) {
        return format(date, DEFAULT_DATE_FORMAT);
    }

    /**
     * 格式化日期时间，格式为yyyy-MM-dd HH:mm:ss
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return format(dateTime, DEFAULT_DATETIME_FORMAT);
    }

    /**
     * 格式化日期
     *
     * @param date   日期
     * @param format 格式
     * @return 格式化后的日期字符串
     */
    public static String format(LocalDate date, String format) {
        if (date == null) {
            return null;
        }
        return date.format(DateTimeFormatter.ofPattern(format));
    }

    /**
     * 格式化日期时间
     *
     * @param dateTime 日期时间
     * @param format   格式
     * @return 格式化后的日期时间字符串
     */
    public static String format(LocalDateTime dateTime, String format) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern(format));
    }

    /**
     * 解析日期字符串，格式为yyyy-MM-dd
     *
     * @param dateStr 日期字符串
     * @return 日期对象
     */
    public static LocalDate parseDate(String dateStr) {
        return parse(dateStr, DEFAULT_DATE_FORMAT);
    }

    /**
     * 解析日期时间字符串，格式为yyyy-MM-dd HH:mm:ss
     *
     * @param dateTimeStr 日期时间字符串
     * @return 日期时间对象
     */
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return parseDateTime(dateTimeStr, DEFAULT_DATETIME_FORMAT);
    }

    /**
     * 解析日期字符串
     *
     * @param dateStr 日期字符串
     * @param format  格式
     * @return 日期对象
     */
    public static LocalDate parse(String dateStr, String format) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(format));
    }

    /**
     * 解析日期时间字符串
     *
     * @param dateTimeStr 日期时间字符串
     * @param format      格式
     * @return 日期时间对象
     */
    public static LocalDateTime parseDateTime(String dateTimeStr, String format) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern(format));
    }

    /**
     * 计算两个日期之间的天数差
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 天数差
     */
    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return endDate.toEpochDay() - startDate.toEpochDay();
    }

    /**
     * 计算两个日期时间之间的天数差
     *
     * @param startDateTime 开始日期时间
     * @param endDateTime   结束日期时间
     * @return 天数差
     */
    public static long daysBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime == null || endDateTime == null) {
            return 0;
        }
        LocalDate startDate = startDateTime.toLocalDate();
        LocalDate endDate = endDateTime.toLocalDate();
        return daysBetween(startDate, endDate);
    }

    /**
     * 计算两个日期之间的月数差
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 月数差
     */
    public static int monthsBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return (endDate.getYear() - startDate.getYear()) * 12 + endDate.getMonthValue() - startDate.getMonthValue();
    }

    /**
     * 计算两个日期之间的年数差
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 年数差
     */
    public static int yearsBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return endDate.getYear() - startDate.getYear();
    }

    /**
     * 获取日期是一年中的第几天
     *
     * @param date 日期
     * @return 一年中的第几天
     */
    public static int dayOfYear(LocalDate date) {
        if (date == null) {
            return 0;
        }
        return date.getDayOfYear();
    }

    /**
     * 获取日期是一月中的第几天
     *
     * @param date 日期
     * @return 一月中的第几天
     */
    public static int dayOfMonth(LocalDate date) {
        if (date == null) {
            return 0;
        }
        return date.getDayOfMonth();
    }

    /**
     * 获取日期是一周中的第几天（1-7，周一到周日）
     *
     * @param date 日期
     * @return 一周中的第几天
     */
    public static int dayOfWeek(LocalDate date) {
        if (date == null) {
            return 0;
        }
        return date.getDayOfWeek().getValue();
    }
} 