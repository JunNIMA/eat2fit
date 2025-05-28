package com.eat2fit.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eat2fit.common.response.Result;
import com.eat2fit.user.annotation.RequiresAdmin;
import com.eat2fit.user.dto.StatusUpdateDTO;
import com.eat2fit.user.dto.RoleUpdateDTO;
import com.eat2fit.user.entity.User;
import com.eat2fit.user.service.UserService;
import com.eat2fit.user.vo.UserVO;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/admin")
@RequiresAdmin
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * 分页获取用户列表，支持搜索和过滤
     */
    @GetMapping("/users")
    public Result<Map<String, Object>> getUserList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer role,
            @RequestParam(required = false) String sort) {
        
        // 创建查询条件
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        
        // 添加搜索条件
        if (StringUtils.hasText(username)) {
            queryWrapper.like(User::getUsername, username);
        }
        if (StringUtils.hasText(nickname)) {
            queryWrapper.like(User::getNickname, nickname);
        }
        if (status != null) {
            queryWrapper.eq(User::getStatus, status);
        }
        if (role != null) {
            queryWrapper.eq(User::getRole, role);
        }
        
        // 添加排序条件
        if (StringUtils.hasText(sort)) {
            String[] sortParams = sort.split(",");
            if (sortParams.length == 2) {
                String column = sortParams[0];
                String order = sortParams[1];
                
                boolean isAsc = "asc".equalsIgnoreCase(order);
                
                // 根据字段名排序
                switch (column) {
                    case "id":
                        queryWrapper.orderBy(true, isAsc, User::getId);
                        break;
                    case "username":
                        queryWrapper.orderBy(true, isAsc, User::getUsername);
                        break;
                    case "createTime":
                        queryWrapper.orderBy(true, isAsc, User::getCreateTime);
                        break;
                    default:
                        // 默认按创建时间降序
                        queryWrapper.orderByDesc(User::getCreateTime);
                }
            } else {
                // 默认按创建时间降序
                queryWrapper.orderByDesc(User::getCreateTime);
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderByDesc(User::getCreateTime);
        }
        
        // 使用PageHelper进行分页查询
        PageHelper.startPage(page, size);
        List<User> userList = userService.list(queryWrapper);
        PageInfo<User> pageInfo = new PageInfo<>(userList);
        
        // 转换为VO
        List<UserVO> userVOList = userList.stream().map(user -> {
            UserVO userVO = new UserVO();
            userVO.setId(user.getId());
            userVO.setUsername(user.getUsername());
            userVO.setNickname(user.getNickname());
            userVO.setEmail(user.getEmail());
            userVO.setPhone(user.getPhone());
            userVO.setGender(user.getGender());
            userVO.setAge(user.getAge());
            userVO.setHeight(user.getHeight());
            userVO.setWeight(user.getWeight());
            userVO.setFitnessGoal(user.getFitnessGoal());
            userVO.setStatus(user.getStatus());
            userVO.setRole(user.getRole());
            userVO.setCreateTime(user.getCreateTime());
            userVO.setAvatar(user.getAvatar());
            return userVO;
        }).collect(Collectors.toList());
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("records", userVOList);
        result.put("total", pageInfo.getTotal());
        result.put("pages", pageInfo.getPages());
        result.put("current", pageInfo.getPageNum());
        result.put("size", pageInfo.getPageSize());
        
        return Result.success(result);
    }

    /**
     * 禁用/启用用户
     */
    @PutMapping("/users/{userId}/status")
    public Result<Boolean> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody StatusUpdateDTO statusUpdateDTO) {
        // 更新用户状态
        User user = new User();
        user.setId(userId);
        user.setStatus(statusUpdateDTO.getStatus());
        boolean result = userService.updateById(user);
        
        return Result.success(result);
    }

    /**
     * 修改用户角色
     */
    @PutMapping("/users/{userId}/role")
    public Result<Boolean> updateUserRole(
            @PathVariable Long userId,
            @RequestBody RoleUpdateDTO roleUpdateDTO) {
        // 更新用户角色
        User user = new User();
        user.setId(userId);
        user.setRole(roleUpdateDTO.getRole());
        boolean result = userService.updateById(user);
        
        return Result.success(result);
    }
    
    /**
     * 重置用户密码
     */
    @PostMapping("/users/{userId}/reset-password")
    public Result<String> resetUserPassword(@PathVariable Long userId) {
        // 调用服务重置密码
        String newPassword = userService.resetPassword(userId);
        return Result.success(newPassword);
    }
} 