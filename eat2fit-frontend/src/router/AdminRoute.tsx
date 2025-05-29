import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AdminRouteProps {
  element: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { isLoggedIn, user } = useAppSelector(state => state.auth);

  // 验证是否登录以及是否为管理员(role === 1)
  if (!isLoggedIn || !user || user.role !== 1) {
    // 如果不是管理员，重定向到没有权限页面或仪表盘
    return <Navigate to="/dashboard" replace />;
  }

  return <>{element}</>;
};

export default AdminRoute; 