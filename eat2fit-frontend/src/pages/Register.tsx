import { Form, Input, Button, message, Alert, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '@/api/auth';
import { UserRegisterDTO } from '@/types';
import { handleApiError } from '@/utils/errorHandler';

const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: UserRegisterDTO) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(values);
      if (handleApiError(response, true, '注册失败')) {
        message.success('注册成功，请登录');
        navigate('/login');
      }
    } catch (err: any) {
      handleApiError({
        success: false,
        code: 500,
        message: err.message || '注册失败，请重试',
        data: null
      }, true, '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名!' },
            { min: 4, max: 20, message: '用户名长度需在4-20之间' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码!' },
            { min: 6, max: 20, message: '密码长度需在6-20之间' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
          />
        </Form.Item>

        <Form.Item
          name="nickname"
        >
          <Input 
            placeholder="昵称（选填）" 
          />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="手机号（选填）" 
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="邮箱（选填）" 
          />
        </Form.Item>

        <Form.Item name="gender">
          <Select placeholder="性别（选填）">
            <Option value={1}>男</Option>
            <Option value={2}>女</Option>
            <Option value={0}>保密</Option>
          </Select>
        </Form.Item>

        <Form.Item name="fitnessGoal">
          <Select placeholder="健身目标（选填）">
            <Option value={1}>增肌</Option>
            <Option value={2}>减脂</Option>
            <Option value={3}>塑形</Option>
            <Option value={4}>维持</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
          >
            注册
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default Register; 