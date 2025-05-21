/**
 * API响应类型
 */
export interface ApiResponse<T> {
  /**
   * 状态码
   */
  code: number;
  
  /**
   * 提示信息
   */
  message: string;
  
  /**
   * 返回数据
   */
  data: T;
  
  /**
   * 是否成功
   */
  success: boolean;
} 