package com.eat2fit.ai.client;

import com.eat2fit.ai.vo.UserVO;
import com.eat2fit.common.response.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient("eat2fit-user")
public interface UserClient {

    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public Result<UserVO> getUserInfo(@PathVariable Long userId);



}
