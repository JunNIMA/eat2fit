import request from '@/utils/request'
import { ApiResponse, FitnessPlan } from '@/types'
import { CancelTokenSource } from 'axios';

/**
 * 获取健身计划列表
 * @returns 健身计划列表响应
 */
export const getFitnessPlans = (): Promise<ApiResponse<FitnessPlan[]>> => {
  return request.get('/fitness/plans')
}

/**
 * 获取健身计划详情
 * @param id 健身计划ID
 * @returns 健身计划详情响应
 */
export const getFitnessPlanDetail = (id: number): Promise<ApiResponse<FitnessPlan>> => {
  return request.get(`/fitness/plans/${id}`)
}

/**
 * 创建健身计划
 * @param data 健身计划数据
 * @returns 创建响应
 */
export const createFitnessPlan = (data: Omit<FitnessPlan, 'id' | 'createdAt'>): Promise<ApiResponse<FitnessPlan>> => {
  return request.post('/fitness/plans', data)
}

// 课程类型定义
export interface Course {
  id: number;
  title: string;
  description: string;
  coverImg: string;
  videoUrl: string;
  duration: number;
  difficulty: number;
  difficultyText: string;
  fitnessGoal: number;
  fitnessGoalText: string;
  bodyParts: string;
  calories: number;
  instructor: string;
  equipment: string;
  viewCount: number;
  likeCount: number;
  isFavorite: boolean;
}

// 计划类型定义
export interface Plan {
  id: number;
  name: string;
  description: string;
  fitnessGoal: number;
  fitnessGoalText: string;
  difficulty: number;
  difficultyText: string;
  bodyFocus: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  coverImg: string;
  equipmentNeeded: string;
  totalDays: number;
}

// 计划详情类型
export interface PlanDetail {
  id: number;
  planId: number;
  weekNum: number;
  dayNum: number;
  courseId: number | null;
  title: string;
  description: string;
  course?: Course;
}

// 用户计划类型
export interface UserPlan {
  id: number;
  userId: number;
  planId: number;
  plan: Plan;
  startDate: string;
  endDate: string;
  currentWeek: number;
  currentDay: number;
  completionRate: number;
  progressPercent: string;
  status: number;
  statusText: string;
  todayWorkout: PlanDetail;
}

// 打卡记录类型
export interface CheckIn {
  id: number;
  userId: number;
  userPlanId: number;
  courseId: number;
  checkInDate: string;
  duration: number;
  calorieConsumption: number;
  feeling: number;
  content: string;
  images: string;
}

// 查询参数类型
export interface QueryParams {
  current: number;
  size: number;
  fitnessGoal?: number;
  difficulty?: number;
  keyword?: string;
}

// 课程相关接口
export const getCourses = (params: QueryParams, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Course[], total: number}>> => {
  return request.get('/fitness/courses/page', { params, cancelToken: cancelToken?.token });
};

/**
 * 获取课程详情
 * 调用后端 /fitness/courses/{id} 接口获取课程详情
 * 后端会自动增加课程的观看次数
 * @param id 课程ID
 * @param cancelToken 可选的取消请求令牌
 * @returns 课程详情数据
 */
export const getCourseDetail = (id: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<Course>> => {
  return request.get(`/fitness/courses/${id}`, { cancelToken: cancelToken?.token });
};

export const getRecommendCourses = (limit: number = 6): Promise<ApiResponse<Course[]>> => {
  return request.get('/fitness/courses/recommend', { params: { limit } });
};

export const increaseCourseView = (courseId: number): Promise<ApiResponse<boolean>> => {
  // 由于后端没有直接提供增加浏览量的接口，所以这里调整为模拟实现
  // 实际上浏览量是在获取详情时自动增加的
  return Promise.resolve({ success: true, code: 200, message: '操作成功', data: true });
};

export const likeCourse = (courseId: number): Promise<ApiResponse<boolean>> => {
  return request.post(`/fitness/courses/like/${courseId}`);
};

export const unlikeCourse = (courseId: number): Promise<ApiResponse<boolean>> => {
  return request.post(`/fitness/courses/unlike/${courseId}`);
};

// 课程管理接口（需要管理员权限）
export const addCourse = (course: Omit<Course, 'id' | 'difficultyText' | 'fitnessGoalText' | 'isFavorite' | 'viewCount' | 'likeCount'>): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/courses', course);
};

export const updateCourse = (course: Partial<Course> & { id: number }): Promise<ApiResponse<boolean>> => {
  return request.put('/fitness/courses', course);
};

export const deleteCourse = (id: number): Promise<ApiResponse<boolean>> => {
  return request.delete(`/fitness/courses/${id}`);
};

// 计划相关接口
export const getPlans = (params: QueryParams, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Plan[], total: number}>> => {  return request.get('/fitness/plans/page', {     params,    cancelToken: cancelToken?.token   });};

export const getPlanDetail = (id: number): Promise<ApiResponse<{plan: Plan, details: PlanDetail[]}>> => {
  return request.get(`/fitness/plans/${id}`);
};

// 新增接口：获取计划详情中的训练安排
export const getPlanDetailsById = (id: number): Promise<ApiResponse<PlanDetail[]>> => {
  return request.get(`/fitness/plans/${id}/details`);
};

// 新增接口：获取推荐计划
export const getRecommendPlans = (limit: number = 6): Promise<ApiResponse<Plan[]>> => {
  return request.get('/fitness/plans/recommend', { params: { limit } });
};

