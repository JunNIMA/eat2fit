import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { LoginParams, LoginVO } from '@/types'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/auth'
import { getUserInfo } from '@/api/user'
import { clearUserInfo, resetUserCache } from './userSlice'

// 登录异步action
export const login = createAsyncThunk(
  'auth/login',
  async (params: LoginParams, { rejectWithValue }) => {
    try {
      const response = await loginApi(params)
      if (response.success) {
        // 存储token
        setToken(response.data.token)
        return response.data
      } else {
        // 保留完整的错误信息，包括错误码
        return rejectWithValue(response.message || '登录失败')
      }
    } catch (error: any) {
      // 确保返回字符串类型的错误信息
      const errorMessage = error.message || '网络错误'
      console.error('登录失败:', errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

// 获取当前登录用户信息
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: AuthState }
      
      // 从localStorage中获取存储的用户ID
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        return rejectWithValue('无法获取用户信息，未找到用户ID')
      }
      
      // 请求用户详细信息
      console.log('请求用户详细信息，用户ID:', userId)
      const response = await getUserInfo(parseInt(userId))
      
      if (response.success) {
        // 构建与LoginVO兼容的用户信息
        // 从后端响应中获取角色信息，如果不存在则使用现有角色或默认为0
        const role = response.data.role !== undefined ? response.data.role : (auth.user?.role || 0);
        
        const userInfo = {
          userId: response.data.id,
          username: response.data.username,
          nickname: response.data.nickname,
          avatar: response.data.avatar,
          role: role, // 使用从后端获取的角色信息
          token: getToken() || ''
        }
        return userInfo
      } else {
        return rejectWithValue(response.message || '获取用户信息失败')
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      return rejectWithValue(error.message || '网络错误')
    }
  }
)

// 检查用户是否已登录
export const checkAuth = createAsyncThunk('auth/check', async (_, { dispatch, getState }) => {
  const token = getToken()
  console.log('检查认证状态，当前token:', token ? '存在' : '不存在')
  
  // 检查Redux中是否已有用户信息
  const { auth } = getState() as { auth: AuthState }
  if (auth.user && auth.user.userId) {
    console.log('Redux中已有用户信息，跳过获取')
    return true
  }
  
  if (token) {
    // 如果有token，尝试获取用户信息
    try {
      await dispatch(getCurrentUser()).unwrap()
      return true
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，但token存在，仍然认为用户已登录
      return true
    }
  }
  return false
})

// 退出登录action
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // 尝试调用退出API
      await logoutApi()
    } catch (error) {
      console.error('登出API调用失败:', error)
      // 即使API调用失败，仍然清除本地状态
    } finally {
      // 清除token
      removeToken()
      
      // 清除本地存储的用户ID
      localStorage.removeItem('userId')
      
      // 重置用户信息缓存
      resetUserCache()
      
      // 清除用户信息
      dispatch(clearUserInfo())
      
      // 直接分发logout action
      dispatch(authSlice.actions.logout())
      
      return true
    }
  }
)

interface AuthState {
  user: LoginVO | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isLoggedIn = false
      removeToken()
      localStorage.removeItem('userId')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginVO>) => {
        state.loading = false
        state.isLoggedIn = true
        state.user = action.payload
        // 存储用户ID到localStorage，用于后续恢复状态
        localStorage.setItem('userId', action.payload.userId.toString())
        // 重置用户信息缓存（不能在这里直接调用）
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        
        // 处理错误载荷
        if (action.payload) {
          // payload已经是字符串类型
          state.error = action.payload as string;
        } else if (action.error) {
          // 如果payload不存在但error存在
          state.error = action.error.message || '登录失败';
        } else {
          state.error = '登录失败';
        }
        
        console.log('登录失败，错误信息:', state.error);
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions

export default authSlice.reducer 