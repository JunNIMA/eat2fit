package com.eat2fit.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eat2fit.common.exception.BusinessException;
import com.eat2fit.common.exception.ErrorCode;
import com.eat2fit.user.dto.UserLoginDTO;
import com.eat2fit.user.dto.UserRegisterDTO;
import com.eat2fit.user.entity.User;
import com.eat2fit.user.mapper.UserMapper;
import com.eat2fit.user.service.UserService;
import com.eat2fit.user.utils.JwtTokenUtil;
import com.eat2fit.user.vo.LoginVO;
import com.eat2fit.user.vo.UserVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long register(UserRegisterDTO userRegisterDTO) {
        // 校验用户名、手机号、邮箱是否已存在
        checkUserInfoExists(userRegisterDTO.getUsername(), userRegisterDTO.getPhone(), userRegisterDTO.getEmail());
        
        // 创建用户实体
        User user = new User();
        BeanUtils.copyProperties(userRegisterDTO, user);
        
        // 密码加密
        user.setPassword(passwordEncoder.encode(userRegisterDTO.getPassword()));
        
        // 设置默认昵称
        if (user.getNickname() == null || user.getNickname().isEmpty()) {
            user.setNickname(user.getUsername());
        }
        
        // 保存用户
        save(user);
        
        return user.getId();
    }

    @Override
    public LoginVO login(UserLoginDTO userLoginDTO) {
        // 根据账号查询用户
        User user = getByAccount(userLoginDTO.getAccount());
        
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_LOGIN_ERROR);
        }
        
        // 校验密码
        if (!passwordEncoder.matches(userLoginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.USER_LOGIN_ERROR);
        }
        
        // 校验账号状态
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ErrorCode.USER_ACCOUNT_DISABLED);
        }

        
        // 生成token
        Map<String,Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("username", user.getUsername());
        String token = jwtTokenUtil.generateToken(claims);
        
        // 返回登录信息
        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setNickname(user.getNickname());
        loginVO.setAvatar(user.getAvatar());
        loginVO.setToken(token);
        
        return loginVO;
    }

    @Override
    public UserVO getUserInfo(Long userId) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        
        UserVO userVO = new UserVO();
        BeanUtils.copyProperties(user, userVO);
        
        return userVO;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUserInfo(Long userId, UserVO userVO) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        
        User updateUser = new User();
        updateUser.setId(userId);
        
        // 只允许更新部分字段
        updateUser.setNickname(userVO.getNickname());
        updateUser.setAvatar(userVO.getAvatar());
        updateUser.setGender(userVO.getGender());
        updateUser.setAge(userVO.getAge());
        updateUser.setHeight(userVO.getHeight());
        updateUser.setWeight(userVO.getWeight());
        updateUser.setFitnessGoal(userVO.getFitnessGoal());
        updateUser.setEmail(userVO.getEmail());
        updateUser.setPhone(userVO.getPhone());
        return updateById(updateUser);
    }

    @Override
    public boolean checkUsernameExists(String username) {
        return count(new LambdaQueryWrapper<User>().eq(User::getUsername, username)) > 0;
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return count(new LambdaQueryWrapper<User>().eq(User::getPhone, phone)) > 0;
    }

    @Override
    public boolean checkEmailExists(String email) {
        return count(new LambdaQueryWrapper<User>().eq(User::getEmail, email)) > 0;
    }
    
    /**
     * 校验用户信息是否已存在
     */
    private void checkUserInfoExists(String username, String phone, String email) {
        if (checkUsernameExists(username)) {
            throw new BusinessException(ErrorCode.USER_USERNAME_EXISTS);
        }
        
        if (phone != null && !phone.isEmpty() && checkPhoneExists(phone)) {
            throw new BusinessException(ErrorCode.USER_PHONE_EXISTS);
        }
        
        if (email != null && !email.isEmpty() && checkEmailExists(email)) {
            throw new BusinessException(ErrorCode.USER_EMAIL_EXISTS);
        }
    }
    
    /**
     * 根据账号查询用户
     */
    private User getByAccount(String account) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, account)
                .or().eq(User::getPhone, account)
                .or().eq(User::getEmail, account);
        
        return getOne(queryWrapper);
    }
} 