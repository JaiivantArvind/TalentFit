// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
}
