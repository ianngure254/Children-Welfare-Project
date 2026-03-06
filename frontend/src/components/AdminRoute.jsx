// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// AdminRoute: Guards admin pages - requires authentication AND admin role
// If user isn't logged in → redirect to /login
// If user is logged in but NOT admin → redirect to /
// If user is admin → render the component
const AdminRoute = ({ children }) => {
  const { currentUser, role, loading } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';

  // Show loading spinner while fetching user role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login page
  if (!currentUser) {
    console.warn('AdminRoute: no currentUser, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → redirect to home
  if (!isAdmin) {
    console.warn('AdminRoute: user role is', role, 'not admin; redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Logged in AND admin → render admin content
  return children;
};

export default AdminRoute;


