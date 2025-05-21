import request from '@/utils/request'
import { ApiResponse, UserVO } from '@/types'

/**
 * 获取用户信息
 * @param userId 用户ID
 * @returns 用户信息响应
 */
export const getUserInfo = (userId: number): Promise<ApiResponse<UserVO>> => {
  return request.get(`/user/${userId}`)
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param data 用户信息
 * @returns 更新响应
 */
export const updateUserInfo = (userId: number, data: Partial<UserVO>): Promise<ApiResponse<boolean>> => {
  return request.put(`/user/${userId}`, data)
}

/**
 * 检查用户名是否存在
 * @param username 用户名
 * @returns 是否存在响应
 */
export const checkUsernameExists = (username: string): Promise<ApiResponse<boolean>> => {
  return request.get(`/user/check/username/${username}`)
}

/**
 * 检查手机号是否存在
 * @param phone 手机号
 * @returns 是否存在响应
 */
export const checkPhoneExists = (phone: string): Promise<ApiResponse<boolean>> => {
  return request.get(`/user/check/phone/${phone}`)
}

/**
 * 检查邮箱是否存在
 * @param email 邮箱
 * @returns 是否存在响应
 */
export const checkEmailExists = (email: string): Promise<ApiResponse<boolean>> => {
  return request.get(`/user/check/email/${email}`)
} 