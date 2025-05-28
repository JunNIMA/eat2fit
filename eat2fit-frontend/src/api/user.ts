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

/**
 * 【管理员接口】获取用户列表
 * @param params 查询参数
 * @returns 用户列表响应
 */
export const getUserList = (params?: {
  page?: number;
  size?: number;
  username?: string;
  nickname?: string;
  status?: number;
  role?: number;
  sort?: string;
}): Promise<ApiResponse<{
  total: number;
  records: UserVO[];
}>> => {
  return request.get('/admin/users', { params })
}

/**
 * 【管理员接口】修改用户状态
 * @param userId 用户ID
 * @param status 新状态 (1:正常, 0:禁用)
 * @returns 操作响应
 */
export const updateUserStatus = (userId: number, status: number): Promise<ApiResponse<boolean>> => {
  return request.put(`/admin/users/${userId}/status`, { status })
}

/**
 * 【管理员接口】修改用户角色
 * @param userId 用户ID
 * @param role 新角色 (1:管理员, 0:普通用户)
 * @returns 操作响应
 */
export const updateUserRole = (userId: number, role: number): Promise<ApiResponse<boolean>> => {
  return request.put(`/admin/users/${userId}/role`, { role })
}

/**
 * 【管理员接口】重置用户密码
 * @param userId 用户ID
 * @returns 操作响应，返回新密码
 */
export const resetUserPassword = (userId: number): Promise<ApiResponse<string>> => {
  return request.post(`/admin/users/${userId}/reset-password`)
} 