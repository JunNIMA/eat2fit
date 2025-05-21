package com.eat2fit.user.controller;

import com.eat2fit.common.response.Result;
import com.eat2fit.user.dto.UserLoginDTO;
import com.eat2fit.user.dto.UserRegisterDTO;
import com.eat2fit.user.service.UserService;
import com.eat2fit.user.vo.LoginVO;
import com.eat2fit.user.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 注册
     */
    @PostMapping("/register")
    public Result<Long> register(@Validated @RequestBody UserRegisterDTO userRegisterDTO) {
        Long userId = userService.register(userRegisterDTO);
        return Result.success(userId);
    }

    /**
     * 登录
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Validated @RequestBody UserLoginDTO userLoginDTO) {
        LoginVO loginVO = userService.login(userLoginDTO);
        return Result.success(loginVO);
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public Result<UserVO> getUserInfo(@PathVariable Long userId) {
        UserVO userVO = userService.getUserInfo(userId);
        return Result.success(userVO);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{userId}")
    public Result<Boolean> updateUserInfo(
            @PathVariable Long userId,
            @RequestBody UserVO userVO) {
        boolean result = userService.updateUserInfo(userId, userVO);
        return Result.success(result);
    }

    /**
     * 检查用户名是否存在
     */
    @GetMapping("/check/username/{username}")
    public Result<Boolean> checkUsernameExists(@PathVariable String username) {
        boolean exists = userService.checkUsernameExists(username);
        return Result.success(exists);
    }

    /**
     * 检查手机号是否存在
     */
    @GetMapping("/check/phone/{phone}")
    public Result<Boolean> checkPhoneExists(@PathVariable String phone) {
        boolean exists = userService.checkPhoneExists(phone);
        return Result.success(exists);
    }

    /**
     * 检查邮箱是否存在
     */
    @GetMapping("/check/email/{email}")
    public Result<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.checkEmailExists(email);
        return Result.success(exists);
    }
} 