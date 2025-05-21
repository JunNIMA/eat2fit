package com.eat2fit.user.service;

import com.eat2fit.user.dto.UserLoginDTO;
import com.eat2fit.user.dto.UserRegisterDTO;
import com.eat2fit.user.vo.LoginVO;
import com.eat2fit.user.vo.UserVO;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 注册用户
     * 
     * @param userRegisterDTO 用户注册信息
     * @return 注册结果（用户ID）
     */
    Long register(UserRegisterDTO userRegisterDTO);

    /**
     * 用户登录
     * 
     * @param userLoginDTO 登录信息
     * @return 登录结果
     */
    LoginVO login(UserLoginDTO userLoginDTO);

    /**
     * 获取用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息
     */
    UserVO getUserInfo(Long userId);

    /**
     * 更新用户信息
     * 
     * @param userId 用户ID
     * @param userVO 用户信息
     * @return 更新结果
     */
    boolean updateUserInfo(Long userId, UserVO userVO);

    /**
     * 检查用户名是否存在
     * 
     * @param username 用户名
     * @return 是否存在
     */
    boolean checkUsernameExists(String username);

    /**
     * 检查手机号是否存在
     * 
     * @param phone 手机号
     * @return 是否存在
     */
    boolean checkPhoneExists(String phone);

    /**
     * 检查邮箱是否存在
     * 
     * @param email 邮箱
     * @return 是否存在
     */
    boolean checkEmailExists(String email);
} 