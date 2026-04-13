import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import LecturerStudentDetail from './pages/LecturerStudentDetail';
import StudentDetail from './pages/StudentDetail';
import StudentAccount from './pages/StudentAccount';
import LecturerUpload from './pages/LecturerUpload';
import './App.css';

// Protected Route Component
function ProtectedRoute({ element }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return token ? element : <Navigate to="/login" replace />;
}

// Role-based Route Component
function RoleRoute({ element, allowedRole }) {
  const { token, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
}

// Main App Routes
function AppRoutes() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" replace /> : <Signup />}
      />
      <Route
        path="/dashboard"
        element={
          token ? (
            user?.role === "lecturer" ? (
              <Navigate to="/lecturer" replace />
            ) : (
              <ProtectedRoute element={<Dashboard />} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/lecturer"
        element={<RoleRoute element={<LecturerDashboard />} allowedRole="lecturer" />}
      />
      <Route
        path="/lecturer/students"
        element={<RoleRoute element={<LecturerStudentDetail />} allowedRole="lecturer" />}
      />
      <Route
        path="/lecturer/student/:studentId"
        element={<RoleRoute element={<StudentDetail />} allowedRole="lecturer" />}
      />
      <Route
        path="/student/account"
        element={<RoleRoute element={<StudentAccount />} allowedRole="student" />}
      />
      <Route
        path="/lecturer/upload"
        element={<RoleRoute element={<LecturerUpload />} allowedRole="lecturer" />}
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


