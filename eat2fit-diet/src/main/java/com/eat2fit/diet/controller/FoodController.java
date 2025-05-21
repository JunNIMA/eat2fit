package com.eat2fit.diet.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eat2fit.common.response.Result;
import com.eat2fit.diet.dto.FoodQueryDTO;
import com.eat2fit.diet.entity.Food;
import com.eat2fit.diet.service.FoodService;
import com.eat2fit.diet.vo.FoodVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 食物控制器
 */
@RestController
@RequestMapping("/diet/foods")
@Tag(name = "食物营养素接口", description = "提供食物营养成分相关接口")
public class FoodController {

    @Autowired
    private FoodService foodService;

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
    @Operation(summary = "获取食物类别", description = "获取所有食物类别列表")
    public Result<List<String>> getCategories() {
        QueryWrapper<Food> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("DISTINCT category")
                   .isNotNull("category");
        
        List<Object> categories = foodService.listObjs(queryWrapper);
        
        List<String> result = categories.stream()
                .map(obj -> obj != null ? obj.toString() : null)
                .filter(s -> s != null && !s.isEmpty())
                .collect(Collectors.toList());
        
        return Result.success(result);
    }
} 