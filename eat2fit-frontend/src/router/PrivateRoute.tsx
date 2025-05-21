import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isLoggedIn } = useAppSelector(state => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

export default PrivateRoute; 