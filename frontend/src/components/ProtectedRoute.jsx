// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Why: This component guards pages that require login.
// If user is not authenticated, redirect them to /login
const ProtectedRoute = ({ children }) => {
  const { currentUser, role, loading } = useAuth();
  
  //Still loading auth state
  if(loading) {
    return <div>Loading...</div>
  }

    //Not logged in - redirect to Login
     if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Logged in - show protected content
  return children;
 
};

export default ProtectedRoute;