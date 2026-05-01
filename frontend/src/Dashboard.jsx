import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>LMS Dashboard</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {user?.fullName}! 👋</h2>
          <p className="role-badge">Role: <strong>{user?.role}</strong></p>
        </div>

        <div className="dashboard-grid">
          {user?.role === 'student' && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate('/student/courses')}>
                <h3>📚 My Courses</h3>
                <p>View and manage your enrolled courses</p>
              </div>
              <div className="dashboard-card">
                <h3>📝 Assignments</h3>
                <p>Check pending assignments and deadlines</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/student/account')}>
                <h3>📊 My Account</h3>
                <p>View your grades, marks and attendance</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/student/exams')}>
                <h3>✏️ Exam</h3>
                <p>Check your exam schedules and results</p>
              </div>
            </>
          )}

          {user?.role === 'lecturer' && (
            <>
              <div className="dashboard-card">
                <h3>📋 My Courses</h3>
                <p>Manage courses and materials</p>
              </div>
              <div className="dashboard-card">
                <h3>📤 Upload Materials</h3>
                <p>Share course materials with students</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/lecturer/students')}>
                <h3>✅ Manage Students</h3>
                <p>View and manage student records</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/lecturer/upload')}>
                <h3>📊 Bulk Upload</h3>
                <p>Upload marks and attendance via CSV</p>
              </div>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate('/admin/users')}>
                <h3>👥 Manage Users</h3>
                <p>Add, edit or remove users</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/admin/courses')}>
                <h3>📚 Manage Courses</h3>
                <p>Add, edit or remove courses</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/admin/reports')}>
                <h3>📊 System Reports</h3>
                <p>View system statistics and reports</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate('/admin/settings')}>
                <h3>⚙️ Settings</h3>
                <p>Configure system settings</p>
              </div>
            </>
          )}
        </div>

        <div className="user-info-section">
          <h3>Account Information</h3>
          <div className="user-details">
            <p><strong>Name:</strong> {user?.fullName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            {user?.regNo && <p><strong>Registration No:</strong> {user?.regNo}</p>}
            {user?.indexNo && <p><strong>Index No:</strong> {user?.indexNo}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
