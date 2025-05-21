package com.eat2fit.common.util;

import com.eat2fit.common.constant.Constants;
import com.eat2fit.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

/**
 * 文件工具类
 */
@Slf4j
public class FileUtil {

    /**
     * 上传文件
     *
     * @param file       文件
     * @param baseDir    基础目录
     * @param allowTypes 允许的文件类型
     * @param maxSize    最大文件大小（字节）
     * @return 上传后的文件访问路径
     */
    public static String upload(MultipartFile file, String baseDir, String[] allowTypes, long maxSize) {
        // 获取文件名
        String fileName = file.getOriginalFilename();
        // 获取文件后缀
        String suffix = getSuffix(fileName);
        
        // 校验文件类型
        if (!isAllowedType(suffix, allowTypes)) {
            throw new BusinessException("不支持的文件类型: " + suffix);
        }
        
        // 校验文件大小
        if (file.getSize() > maxSize) {
            throw new BusinessException("文件大小超出限制，最大支持: " + (maxSize / 1024 / 1024) + "MB");
        }
        
        // 生成新的文件名（避免文件名冲突）
        String newFileName = generateFileName(suffix);
        
        // 按年月日生成文件路径
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        // 拼接完整存储路径
        String uploadPath = baseDir + datePath + "/";
        
        // 创建目录
        File directory = new File(uploadPath);
        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                throw new BusinessException("创建目录失败");
            }
        }
        
        // 拼接完整文件名
        String fullPath = uploadPath + newFileName;
        
        try {
            // 保存文件
            file.transferTo(new File(fullPath));
            // 返回文件访问路径（不包含物理路径）
            return Constants.UPLOAD_PATH + datePath + "/" + newFileName;
        } catch (IOException e) {
            log.error("上传文件失败", e);
            throw new BusinessException("上传文件失败: " + e.getMessage());
        }
    }
    
    /**
     * 上传图片
     *
     * @param file 图片文件
     * @return 上传后的图片访问路径
     */
    public static String uploadImage(MultipartFile file, String baseDir) {
        return upload(file, baseDir, Constants.ALLOWED_IMAGE_TYPES, Constants.MAX_FILE_SIZE);
    }
    
    /**
     * 上传视频
     *
     * @param file 视频文件
     * @return 上传后的视频访问路径
     */
    public static String uploadVideo(MultipartFile file, String baseDir) {
        return upload(file, baseDir, Constants.ALLOWED_VIDEO_TYPES, Constants.MAX_VIDEO_SIZE);
    }
    
    /**
     * 删除文件
     *
     * @param filePath 文件物理路径
     * @return 是否删除成功
     */
    public static boolean delete(String filePath) {
        File file = new File(filePath);
        if (file.exists() && file.isFile()) {
            return file.delete();
        }
        return false;
    }
    
    /**
     * 获取文件后缀
     *
     * @param fileName 文件名
     * @return 文件后缀（带.）
     */
    public static String getSuffix(String fileName) {
        if (fileName == null || fileName.isEmpty() || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    }
    
    /**
     * 判断是否为允许的文件类型
     *
     * @param suffix     文件后缀
     * @param allowTypes 允许的文件类型数组
     * @return 是否允许
     */
    public static boolean isAllowedType(String suffix, String[] allowTypes) {
        if (suffix == null || suffix.isEmpty()) {
            return false;
        }
        return Arrays.asList(allowTypes).contains(suffix.toLowerCase());
    }
    
    /**
     * 生成随机文件名
     *
     * @param suffix 文件后缀
     * @return 生成的文件名
     */
    public static String generateFileName(String suffix) {
        // 使用UUID生成随机文件名
        return UUID.randomUUID().toString().replaceAll("-", "") + suffix;
    }
} 