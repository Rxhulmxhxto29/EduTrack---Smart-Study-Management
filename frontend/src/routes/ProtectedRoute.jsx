import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();
  
  console.log('ProtectedRoute: user role is:', user?.role, 'required roles:', roles, 'includes check:', roles.includes(user?.role));

  if (!user) {
    console.log('ProtectedRoute: no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('ProtectedRoute: user role "' + user.role + '" NOT in required roles', roles);
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin' || user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute: rendering children');
  return children;
}

export default ProtectedRoute;
