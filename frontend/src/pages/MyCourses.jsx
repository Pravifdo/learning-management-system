import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/MyCourses.css';

function MyCourses() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    ensureProfileThenFetchCourses();
  }, []);

  const ensureProfileThenFetchCourses = async () => {
    try {
      setLoading(true);

      const ensureResponse = await fetch('http://localhost:4000/api/student/ensure-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (ensureResponse.ok) {
        fetchCourses();
      } else {
        setMessage('❌ Failed to setup student profile');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:4000/api/student/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Remove duplicate courses by course name
        const uniqueCourses = Array.from(
          new Map((data.courses || []).map(course => [course.name, course])).values()
        );
        setEnrolledCourses(uniqueCourses);

        if (!uniqueCourses || uniqueCourses.length === 0) {
          setMessage('📭 No enrolled courses yet');
        } else {
          setMessage('');
        }
      } else {
        setMessage('❌ Failed to fetch courses');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseName) => {
    if (!window.confirm(`Delete "${courseName}"?`)) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/student/courses/${encodeURIComponent(courseName)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setMessage(`✅ Deleted "${courseName}"`);
        fetchCourses();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error deleting course');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="my-courses-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📚 My Courses</h1>
          <span className="course-count">{enrolledCourses.length} Course{enrolledCourses.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="navbar-buttons">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Dashboard
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Message */}
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Content */}
      <div className="courses-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>⏳ Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <h2>No Courses Yet</h2>
            <p className="empty-desc">You haven't enrolled in any courses yet. Visit your dashboard to explore and enroll.</p>
            <button onClick={fetchCourses} className="refresh-btn">🔄 Refresh</button>
          </div>
        ) : (
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.name} className="course-card">
                <div className="course-header-section">
                  <div className="course-icon">📖</div>
                  <div className="course-info">
                    <h3>{course.name}</h3>
                    <span className="material-badge">{course.uploadCount} Materials</span>
                  </div>
                </div>
                <div className="course-actions">
                  <button
                    className="delete-btn"
                    onClick={() => deleteCourse(course.name)}
                    title="Remove this course"
                  >
                    Remove Course
                  </button>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/course/${course.name}`)}
                    title="View course details"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;