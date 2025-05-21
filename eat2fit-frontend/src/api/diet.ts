import request from '@/utils/request'
import { ApiResponse } from '@/types'
import { CancelTokenSource } from 'axios';

// 食谱类型
export interface Recipe {
  id: number;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  totalTime?: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fitnessGoal: number;
  fitnessGoalText?: string;
  difficulty: number;
  difficultyText?: string;
  mealType: number;
  coverImg: string;
  ingredients?: RecipeIngredient[];
  steps?: any[];
  tags?: string;
  tagList?: string[];
  author?: string;
  viewCount: number;
  likeCount: number;
  isFavorite?: boolean;
}

// 食谱详情类型
export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  steps: any[];
  tagList: string[];
}

// 食谱食材类型
export interface RecipeIngredient {
  id?: number;
  recipeId?: number;
  foodId?: number;
  name: string;
  amount: number;
  unit: string;
  food?: Food;
}

// 食物类型
export interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
  imageUrl?: string;
  unit?: string;
}

// 食谱收藏类型
export interface FavoriteRecipe {
  favoriteId: number;
  favoriteTime: string;
  recipe: Recipe;
}

// 查询参数类型
export interface RecipeQueryParams {
  current: number;
  size: number;
  fitnessGoal?: number;
  mealType?: number;
  difficulty?: number;
  keyword?: string;
}

export interface FoodQueryParams {
  current: number;
  size: number;
  category?: string;
  keyword?: string;
}

// 食谱相关API

/**
 * 分页查询食谱
 * @param params 查询参数
 * @param cancelToken 可选的取消令牌
 * @returns 分页结果
 */
export const getRecipes = (params: RecipeQueryParams, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Recipe[], total: number}>> => {
  return request.get('/diet/recipes/page', { 
    params,
    cancelToken: cancelToken?.token 
  });
};

/**
 * 获取食谱详情
 * @param id 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 食谱详情
 */
export const getRecipeDetail = (id: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<RecipeDetail>> => {
  return request.get(`/diet/recipes/${id}`, {
    cancelToken: cancelToken?.token
  });
};

/**
 * 获取推荐食谱
 * @param limit 数量限制
 * @param cancelToken 可选的取消令牌
 * @returns 推荐食谱列表
 */
export const getRecommendRecipes = (limit: number = 6, cancelToken?: CancelTokenSource): Promise<ApiResponse<Recipe[]>> => {
  return request.get('/diet/recipes/recommend', { 
    params: { limit },
    cancelToken: cancelToken?.token
  });
};

/**
 * 点赞食谱
 * @param recipeId 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 操作结果
 */
export const likeRecipe = (recipeId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post(`/diet/recipes/like/${recipeId}`, {}, {
    cancelToken: cancelToken?.token
  });
};

/**
 * 取消点赞食谱
 * @param recipeId 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 操作结果
 */
export const unlikeRecipe = (recipeId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post(`/diet/recipes/unlike/${recipeId}`, {}, {
    cancelToken: cancelToken?.token
  });
};

// 食物相关API

/**
 * 分页查询食物
 * @param params 查询参数
 * @param cancelToken 可选的取消令牌
 * @returns 分页结果
 */
export const getFoods = (params: FoodQueryParams, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: Food[], total: number}>> => {
  return request.get('/diet/foods/page', { 
    params,
    cancelToken: cancelToken?.token
  });
};

/**
 * 获取食物详情
 * @param id 食物ID
 * @param cancelToken 可选的取消令牌
 * @returns 食物详情
 */
export const getFoodDetail = (id: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<Food>> => {
  return request.get(`/diet/foods/${id}`, {
    cancelToken: cancelToken?.token
  });
};

/**
 * 获取食物类别列表
 * @param cancelToken 可选的取消令牌
 * @returns 食物类别列表
 */
export const getFoodCategories = (cancelToken?: CancelTokenSource): Promise<ApiResponse<string[]>> => {
  return request.get('/diet/foods/categories', {
    cancelToken: cancelToken?.token
  });
};

// 食谱收藏相关API

/**
 * 添加收藏
 * @param recipeId 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 操作结果
 */
export const addRecipeFavorite = (recipeId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post('/diet/favorites/add', { recipeId }, {
    cancelToken: cancelToken?.token
  });
};

/**
 * 取消收藏
 * @param recipeId 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 操作结果
 */
export const removeRecipeFavorite = (recipeId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.post('/diet/favorites/cancel', { recipeId }, {
    cancelToken: cancelToken?.token
  });
};

/**
 * 检查是否已收藏
 * @param recipeId 食谱ID
 * @param cancelToken 可选的取消令牌
 * @returns 是否已收藏
 */
export const checkRecipeFavorite = (recipeId: number, cancelToken?: CancelTokenSource): Promise<ApiResponse<boolean>> => {
  return request.get('/diet/favorites/check', { 
    params: { recipeId },
    cancelToken: cancelToken?.token
  });
};

/**
 * 获取收藏食谱列表
 * @param current 当前页码
 * @param size 每页大小
 * @param cancelToken 可选的取消令牌
 * @returns 收藏食谱分页列表
 */
export const getFavoriteRecipes = (current: number = 1, size: number = 10, cancelToken?: CancelTokenSource): Promise<ApiResponse<{records: FavoriteRecipe[], total: number}>> => {
  return request.get('/diet/favorites/list', { 
    params: { current, size },
    cancelToken: cancelToken?.token
  });
};