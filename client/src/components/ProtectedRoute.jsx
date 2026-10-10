import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authState';
import { LoaderCircle } from 'lucide-react';
export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading)
    return (
      <div className="page-loading" role="status">
        <LoaderCircle className="spin" /> Restoring your session…
      </div>
    );
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
