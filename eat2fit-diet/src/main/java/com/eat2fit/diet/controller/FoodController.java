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
@Tag(name = "食物接口", description = "提供食物相关接口")
public class FoodController {

    @Autowired
    private FoodService foodService;
    
    @Autowired
    private AliyunOSSOperator aliyunOSSOperator;

    @GetMapping("/page")
    @Operation(summary = "分页查询食物", description = "根据条件分页查询食物列表")
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

    @GetMapping("/list")
    @Operation(summary = "获取全部食物", description = "获取全部食物列表，用于下拉选择")
    public Result<List<FoodVO>> getAllFoods() {
        List<Food> foods = foodService.list();
        
        // 转换为VO
        List<FoodVO> voList = new ArrayList<>();
        for (Food food : foods) {
            FoodVO vo = new FoodVO();
            BeanUtils.copyProperties(food, vo);
            voList.add(vo);
        }
        
        return Result.success(voList);
    }

    @GetMapping("/categories")
    @Operation(summary = "获取食物分类", description = "获取所有食物分类")
    public Result<List<String>> getCategories() {
        List<String> categories = foodService.getAllCategories();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取食物详情", description = "根据ID获取食物详情")
    public Result<FoodVO> getDetail(@PathVariable Long id) {
        Food food = foodService.getById(id);
        if (food == null) {
            return Result.failed("食物不存在");
        }
        
        FoodVO vo = new FoodVO();
        BeanUtils.copyProperties(food, vo);
        
        return Result.success(vo);
    }
    
    /**
     * 以下是管理接口，需要管理员权限
     */
    
    @PostMapping
    @Operation(summary = "添加食物", description = "添加新的食物")
    public Result<Boolean> addFood(@RequestBody Food food) {
        boolean saved = foodService.save(food);
        return Result.success(saved);
    }
    
    @PutMapping
    @Operation(summary = "更新食物", description = "更新已有食物")
    public Result<Boolean> updateFood(@RequestBody Food food) {
        boolean updated = foodService.updateById(food);
        return Result.success(updated);
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