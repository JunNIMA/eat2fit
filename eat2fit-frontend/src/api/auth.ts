import request from '@/utils/request'
import { LoginParams, ApiResponse, LoginVO } from '@/types'

/**
 * 用户登录
 * @param data 登录参数
 * @returns 登录响应
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginVO>> => {
  return request.post('/user/login', data)
}

/**
 * 用户注册
 * @param data 注册参数
 * @returns 注册响应
 */
export const register = (data: {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
}): Promise<ApiResponse<number>> => {
  return request.post('/user/register', data)
}

/**
 * 用户登出
 * @returns 登出响应
 */
export const logout = (): Promise<ApiResponse<null>> => {
  return request.post('/user/logout')
} 