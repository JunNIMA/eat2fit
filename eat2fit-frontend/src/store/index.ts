import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import fitnessReducer from './slices/fitnessSlice'
import dietReducer from './slices/dietSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    fitness: fitnessReducer,
    diet: dietReducer,
  },
})

// 从store中推断出RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 