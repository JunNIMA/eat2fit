import request from '@/utils/request';
import axios from 'axios';
import { ApiResponse } from '@/types';
import { getToken } from '@/utils/auth';

// 创建一个单独的axios实例处理直接返回数组的接口
const arrayResponseClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器添加token
arrayResponseClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 智能教练聊天接口
 * @param prompt 用户输入的问题或指令
 * @param chatId 会话ID
 * @returns 流式响应的文本内容
 */
export const chatWithCoach = (prompt: string, chatId: string, onChunk?: (chunk: string) => void): Promise<Response> => {
  // ChatController指定了produces="text/html;charset=utf-8"
  const url = `/api/ai/chat?prompt=${encodeURIComponent(prompt)}&chatId=${encodeURIComponent(chatId)}`;
  console.log('请求URL:', url);
  
  const headers: HeadersInit = {
    'Accept': 'text/html',
    'Cache-Control': 'no-cache',
  };
  
  if (getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }
  
  return fetch(url, {
    method: 'GET',
    headers,
  });
};

/**
 * 健康知识问答游戏接口
 * @param prompt 用户输入的问题或答案
 * @param chatId 会话ID
 * @returns 流式响应的文本内容
 */
export const healthQA = (prompt: string, chatId: string): Promise<Response> => {
  // HealthQAController生成的是流式响应
  const url = `/api/ai/health/qa?prompt=${encodeURIComponent(prompt)}&chatId=${encodeURIComponent(chatId)}`;
  console.log('请求URL:', url);
  
  const headers: HeadersInit = {
    'Accept': 'text/html',
    'Cache-Control': 'no-cache',
  };
  
  if (getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }
  
  return fetch(url, {
    method: 'POST',
    headers,
  });
};

/**
 * 获取聊天历史ID列表
 * @param type 聊天类型，如 'chat' 或 'health-qa'
 * @returns 聊天ID列表
 */
export const getChatHistoryList = async (type: string): Promise<string[]> => {
  try {
    // 使用专用客户端直接获取数组响应
    const response = await arrayResponseClient.get(`/ai/history/${type}`);
    return response.data;
  } catch (error) {
    console.error('获取聊天历史ID列表失败:', error);
    return [];
  }
};

export interface MessageVO {
  role: string;
  content: string;
}

/**
 * 获取特定聊天的历史记录
 * @param type 聊天类型，如 'chat' 或 'health-qa'
 * @param chatId 聊天ID
 * @returns 聊天消息记录
 */
export const getChatHistory = async (type: string, chatId: string): Promise<MessageVO[]> => {
  try {
    // 使用专用客户端直接获取数组响应
    const response = await arrayResponseClient.get(`/ai/history/${type}/${chatId}`);
    return response.data || [];
  } catch (error) {
    console.error('获取聊天历史记录失败:', error);
    return [];
  }
}; 