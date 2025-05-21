import { Modal, message } from 'antd';
import { ApiResponse } from '@/api/types';

/**
 * 处理选择计划相关的错误
 * @param error - 错误对象
 * @returns 布尔值，表示是否已经处理了错误
 */
export const handlePlanSelectionError = (error: any): boolean => {
  let handled = false;
  
  try {
    // 从错误对象中提取信息
    if (error?.response?.data) {
      const errorData = error.response.data;
      
      // 处理字符串形式的错误
      if (typeof errorData === 'string') {
        const errorMessage = errorData;
        
        if (errorMessage.includes('已有进行中的计划')) {
          Modal.error({
            title: '无法选择计划',
            content: '已有进行中的计划，请先完成或放弃当前计划',
            okText: '我知道了',
            okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } }
          });
          handled = true;
          return true;
        }
      }
      
      // 处理对象形式的错误
      if (errorData && typeof errorData === 'object' && errorData.message) {
        const errorMessage = errorData.message;
        
        if (errorMessage.includes('已有进行中的计划')) {
          Modal.error({
            title: '无法选择计划',
            content: errorMessage,
            okText: '我知道了',
            okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } }
          });
          handled = true;
          return true;
        }
      }
    }
    
    // 直接从错误对象的message属性获取
    if (error?.message && error.message.includes('已有进行中的计划')) {
      Modal.error({
        title: '无法选择计划',
        content: '已有进行中的计划，请先完成或放弃当前计划',
        okText: '我知道了',
        okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } }
      });
      handled = true;
      return true;
    }
    
  } catch (e) {
    console.error('错误处理器出错:', e);
  }
  
  return handled;
}

/**
 * 错误处理工具函数
 * @param response API响应
 * @param showModal 是否显示弹窗
 * @param modalTitle 弹窗标题
 * @returns 是否成功
 */
export const handleApiError = (
  response: ApiResponse<any>,
  showModal: boolean = false,
  modalTitle: string = '操作失败'
): boolean => {
  if (response.success) {
    return true;
  }

  // 特定错误码处理
  switch (response.code) {
    // 用户相关错误
    case 1001: // USER_NOT_FOUND
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '用户不存在',
        });
      } else {
        message.error(response.message || '用户不存在');
      }
      break;
    case 1002: // USER_PASSWORD_ERROR
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '用户名或密码错误',
        });
      } else {
        message.error(response.message || '用户名或密码错误');
      }
      break;
    case 1003: // USER_ACCOUNT_LOCKED
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '账号已被锁定',
        });
      } else {
        message.error(response.message || '账号已被锁定');
      }
      break;
    case 1006: // USER_LOGIN_ERROR
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '账号或密码错误',
        });
      } else {
        message.error(response.message || '账号或密码错误');
      }
      break;
    case 1007: // USER_ACCOUNT_DISABLED
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '账号已被禁用',
        });
      } else {
        message.error(response.message || '账号已被禁用');
      }
      break;
    case 1008: // USER_USERNAME_EXISTS
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '用户名已存在',
        });
      } else {
        message.error(response.message || '用户名已存在');
      }
      break;
    case 1009: // USER_PHONE_EXISTS
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '手机号已存在',
        });
      } else {
        message.error(response.message || '手机号已存在');
      }
      break;
    case 1010: // USER_EMAIL_EXISTS
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '邮箱已存在',
        });
      } else {
        message.error(response.message || '邮箱已存在');
      }
      break;
        
    // 健身相关错误
    case 2004: // FITNESS_PLAN_ALREADY_IN_PROGRESS
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '已有进行中的计划，请先完成或放弃当前计划',
        });
      } else {
        message.error(response.message || '已有进行中的计划，请先完成或放弃当前计划');
      }
      break;
    case 2005: // FITNESS_PLAN_INVALID_OPERATION
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '无效的计划操作',
        });
      } else {
        message.error(response.message || '无效的计划操作');
      }
      break;
    case 2006: // FITNESS_PLAN_NO_ACCESS
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '无权访问此计划',
        });
      } else {
        message.error(response.message || '无权访问此计划');
      }
      break;
    case 2007: // FITNESS_CHECK_IN_DUPLICATE
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '今天已经打卡过了',
        });
      } else {
        message.error(response.message || '今天已经打卡过了');
      }
      break;
    default:
      if (showModal) {
        Modal.error({
          title: modalTitle,
          content: response.message || '操作失败',
        });
      } else {
        message.error(response.message || '操作失败');
      }
  }
  
  return false;
}; 