// 计划管理接口（需要管理员权限）
export interface PlanCreateDTO {
  name: string;
  description: string;
  fitnessGoal: number;
  difficulty: number;
  bodyFocus: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  coverImg?: string;
  equipmentNeeded?: string;
  details?: PlanDetail[];
}

export const addPlan = (plan: PlanCreateDTO): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/plans', plan);
};

export const updatePlan = (id: number, plan: PlanCreateDTO): Promise<ApiResponse<boolean>> => {
  return request.put(`/fitness/plans/${id}`, plan);
};

export const deletePlan = (id: number): Promise<ApiResponse<boolean>> => {
  return request.delete(`/fitness/plans/${id}`);
};

// 用户计划相关接口
export const getUserPlans = (status?: number, current: number = 1, size: number = 10, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: UserPlan[], total: number}>> => {
  return request.get('/fitness/plans/list', { params: { status, current, size }, cancelToken: cancelToken?.token });
};

export const choosePlan = (planId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<number>> => {
  return request.post('/fitness/plans/choose', { planId }, { cancelToken: cancelToken?.token });
};

export const getCurrentPlan = (cancelToken?: CancelTokenSource): Promise<ApiResponse<UserPlan>> => {
  return request.get('/fitness/plans/current', { cancelToken: cancelToken?.token });
};

/**
 * 更新训练进度
 * @param userPlanId 用户计划ID
 * @param completed 是否已完成训练（默认为true）
 * @returns 更新结果
 */
export const updatePlanProgress = (userPlanId: number, completed: boolean = true): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/plans/progress', null, { 
    params: { 
      userPlanId,
      completed
    }
  });
};

export const abandonPlan = (userPlanId: number): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/plans/abandon', null, { 
    params: { 
      userPlanId
    }
  });
};

export const completePlan = (userPlanId: number): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/plans/complete', null, { 
    params: { 
      userPlanId
    }
  });
};

/**
 * 获取今日训练内容
 * @param userPlanId 用户计划ID
 * @returns 今日训练详情
 */
export const getTodayWorkout = (userPlanId: number): Promise<ApiResponse<PlanDetail>> => {
  return request.get('/fitness/plans/today', { 
    params: { 
      userPlanId
    }
  });
};

// 打卡相关接口
export const checkIn = (data: Omit<CheckIn, 'id'>, cancelToken?: CancelTokenSource): Promise<ApiResponse<number>> => {
  return request.post('/fitness/checkin', data, { cancelToken: cancelToken?.token });
};

export const getCheckInList = (startDate?: string, endDate?: string, current: number = 1, size: number = 10, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: CheckIn[], total: number}>> => {
  return request.get('/fitness/checkin/list', { params: { startDate, endDate, current, size }, cancelToken: cancelToken?.token });
};

// 新增图片上传接口
export const uploadCheckInImage = (file: File, cancelToken?: CancelTokenSource): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/fitness/checkin/upload/image', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
    cancelToken: cancelToken?.token 
  });
};

export const uploadCheckInImages = (files: File[], cancelToken?: CancelTokenSource): Promise<ApiResponse<string[]>> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  return request.post('/fitness/checkin/upload/images', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
    cancelToken: cancelToken?.token 
  });
};

export const getCheckInStats = (cancelToken?: CancelTokenSource): Promise<ApiResponse<{
  totalCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  recentCheckIns: number;
  continuousCount: number;
  totalDuration: number;
  totalCalories: number;
}>> => {
  return request.get('/fitness/checkin/stats', { cancelToken: cancelToken?.token });
};

export const hasCheckedInToday = (userPlanId?: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.get('/fitness/checkin/check', { 
    params: { 
      userPlanId
    },
    cancelToken: cancelToken?.token
  });
};

// 收藏相关接口
export const addFavorite = (type: number, targetId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/favorites/add', null, { 
    params: { 
      type,
      targetId 
    },
    cancelToken: cancelToken?.token
  });
};

export const removeFavorite = (type: number, targetId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post('/fitness/favorites/cancel', null, { 
    params: { 
      type,
      targetId 
    },
    cancelToken: cancelToken?.token
  });
};

export const checkFavorite = (type: number, targetId: number): Promise<ApiResponse<boolean>> => {
  return request.get('/fitness/favorites/check', { 
    params: { 
      type,
      targetId 
    }
  });
};

export const getFavoriteCourses = (current: number = 1, size: number = 10, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Course[], total: number}>> => {
  return request.get('/fitness/favorites/courses', { 
    params: { 
      current,
      size 
    },
    cancelToken: cancelToken?.token
  });
};

export const getFavoritePlans = (current: number = 1, size: number = 10, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Plan[], total: number}>> => {
  return request.get('/fitness/favorites/plans', { 
    params: { 
      current,
      size 
    },
    cancelToken: cancelToken?.token
  });
};

/**
 * 检查用户今天是否已经完成了训练
 * @param userPlanId 用户计划ID
 * @returns 是否已完成今天的训练
 */
export const isWorkoutCompletedToday = (userPlanId: number): Promise<ApiResponse<boolean>> => {
  return request.get('/fitness/plans/today/completed', {
    params: { 
      userPlanId
    }
  });
};

// 新增接口：获取健身计划统计数据
export const getFitnessPlanStats = (): Promise<ApiResponse<{
  totalCount: number;
  todayNewCount: number;
}>> => {
  return request.get('/fitness/plans/stats');
}; 