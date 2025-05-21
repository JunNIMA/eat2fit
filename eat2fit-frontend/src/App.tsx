import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import { Spin } from 'antd'

// 应用级别标记，防止多次请求
let hasCheckedAuth = false;

function App() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查用户是否已登录，并加载用户信息
    const checkAuthentication = async () => {
      // 如果已经检查过认证状态，则不再重复检查
      if (hasCheckedAuth) {
        console.log('已经检查过认证状态，跳过');
        setLoading(false);
        return;
      }
      
      try {
        // 检查认证状态 - 这里会通过getCurrentUser加载用户信息
        await dispatch(checkAuth()).unwrap()
        // 标记已经检查过认证
        hasCheckedAuth = true;
      } catch (error) {
        console.error('认证检查失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthentication()
  }, [dispatch])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="正在加载..." />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default App 