import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Check, X, CircleAlert } from 'lucide-react';
import AuthProvider from './context/AuthContext';
import { useAuth } from './context/authState';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Templates from './pages/Templates';
import Favorites from './pages/Favorites';
import TemplateDetails from './pages/TemplateDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
function Toast() {
  const { notice, dismissNotice } = useAuth();
  if (!notice) return null;
  return (
    <div className={`toast ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      {notice.type === 'error' ? <CircleAlert size={19} /> : <Check size={19} />}
      <span>{notice.message}</span>
      <button className="icon-button" onClick={dismissNotice} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/templates" replace />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetails />} />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Toast />
      </AuthProvider>
    </BrowserRouter>
  );
}
