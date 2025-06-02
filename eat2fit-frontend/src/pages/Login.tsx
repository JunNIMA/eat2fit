import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Alert, Modal, Result } from 'antd';
import { UserOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { resetUserCache, fetchUserInfo } from '@/store/slices/userSlice';
import { LoginParams } from '@/types';
import { handleApiError } from '@/utils/errorHandler';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 组件挂载时清除之前的错误
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 监听错误状态变化，显示错误弹窗
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      console.log('显示错误弹窗:', error);
    }
  }, [error]);
  
  // 组件卸载时清除错误
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onFinish = async (values: LoginParams) => {
    try {
      // 重置用户信息缓存
      resetUserCache();
      
      const userData = await dispatch(login(values)).unwrap();
      
      // 登录成功后立即获取用户详细信息
      if (userData && userData.userId) {
        await dispatch(fetchUserInfo(userData.userId));
      }
      
      // 获取重定向路径，如果存在则重定向，不存在则前往首页
      const redirectPath = localStorage.getItem('redirectPath')
      
      if (redirectPath) {
        localStorage.removeItem('redirectPath') // 清除存储的路径
        navigate(redirectPath) // 重定向到原来的页面
      } else {
        navigate('/dashboard') // 默认导航到仪表盘页面
      }
      
    } catch (error: any) {
      console.error('登录失败:', error);
      // 登录失败时显示错误弹窗
      setShowErrorModal(true);
    }
  };

  // 处理关闭错误弹窗
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    dispatch(clearError());
  };

  // 获取错误信息和提示
  const getErrorMessage = () => {
    if (!error) return { 
      title: '登录失败', 
      message: '未知错误', 
      suggestion: '请稍后重试',
      showRegister: false,
      showReset: false
    };
    
    // 提取错误消息 (error现在应该是字符串)
    const errorMsg = error as string;
    console.log('错误信息:', errorMsg); // 调试用
    
    // 账号或密码错误 - 这种情况需要特殊处理，因为后端不区分用户不存在和密码错误
    if (errorMsg.includes('账号或密码错误')) {
      // 从表单中获取当前输入的账号
      const currentAccount = form.getFieldValue('account');
      
      // 如果表单中有账号，尝试检查账号是否存在
      // 注意：这里我们假设用户输入了账号，但实际上我们无法确定是账号不存在还是密码错误
      // 因此，我们提供一个更通用的错误提示，同时提供注册和重置密码两个选项
      return {
        title: '登录失败',
        message: '账号或密码错误',
        suggestion: '请检查您的账号和密码是否正确，或尝试注册新账号',
        showRegister: true,
        showReset: true
      };
    }
    // 用户不存在 - 虽然后端可能不会直接返回这个错误，但我们仍然保留这个处理
    else if (errorMsg.includes('用户不存在')) {
      return {
        title: '用户不存在',
        message: '该账号尚未注册',
        suggestion: '请先注册账号或检查输入是否正确',
        showRegister: true,
        showReset: false
      };
    }
    // 密码错误 - 虽然后端可能不会直接返回这个错误，但我们仍然保留这个处理
    else if (errorMsg.includes('密码错误')) {
      return {
        title: '密码错误',
        message: '您输入的密码不正确',
        suggestion: '请检查您的密码是否正确，或点击"忘记密码"重置',
        showRegister: false,
        showReset: true
      };
    }
    // 账号被禁用
    else if (errorMsg.includes('账号已被禁用')) {
      return {
        title: '账号已被禁用',
        message: '您的账号已被管理员禁用',
        suggestion: '请联系客服或管理员解决问题',
        showRegister: false,
        showReset: false
      };
    }
    // 账号被锁定
    else if (errorMsg.includes('账号已被锁定')) {
      return {
        title: '账号已被锁定',
        message: '由于多次登录失败，账号已被临时锁定',
        suggestion: '请30分钟后再尝试登录，或联系客服解锁',
        showRegister: false,
        showReset: false
      };
    }
    // 账号过期
    else if (errorMsg.includes('账号已过期')) {
      return {
        title: '账号已过期',
        message: '您的账号已过期',
        suggestion: '请联系客服或管理员续期',
        showRegister: false,
        showReset: false
      };
    }
    // 网络错误
    else if (errorMsg.includes('网络错误')) {
      return {
        title: '网络连接错误',
        message: '无法连接到服务器',
        suggestion: '请检查您的网络连接并稍后重试',
        showRegister: false,
        showReset: false
      };
    }
    // token过期
    else if (errorMsg.includes('token已过期') || errorMsg.includes('登录已过期')) {
      return {
        title: '登录已过期',
        message: '您的登录状态已过期',
        suggestion: '请重新登录',
        showRegister: false,
        showReset: false
      };
    }
    
    // 默认错误信息
    return {
      title: '登录失败',
      message: errorMsg || '登录过程中发生错误',
      suggestion: '请稍后重试或联系客服',
      showRegister: false,
      showReset: false
    };
  };

  const errorInfo = getErrorMessage();
  
  // 处理注册按钮点击
  const handleRegister = () => {
    handleCloseErrorModal();
    navigate('/register');
  };
  
  // 处理忘记密码按钮点击
  const handleForgotPassword = () => {
    handleCloseErrorModal();
    navigate('/forgot-password');
  };

  return (
    <div>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Link to="/register">立即注册</Link>
          <Link to="/forgot-password">忘记密码?</Link>
        </div>
      </Form>

      {/* 登录错误提示弹窗 */}
      <Modal
        open={showErrorModal}
        footer={null}
        onCancel={handleCloseErrorModal}
        width={400}
        centered
        closable={true}
        maskClosable={true}
      >
        <Result
          status="error"
          title={errorInfo.title}
          subTitle={
            <div>
              <p>{errorInfo.message}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>{errorInfo.suggestion}</p>
            </div>
          }
          extra={
            <>
              {errorInfo.showRegister && (
                <Button 
                  type="primary" 
                  onClick={handleRegister}
                  style={{ background: '#52c41a', borderColor: '#52c41a', marginRight: '8px' }}
                >
                  注册账号
                </Button>
              )}
              {errorInfo.showReset && (
                <Button 
                  type="primary" 
                  onClick={handleForgotPassword}
                  style={{ background: '#52c41a', borderColor: '#52c41a', marginRight: '8px' }}
                >
                  重置密码
                </Button>
              )}
              <Button 
                onClick={handleCloseErrorModal}
                style={{ minWidth: '80px' }}
              >
                我知道了
              </Button>
            </>
          }
        />
      </Modal>
    </div>
  );
};

export default Login; 