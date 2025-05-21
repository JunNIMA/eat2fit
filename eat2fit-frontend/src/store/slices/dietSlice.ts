import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  Recipe, 
  Food,
  getRecipes, 
  getFoods, 
  getFoodCategories, 
  getRecommendRecipes 
} from '@/api/diet'

interface DietState {
  recipes: Recipe[];
  foods: Food[];
  foodCategories: string[];
  recommendRecipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: DietState = {
  recipes: [],
  foods: [],
  foodCategories: [],
  recommendRecipes: [],
  loading: false,
  error: null
}

// 获取食谱列表
export const fetchRecipes = createAsyncThunk(
  'diet/fetchRecipes',
  async (params: { current: number; size: number; fitnessGoal?: number; difficulty?: number; keyword?: string }, { rejectWithValue }) => {
    try {
      const response = await getRecipes(params);
      if (response.success) {
        return response.data.records;
      }
      return rejectWithValue(response.message || '获取食谱列表失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取食谱列表失败');
    }
  }
);

// 获取食物列表
export const fetchFoods = createAsyncThunk(
  'diet/fetchFoods',
  async (params: { current: number; size: number; category?: string; keyword?: string }, { rejectWithValue }) => {
    try {
      const response = await getFoods(params);
      if (response.success) {
        return response.data.records;
      }
      return rejectWithValue(response.message || '获取食物列表失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取食物列表失败');
    }
  }
);

// 获取食物类别
export const fetchFoodCategories = createAsyncThunk(
  'diet/fetchFoodCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFoodCategories();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取食物类别失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取食物类别失败');
    }
  }
);

// 获取推荐食谱
export const fetchRecommendRecipes = createAsyncThunk(
  'diet/fetchRecommendRecipes',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      const response = await getRecommendRecipes(limit);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取推荐食谱失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取推荐食谱失败');
    }
  }
);

const dietSlice = createSlice({
  name: 'diet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 食谱列表
    builder.addCase(fetchRecipes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecipes.fulfilled, (state, action) => {
      state.loading = false;
      state.recipes = action.payload;
    });
    builder.addCase(fetchRecipes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // 食物列表
    builder.addCase(fetchFoods.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFoods.fulfilled, (state, action) => {
      state.loading = false;
      state.foods = action.payload;
    });
    builder.addCase(fetchFoods.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // 食物类别
    builder.addCase(fetchFoodCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFoodCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.foodCategories = action.payload;
    });
    builder.addCase(fetchFoodCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // 推荐食谱
    builder.addCase(fetchRecommendRecipes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecommendRecipes.fulfilled, (state, action) => {
      state.loading = false;
      state.recommendRecipes = action.payload;
    });
    builder.addCase(fetchRecommendRecipes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearError } = dietSlice.actions;

export default dietSlice.reducer; 