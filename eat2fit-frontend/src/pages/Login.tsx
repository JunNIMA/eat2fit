import { useState } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { LoginParams } from '@/types';
import { handleApiError } from '@/utils/errorHandler';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const onFinish = async (values: LoginParams) => {
    try {
      await dispatch(login(values)).unwrap()
      
      // 获取重定向路径，如果存在则重定向，不存在则前往首页
      const redirectPath = localStorage.getItem('redirectPath')
      
      if (redirectPath) {
        localStorage.removeItem('redirectPath') // 清除存储的路径
        navigate(redirectPath) // 重定向到原来的页面
      } else {
        navigate('/dashboard') // 默认导航到仪表盘页面
      }
      
    } catch (error: any) {
      console.error('登录失败:', error)
      // 这里不需要显示错误消息，因为已经在authSlice中设置了error状态
    }
  };

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="account"
          rules={[{ required: true, message: '请输入用户名/手机号/邮箱!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名/手机号/邮箱" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
          >
            登录
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login; 