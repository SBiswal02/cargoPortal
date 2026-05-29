import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

function dashboardPathFor(role) {
  return role === 'Admin' ? '/admin/dashboard' : '/dashboard';
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Initializing portal…</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Initializing portal…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Initializing portal…</div>;
  if (user) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return children;
}

function LegacyDashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Initializing portal…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={dashboardPathFor(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnly>
            <AuthPage />
          </PublicOnly>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RoleRoute role="Standard">
            <Dashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute role="Admin">
            <Dashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/cargo"
        element={
          <ProtectedRoute>
            <LegacyDashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
