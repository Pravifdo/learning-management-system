import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentAccount.css';

function StudentAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/student/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data.student);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="student-account-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📋 My Account</h1>
        </div>
        <div className="navbar-right">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="account-content">
        {/* Personal Information */}
        <div className="info-card">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{user?.fullName}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-item">
              <label>Registration Number</label>
              <p>{studentData?.regNo || '-'}</p>
            </div>
            <div className="info-item">
              <label>Index Number</label>
              <p>{studentData?.indexNo || '-'}</p>
            </div>
            <div className="info-item">
              <label>Level</label>
              <p>{studentData?.level || '100'}</p>
            </div>
            <div className="info-item">
              <label>Semester</label>
              <p>{studentData?.semester || '1'}</p>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="info-card">
          <h2>Academic Performance</h2>
          <div className="performance-grid">
            <div className="performance-item">
              <label>Total Marks</label>
              <div className="score-box">
                <p className="score">{studentData?.totalMarks || 0}</p>
                <p className="max">/100</p>
              </div>
            </div>
            <div className="performance-item">
              <label>Attendance</label>
              <div className="score-box">
                <p className="score">{studentData?.attendance || 0}</p>
                <p className="max">%</p>
              </div>
            </div>
          </div>

          {/* Attendance Progress Bar */}
          <div className="progress-section">
            <label>Attendance Progress</label>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${studentData?.attendance || 0}%` }}
              ></div>
            </div>
            <p className="progress-text">{studentData?.attendance || 0}% Completed</p>
          </div>
        </div>

        {/* Enrolled Courses */}
        {studentData?.enrolledCourses && studentData.enrolledCourses.length > 0 && (
          <div className="info-card">
            <h2>Enrolled Courses</h2>
            <div className="courses-list">
              {studentData.enrolledCourses.map((course, index) => (
                <div key={index} className="course-item">
                  <p>📚 {course}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Created */}
        <div className="info-card meta">
          <p><strong>Account Created:</strong> {studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : '-'}</p>
          <p><strong>Last Updated:</strong> {studentData?.updatedAt ? new Date(studentData.updatedAt).toLocaleDateString() : '-'}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentAccount;
