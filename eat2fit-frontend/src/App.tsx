import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import { Spin } from 'antd'
import { store } from './store'

// 移除应用级别标记
// let hasCheckedAuth = false;

function App() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查用户是否已登录，并加载用户信息
    const checkAuthentication = async () => {
      // 总是检查认证状态，确保每次应用启动都获取最新用户信息
      try {
        // 检查认证状态 - 这里会通过getCurrentUser加载用户信息
        const result = await dispatch(checkAuth()).unwrap()
        console.log('认证检查完成，用户登录状态:', result)
        
        // 如果用户已登录，打印用户信息
        if (result) {
          // 在异步操作完成后重新获取最新状态
          const currentAuthState = store.getState().auth
          console.log('当前用户信息:', currentAuthState.user)
        }
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