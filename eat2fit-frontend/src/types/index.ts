import { ReactNode } from 'react';

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  success: boolean
}

// 登录返回值类型
export interface LoginVO {
  userId: number
  username: string
  nickname: string
  avatar: string
  token: string
}

// 登录请求参数
export interface LoginParams {
  account: string
  password: string
}

// 用户信息类型
export interface UserVO {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
  gender: number
  age: number
  height: number
  weight: number
  fitnessGoal: number
  status: number
  createTime: string
}

// 注册请求参数
export interface UserRegisterDTO {
  username: string
  password: string
  nickname?: string
  phone?: string
  email?: string
  gender?: number
  age?: number
  height?: number
  weight?: number
  fitnessGoal?: number
}

// 路由元数据类型
export interface RouteMetaData {
  title: string
  requiresAuth: boolean
  icon?: ReactNode
}

// 健身计划类型
export interface FitnessPlan {
  id: number
  name: string
  type: string
  level: string
  duration: number
  description: string
  videoUrl?: string
  createdAt: string
}

// 饮食计划类型
export interface DietPlan {
  id: number
  name: string
  type: string
  calories: number
  protein: number
  carbs: number
  fat: number
  description: string
  recipes: string[]
  createdAt: string
} 