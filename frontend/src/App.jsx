import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/student/Dashboard';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import LecturerStudentDetail from './pages/lecturer/LecturerStudentDetail';
import StudentDetail from './pages/student/StudentDetail';
import StudentAccount from './pages/student/StudentAccount';
import LecturerUpload from './pages/lecturer/LecturerUpload';
import LecturerUploads from './pages/lecturer/LecturerUploads';
import CourseUploads from './pages/student/CourseUploads';
import MyCourses from './pages/student/myCouses';
import ExamAdmin from './pages/admin/ExamAdmin.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
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
        path="/student/courses"
        element={<RoleRoute element={<MyCourses />} allowedRole="student" />}
      />
      <Route
        path="/student/courses/:subject/uploads"
        element={<RoleRoute element={<CourseUploads />} allowedRole="student" />}
      />
      <Route
        path="/lecturer/upload"
        element={<RoleRoute element={<LecturerUpload />} allowedRole="lecturer" />}
      />
      <Route
        path="/lecturer/uploads"
        element={<RoleRoute element={<LecturerUploads />} allowedRole="lecturer" />}
      />
      <Route
        path="/admin/exams"
        element={<RoleRoute element={<ExamAdmin />} allowedRole="admin" />}
      />
      <Route
        path="/admin/users"
        element={<RoleRoute element={<ManageUsers />} allowedRole="admin" />}
      />
      <Route
        path="/exams"
        element={<ProtectedRoute element={<ExamAdmin />} />}
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


