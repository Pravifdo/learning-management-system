import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/SystemReports.css';

function SystemReports() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalExams: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch multiple endpoints to gather statistics
      const [usersRes, coursesRes, examsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      let users = [], courses = [], exams = [];

      if (usersRes.ok) users = await usersRes.json();
      if (coursesRes.ok) courses = await coursesRes.json();
      if (examsRes.ok) exams = await examsRes.json();

      const userArray = users.data || users || [];
      const courseArray = courses.data || courses || [];
      const examArray = exams.data || exams || [];

      setStats({
        totalUsers: userArray.length,
        totalCourses: courseArray.length,
        totalExams: examArray.length,
        totalStudents: userArray.filter((u) => u.role === 'student').length,
        totalLecturers: userArray.filter((u) => u.role === 'lecturer').length,
        totalAdmins: userArray.filter((u) => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="system-reports-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📊 System Reports</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="header-section">
          <h2>System Analytics & Reports</h2>
          <button className="btn-primary" onClick={fetchStats}>
            🔄 Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : (
          <>
            <div className="stats-cards">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Total Students</h4>
                <p className="stat-number">{stats.totalStudents}</p>
              </div>
              <div className="stat-card">
                <h4>Total Lecturers</h4>
                <p className="stat-number">{stats.totalLecturers}</p>
              </div>
              <div className="stat-card">
                <h4>Total Admins</h4>
                <p className="stat-number">{stats.totalAdmins}</p>
              </div>
              <div className="stat-card">
                <h4>Total Courses</h4>
                <p className="stat-number">{stats.totalCourses}</p>
              </div>
              <div className="stat-card">
                <h4>Total Exams</h4>
                <p className="stat-number">{stats.totalExams}</p>
              </div>
            </div>

            <div className="reports-section">
              <div className="report-tabs">
                <button
                  className={`report-tab ${selectedReport === 'overview' ? 'active' : ''}`}
                  onClick={() => setSelectedReport('overview')}
                >
                  📈 Overview
                </button>
                <button
                  className={`report-tab ${selectedReport === 'users' ? 'active' : ''}`}
                  onClick={() => setSelectedReport('users')}
                >
                  👥 User Distribution
                </button>
                <button
                  className={`report-tab ${selectedReport === 'system' ? 'active' : ''}`}
                  onClick={() => setSelectedReport('system')}
                >
                  ⚙️ System Info
                </button>
              </div>

              <div className="report-content">
                {selectedReport === 'overview' && (
                  <div className="report-view">
                    <h3>System Overview</h3>
                    <div className="overview-stats">
                      <p><strong>System Status:</strong> <span className="status-active">✓ Active</span></p>
                      <p><strong>Total Registered Users:</strong> {stats.totalUsers}</p>
                      <p><strong>Active Courses:</strong> {stats.totalCourses}</p>
                      <p><strong>Scheduled Exams:</strong> {stats.totalExams}</p>
                      <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {selectedReport === 'users' && (
                  <div className="report-view">
                    <h3>User Distribution</h3>
                    <div className="distribution-chart">
                      <div className="chart-item">
                        <span className="chart-label">Students</span>
                        <div className="chart-bar">
                          <div
                            className="chart-fill"
                            style={{
                              width: `${(stats.totalStudents / stats.totalUsers * 100) || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="chart-value">{stats.totalStudents} ({Math.round((stats.totalStudents / stats.totalUsers * 100) || 0)}%)</span>
                      </div>
                      <div className="chart-item">
                        <span className="chart-label">Lecturers</span>
                        <div className="chart-bar">
                          <div
                            className="chart-fill lecturer"
                            style={{
                              width: `${(stats.totalLecturers / stats.totalUsers * 100) || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="chart-value">{stats.totalLecturers} ({Math.round((stats.totalLecturers / stats.totalUsers * 100) || 0)}%)</span>
                      </div>
                      <div className="chart-item">
                        <span className="chart-label">Admins</span>
                        <div className="chart-bar">
                          <div
                            className="chart-fill admin"
                            style={{
                              width: `${(stats.totalAdmins / stats.totalUsers * 100) || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="chart-value">{stats.totalAdmins} ({Math.round((stats.totalAdmins / stats.totalUsers * 100) || 0)}%)</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport === 'system' && (
                  <div className="report-view">
                    <h3>System Information</h3>
                    <div className="system-info">
                      <p><strong>Application:</strong> Learning Management System (LMS)</p>
                      <p><strong>Version:</strong> 1.0.0</p>
                      <p><strong>Backend URL:</strong> http://localhost:5000</p>
                      <p><strong>Frontend URL:</strong> http://localhost:5173</p>
                      <p><strong>Database:</strong> MongoDB</p>
                      <p><strong>Authentication:</strong> JWT Token Based</p>
                      <p><strong>Last Sync:</strong> {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SystemReports;
