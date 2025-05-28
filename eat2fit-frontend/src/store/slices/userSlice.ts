import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { UserVO } from '@/types'
import { getUserInfo } from '@/api/user'

// 跟踪最近一次请求
let lastFetchTime = 0;
const CACHE_TIME = 0; // 修改为0，禁用缓存，确保每次都重新获取数据

// 正在请求中的用户ID
let pendingRequests: Record<number, boolean> = {};

// 重置用户信息缓存状态
export const resetUserCache = () => {
  lastFetchTime = 0;
  pendingRequests = {};
}

// 获取用户信息异步action
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (userId: number, { rejectWithValue, getState }) => {
    try {
      // 如果当前用户ID的请求正在进行中，直接返回当前状态
      if (pendingRequests[userId]) {
        console.log(`用户ID ${userId} 的请求正在进行中，跳过重复请求`);
        const state = getState() as { user: UserState };
        return state.user.info || null;
      }

      // 标记该用户ID的请求为进行中
      pendingRequests[userId] = true;

      // 检查是否在缓存期内
      const now = Date.now();
      const state = getState() as { user: UserState };
      
      // 如果已有数据且在缓存期内，跳过请求
      if (state.user.info && state.user.info.id === userId && now - lastFetchTime < CACHE_TIME) {
        console.log('用户信息在缓存中，跳过重复请求');
        pendingRequests[userId] = false; // 重置请求状态
        return state.user.info;
      }
      
      console.log('发起用户信息请求:', userId);
      const response = await getUserInfo(userId)
      if (response.success) {
        // 更新最后请求时间
        lastFetchTime = now;
        pendingRequests[userId] = false; // 重置请求状态
        return response.data
      } else {
        pendingRequests[userId] = false; // 重置请求状态
        // 保留完整的错误信息，包括错误码
        return rejectWithValue({
          code: response.code,
          message: response.message || '获取用户信息失败'
        })
      }
    } catch (error: any) {
      // 出错时也需要重置请求状态
      pendingRequests[userId] = false;
      return rejectWithValue({
        code: 500,
        message: error.message || '网络错误'
      })
    }
  }
)

interface UserState {
  info: UserVO | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  info: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserInfo: (state) => {
      state.info = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false
        state.info = action.payload
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUserInfo } = userSlice.actions

export default userSlice.reducer 