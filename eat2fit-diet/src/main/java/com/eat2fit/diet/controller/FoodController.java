package com.eat2fit.diet.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.common.util.AliyunOSSOperator;
import com.eat2fit.diet.dto.FoodQueryDTO;
import com.eat2fit.diet.entity.Food;
import com.eat2fit.diet.service.FoodService;
import com.eat2fit.diet.vo.FoodVO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 食物控制器
 */
@Slf4j
@RestController
@RequestMapping("/diet/foods")
@Tag(name = "食物营养素接口", description = "提供食物营养成分相关接口")
public class FoodController {

    @Autowired
    private FoodService foodService;
    
    @Autowired
    private AliyunOSSOperator aliyunOSSOperator;

    @GetMapping("/page")
    @Operation(summary = "分页查询食物", description = "根据条件分页查询食物营养素列表")
    public Result<Page<FoodVO>> pageList(@Parameter(description = "查询参数") FoodQueryDTO queryDTO) {
        Page<Food> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        page = foodService.pageList(page, queryDTO.getCategory(), queryDTO.getKeyword());
        
        // 转换为VO
        Page<FoodVO> resultPage = new Page<>();
        BeanUtils.copyProperties(page, resultPage, "records");
        
        List<FoodVO> voList = new ArrayList<>();
        for (Food food : page.getRecords()) {
            FoodVO vo = new FoodVO();
            BeanUtils.copyProperties(food, vo);
            voList.add(vo);
        }
        resultPage.setRecords(voList);
        
        return Result.success(resultPage);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取食物详情", description = "根据ID获取食物详情")
    public Result<FoodVO> getDetail(@Parameter(description = "食物ID") @PathVariable Long id) {
        Food food = foodService.getById(id);
        if (food == null) {
            return Result.failed("食物不存在");
        }
        
        FoodVO vo = new FoodVO();
        BeanUtils.copyProperties(food, vo);
        
        return Result.success(vo);
    }
    
    @GetMapping("/categories")
    @Operation(summary = "获取食物分类", description = "获取所有食物分类列表")
    public Result<List<String>> getCategories() {
        List<String> categories = foodService.getAllCategories();
        return Result.success(categories);
    }
    
    /**
     * 以下是管理接口，需要管理员权限
     */
    
    @PostMapping
    @Operation(summary = "添加食物", description = "添加新的食物营养素信息")
    public Result<Boolean> addFood(@RequestBody Map<String, Object> foodMap) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 处理分类字段，如果是数组，则转换为字符串
            if (foodMap.containsKey("category") && foodMap.get("category") instanceof List) {
                List<String> categories = (List<String>) foodMap.get("category");
                if (!categories.isEmpty()) {
                    foodMap.put("category", categories.get(0)); // 只取第一个分类
                } else {
                    foodMap.put("category", "未分类");
                }
            }
            
            // 将Map转换为Food对象
            Food food = objectMapper.convertValue(foodMap, Food.class);
            boolean saved = foodService.save(food);
            return Result.success(saved);
        } catch (Exception e) {
            log.error("添加食物失败", e);
            return Result.failed("添加食物失败: " + e.getMessage());
        }
    }
    
    @PutMapping
    @Operation(summary = "更新食物", description = "更新已有食物营养素信息")
    public Result<Boolean> updateFood(@RequestBody Map<String, Object> foodMap) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 处理分类字段，如果是数组，则转换为字符串
            if (foodMap.containsKey("category") && foodMap.get("category") instanceof List) {
                List<String> categories = (List<String>) foodMap.get("category");
                if (!categories.isEmpty()) {
                    foodMap.put("category", categories.get(0)); // 只取第一个分类
                } else {
                    foodMap.put("category", "未分类");
                }
            }
            
            // 将Map转换为Food对象
            Food food = objectMapper.convertValue(foodMap, Food.class);
            boolean updated = foodService.updateById(food);
            return Result.success(updated);
        } catch (Exception e) {
            log.error("更新食物失败", e);
            return Result.failed("更新食物失败: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除食物", description = "删除指定食物")
    public Result<Boolean> deleteFood(@PathVariable Long id) {
        boolean removed = foodService.removeById(id);
        return Result.success(removed);
    }
    
    /**
     * 上传食物图片
     */
    @PostMapping("/upload/image")
    @Operation(summary = "上传食物图片", description = "上传食物图片到OSS")
    public Result<String> uploadFoodImage(MultipartFile file) throws Exception {
        log.info("上传食物图片: {}", file.getOriginalFilename());
        // 上传文件到阿里云OSS
        String fileUrl = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
        log.info("上传食物图片成功，OSS URL: {}", fileUrl);
        return Result.success(fileUrl);
    }
} 