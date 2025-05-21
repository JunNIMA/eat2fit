import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  getCourses, 
  getCourseDetail, 
  getPlans, 
  getPlanDetail, 
  getUserPlans, 
  getCurrentPlan,
  getCheckInList,
  Course,
  Plan,
  PlanDetail,
  UserPlan,
  CheckIn
} from '@/api/fitness'
import { message } from 'antd'
import axios from 'axios'
import { CancelTokenSource } from 'axios'

// 定义状态类型
interface FitnessState {
  courses: {
    list: Course[]
    total: number
    loading: boolean
    error: string | null
  }
  currentCourse: {
    data: Course | null
    loading: boolean
    error: string | null
  }
  plans: {
    list: Plan[]
    total: number
    loading: boolean
    error: string | null
  }
  currentPlan: {
    plan: Plan | null
    details: PlanDetail[]
    loading: boolean
    error: string | null
  }
  userPlans: {
    list: UserPlan[]
    total: number
    loading: boolean
    error: string | null
  }
  activePlan: {
    data: UserPlan | null
    loading: boolean
    error: string | null
  }
  checkIns: {
    list: CheckIn[]
    total: number
    loading: boolean
    error: string | null
  }
}

// 初始状态
const initialState: FitnessState = {
  courses: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  currentCourse: {
    data: null,
    loading: false,
    error: null,
  },
  plans: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  currentPlan: {
    plan: null,
    details: [],
    loading: false,
    error: null,
  },
  userPlans: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  activePlan: {
    data: null,
    loading: false,
    error: null,
  },
  checkIns: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  }
}

