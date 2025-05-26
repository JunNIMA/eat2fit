import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, CancelTokenSource } from 'axios'
import { message } from 'antd'
import { getToken } from './auth'
import { ApiResponse } from '@/types'
import { handlePlanSelectionError } from './errorHandler'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 与Vite代理配置保持一致
  timeout: 10000,
})

// 创建取消令牌
export const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 针对流式响应的特殊处理
    if (config.responseType === 'stream') {
      // 确保流式响应的请求不会被拦截器意外处理
      config.transformResponse = [data => data];
      
      // 设置合适的响应类型和头信息
      config.headers['Accept'] = 'text/event-stream';
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对于流式响应，直接返回response对象
    if (response.config.responseType === 'stream') {
      // 确认返回的是流数据
      console.log('收到流式响应', response.status, response.headers);
      return response;
    }
    
    // 尝试解析响应数据
    let res: ApiResponse<any>;
    
    try {
      res = response.data as ApiResponse<any>;
      
      // 检查是否符合ApiResponse格式要求
      if (res === null || typeof res !== 'object' || (res.success === undefined && res.code === undefined)) {
        console.error('API响应格式异常:', response.config.url, response.data);
        throw new Error('服务器返回了无效的数据格式');
      }
    } catch (error) {
      console.error('解析API响应失败:', response.config.url, error);
      return Promise.reject(new Error('无法解析服务器响应'));
    }
    
    // 增强日志记录，特别关注课程详情接口
    if (response.config.url && response.config.url.includes('/fitness/courses/')) {
      console.log('课程API调用:', response.config.url, '请求方法:', response.config.method);
      console.log('响应数据:', res);
    } else {
      console.log('请求URL:', response.config.url, '响应数据:', res);
    }
    
    // 如果不是成功状态码
    if (!res.success && res.code !== 0 && res.code !== 200) {
      console.error('API响应错误:', response.config.url, res);
      
      // 处理特定错误码，如401未授权
      if (res.code === 401) {
        // 获取当前路径，用于登录后重定向回来
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectPath', currentPath);
        
        // 跳转到登录页
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 不直接显示通用错误消息，而是返回具体错误，让调用方处理
      return Promise.reject(new Error(res.message || '服务器返回了一个错误'))
    }
    
    return res as any
  },
  (error) => {
    // 检查是否为取消请求的错误
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message);
      // 直接返回被拒绝的Promise，但不显示错误消息，也不打印错误日志
      return Promise.reject(error);
    }
    
    // 安全地访问error对象的属性
    const config = error.config || {};
    const response = error.response || {};
    const status = response.status;
    
    console.error('API请求失败:', config.url, error);
    
    // 处理401未授权错误
    if (status === 401) {
      console.warn('接收到401未授权响应，准备重定向到登录页');
      
      // 保存当前路径用于登录后重定向
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectPath', currentPath);
      
      // 如果是在/login页面，不再重定向避免循环
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // 检查是否为AI相关接口
    if (config.url && (
      config.url.includes('/ai/chat') || 
      config.url.includes('/ai/health/qa') || 
      config.url.includes('/ai/history')
    )) {
      // AI接口错误不显示全局消息，而是让组件自行处理
      console.warn('AI接口请求失败，将由组件处理错误');
      let errorMessage = '与AI服务通信失败';
      
      if (status === 404) {
        errorMessage = 'AI服务未找到';
      } else if (status === 500) {
        errorMessage = 'AI服务内部错误';
      } else if (status === 0) {
        errorMessage = '网络连接错误或服务器未响应';
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // 只针对/api/fitness/plans/choose接口的错误进行特殊处理
    if (config.url && config.url.includes('/fitness/plans/choose')) {
      // 使用健身计划特定的错误处理
      if (handlePlanSelectionError(error)) {
        return Promise.reject(error)
      }
    } else {
      // 其他接口的通用错误处理
      let errorMsg = '网络错误，请稍后重试'
      
      if (status === 404) {
        errorMsg = '请求的资源不存在'
      } else if (status === 500) {
        errorMsg = '服务器错误，请稍后重试'
      }
      
      // 对于非AI接口的错误，显示错误消息
      message.error(errorMsg)
    }
    
    return Promise.reject(error)
  }
)

export default request 