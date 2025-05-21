import { lazy, Suspense } from 'react'
import { useRoutes, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '@/store/hooks'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'

// 路由懒加载
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const FitnessPlans = lazy(() => import('@/pages/fitness/FitnessPlans'))
const FitnessPlanDetail = lazy(() => import('@/pages/fitness/FitnessPlanDetail'))
const Courses = lazy(() => import('@/pages/fitness/Courses'))
const CourseDetail = lazy(() => import('@/pages/fitness/CourseDetail'))
const UserPlans = lazy(() => import('@/pages/fitness/UserPlans'))
const PlanList = lazy(() => import('@/pages/fitness/PlanList'))
const Favorites = lazy(() => import('@/pages/fitness/Favorites'))
const CheckIn = lazy(() => import('@/pages/fitness/CheckIn'))
const PlanManagement = lazy(() => import('@/pages/fitness/PlanManagement'))
const Recipes = lazy(() => import('@/pages/diet/Recipes'))
const RecipeDetail = lazy(() => import('@/pages/diet/RecipeDetail'))
const RecipeFavorites = lazy(() => import('@/pages/diet/RecipeFavorites'))
const Foods = lazy(() => import('@/pages/diet/Foods'))
const Profile = lazy(() => import('@/pages/user/Profile'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// AI功能页面
const AiIndex = lazy(() => import('@/pages/ai'))
const CoachChat = lazy(() => import('@/pages/ai/CoachChat'))
const HealthQuiz = lazy(() => import('@/pages/ai/HealthQuiz'))

// 路由加载时的加载组件
const Loader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
)

// 授权路由守卫
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useAppSelector(state => state.auth)
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// 主路由组件
const AppRouter = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <PrivateRoute element={<MainLayout />} />,
      children: [
        { path: '', element: <Navigate to="/dashboard" replace /> },
        { 
          path: 'dashboard', 
          element: (
            <Suspense fallback={Loader}>
              <Dashboard />
            </Suspense>
          )
        },
        { 
          path: 'fitness', 
          children: [
            { 
              path: '', 
              element: (
                <Suspense fallback={Loader}>
                  <PlanList />
                </Suspense>
              )
            },
            { 
              path: ':id', 
              element: (
                <Suspense fallback={Loader}>
                  <FitnessPlanDetail />
                </Suspense>
              )
            },
            { 
              path: 'favorites', 
              element: (
                <Suspense fallback={Loader}>
                  <Favorites />
                </Suspense>
              )
            },
            { 
              path: 'myplans', 
              element: (
                <Suspense fallback={Loader}>
                  <UserPlans />
                </Suspense>
              )
            },
            { 
              path: 'checkin', 
              element: (
                <Suspense fallback={Loader}>
                  <CheckIn />
                </Suspense>
              )
            }
          ]
        },
        { 
          path: 'fitness/courses', 
          element: (
            <Suspense fallback={Loader}>
              <Courses />
            </Suspense>
          )
        },
        { 
          path: 'fitness/courses/:id', 
          element: (
            <Suspense fallback={Loader}>
              <CourseDetail />
            </Suspense>
          )
        },
        { 
          path: 'fitness/manage/plans', 
          element: (
            <Suspense fallback={Loader}>
              <PlanManagement />
            </Suspense>
          )
        },
        { 
          path: 'diet', 
          children: [
            { 
              path: '', 
              element: (
                <Suspense fallback={Loader}>
                  <Foods />
                </Suspense>
              )
            },
            { 
              path: 'recipes', 
              element: (
                <Suspense fallback={Loader}>
                  <Recipes />
                </Suspense>
              )
            },
            { 
              path: 'recipes/:id', 
              element: (
                <Suspense fallback={Loader}>
                  <RecipeDetail />
                </Suspense>
              )
            },
            { 
              path: 'favorites', 
              element: (
                <Suspense fallback={Loader}>
                  <RecipeFavorites />
                </Suspense>
              )
            },
            { 
              path: 'foods', 
              element: (
                <Suspense fallback={Loader}>
                  <Foods />
                </Suspense>
              )
            }
          ]
        },
        // AI功能路由
        {
          path: 'ai',
          children: [
            {
              path: '',
              element: (
                <Suspense fallback={Loader}>
                  <AiIndex />
                </Suspense>
              )
            },
            {
              path: 'coach',
              element: (
                <Suspense fallback={Loader}>
                  <CoachChat />
                </Suspense>
              )
            },
            {
              path: 'quiz',
              element: (
                <Suspense fallback={Loader}>
                  <HealthQuiz />
                </Suspense>
              )
            }
          ]
        },
        { 
          path: 'user/profile', 
          element: (
            <Suspense fallback={Loader}>
              <Profile />
            </Suspense>
          )
        },
      ]
    },
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        { 
          path: 'login', 
          element: (
            <Suspense fallback={Loader}>
              <Login />
            </Suspense>
          )
        },
        { 
          path: 'register', 
          element: (
            <Suspense fallback={Loader}>
              <Register />
            </Suspense>
          )
        },
      ]
    },
    { 
      path: '*', 
      element: (
        <Suspense fallback={Loader}>
          <NotFound />
        </Suspense>
      )
    }
  ])
  
  return routes
}

export default AppRouter 