// 异步Action
export const fetchCourses = createAsyncThunk(
  'fitness/fetchCourses',
  async (params: { 
    current?: number; 
    size?: number; 
    fitnessGoal?: number; 
    difficulty?: number; 
    keyword?: string; 
    cancelToken?: CancelTokenSource 
  }, { rejectWithValue }) => {
    try {
      const response = await getCourses({
        current: params.current || 1,
        size: params.size || 10,
        fitnessGoal: params.fitnessGoal,
        difficulty: params.difficulty,
        keyword: params.keyword
      }, params.cancelToken)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取课程列表失败')
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('课程列表请求已取消:', error.message);
        return rejectWithValue('');  // 返回空字符串，这样不会显示错误消息
      }
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchCourseDetail = createAsyncThunk(
  'fitness/fetchCourseDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getCourseDetail(id)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取课程详情失败')
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('课程详情请求已取消:', error.message);
        return rejectWithValue('');  // 返回空字符串，这样不会显示错误消息
      }
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchPlans = createAsyncThunk(
  'fitness/fetchPlans',
  async (params: { current?: number; size?: number; fitnessGoal?: number; difficulty?: number; keyword?: string }, { rejectWithValue }) => {
    try {
      const response = await getPlans({
        current: params.current || 1,
        size: params.size || 10,
        fitnessGoal: params.fitnessGoal,
        difficulty: params.difficulty,
        keyword: params.keyword
      })
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取训练计划列表失败')
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchPlanDetail = createAsyncThunk(
  'fitness/fetchPlanDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getPlanDetail(id)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取训练计划详情失败')
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchUserPlans = createAsyncThunk(
  'fitness/fetchUserPlans',
  async (params: { status?: number; current?: number; size?: number }, { rejectWithValue }) => {
    try {
      const response = await getUserPlans(params.status, params.current, params.size)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取用户训练计划失败')
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchActivePlan = createAsyncThunk(
  'fitness/fetchActivePlan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentPlan()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取当前训练计划失败')
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

export const fetchCheckIns = createAsyncThunk(
  'fitness/fetchCheckIns',
  async (params: { startDate?: string; endDate?: string; current?: number; size?: number }, { rejectWithValue }) => {
    try {
      const response = await getCheckInList(params.startDate, params.endDate, params.current, params.size)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || '获取打卡记录失败')
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试')
    }
  }
)

// 创建Slice
const fitnessSlice = createSlice({
  name: 'fitness',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse.data = null
    },
    clearCurrentPlan: (state) => {
      state.currentPlan.plan = null
      state.currentPlan.details = []
    },
  },
  extraReducers: (builder) => {
    // 处理课程列表
    builder.addCase(fetchCourses.pending, (state) => {
      state.courses.loading = true
      state.courses.error = null
    })
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.courses.loading = false
      state.courses.list = action.payload.records
      state.courses.total = action.payload.total
    })
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.courses.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.courses.error = action.payload as string
        message.error(action.payload as string)
      }
    })

    // 处理课程详情
    builder.addCase(fetchCourseDetail.pending, (state) => {
      state.currentCourse.loading = true
      state.currentCourse.error = null
    })
    builder.addCase(fetchCourseDetail.fulfilled, (state, action) => {
      state.currentCourse.loading = false
      state.currentCourse.data = action.payload
    })
    builder.addCase(fetchCourseDetail.rejected, (state, action) => {
      state.currentCourse.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.currentCourse.error = action.payload as string
        message.error(action.payload as string)
      }
    })

    // 处理训练计划列表
    builder.addCase(fetchPlans.pending, (state) => {
      state.plans.loading = true
      state.plans.error = null
    })
    builder.addCase(fetchPlans.fulfilled, (state, action) => {
      state.plans.loading = false
      state.plans.list = action.payload.records
      state.plans.total = action.payload.total
    })
    builder.addCase(fetchPlans.rejected, (state, action) => {
      state.plans.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.plans.error = action.payload as string
        message.error(action.payload as string)
      }
    })

    // 处理训练计划详情
    builder.addCase(fetchPlanDetail.pending, (state) => {
      state.currentPlan.loading = true
      state.currentPlan.error = null
    })
    builder.addCase(fetchPlanDetail.fulfilled, (state, action) => {
      state.currentPlan.loading = false
      state.currentPlan.plan = action.payload.plan
      state.currentPlan.details = action.payload.details
    })
    builder.addCase(fetchPlanDetail.rejected, (state, action) => {
      state.currentPlan.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.currentPlan.error = action.payload as string
        message.error(action.payload as string)
      }
    })

    // 处理用户训练计划列表
    builder.addCase(fetchUserPlans.pending, (state) => {
      state.userPlans.loading = true
      state.userPlans.error = null
    })
    builder.addCase(fetchUserPlans.fulfilled, (state, action) => {
      state.userPlans.loading = false
      state.userPlans.list = action.payload.records
      state.userPlans.total = action.payload.total
    })
    builder.addCase(fetchUserPlans.rejected, (state, action) => {
      state.userPlans.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.userPlans.error = action.payload as string
        message.error(action.payload as string)
      }
    })

    // 处理当前计划
    builder.addCase(fetchActivePlan.pending, (state) => {
      state.activePlan.loading = true
      state.activePlan.error = null
    })
    builder.addCase(fetchActivePlan.fulfilled, (state, action) => {
      state.activePlan.loading = false
      state.activePlan.data = action.payload
    })
    builder.addCase(fetchActivePlan.rejected, (state, action) => {
      state.activePlan.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.activePlan.error = action.payload as string
      }
    })

    // 处理打卡记录
    builder.addCase(fetchCheckIns.pending, (state) => {
      state.checkIns.loading = true
      state.checkIns.error = null
    })
    builder.addCase(fetchCheckIns.fulfilled, (state, action) => {
      state.checkIns.loading = false
      state.checkIns.list = action.payload.records
      state.checkIns.total = action.payload.total
    })
    builder.addCase(fetchCheckIns.rejected, (state, action) => {
      state.checkIns.loading = false
      // 如果是空字符串(请求被取消)，不设置错误状态
      if (action.payload && action.payload !== '') {
        state.checkIns.error = action.payload as string
        message.error(action.payload as string)
      }
    })
  }
})

export const { clearCurrentCourse, clearCurrentPlan } = fitnessSlice.actions
export default fitnessSlice.reducer 