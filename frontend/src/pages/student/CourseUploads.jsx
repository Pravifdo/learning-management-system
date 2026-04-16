import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/CourseUploads.css';

function CourseUploads() {
  const { subject } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, notes, assignment

  useEffect(() => {
    fetchUploads();
  }, [subject]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/api/student/courses/${encodeURIComponent(subject)}/uploads`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);
      } else {
        setMessage('❌ Failed to fetch uploads');
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
      setMessage('❌ Error loading uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUploads = uploads.filter(upload => {
    if (filter === 'all') return true;
    return upload.type === filter;
  });

  return (
    <div className="course-uploads-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1>📚 {subject}</h1>
          <p className="course-subtitle">Course Materials & Assignments</p>
        </div>
        <div className="nav-right">
          <button onClick={() => navigate('/student/courses')} className="back-btn">
            ← Back to Courses
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Content */}
      <div className="uploads-content">
        {/* Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Filter Buttons */}
        {!loading && uploads.length > 0 && (
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              📋 All ({uploads.length})
            </button>
            <button
              className={`filter-btn ${filter === 'notes' ? 'active' : ''}`}
              onClick={() => setFilter('notes')}
            >
              📘 Notes ({uploads.filter(u => u.type === 'notes').length})
            </button>
            <button
              className={`filter-btn ${filter === 'assignment' ? 'active' : ''}`}
              onClick={() => setFilter('assignment')}
            >
              📂 Assignments ({uploads.filter(u => u.type === 'assignment').length})
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="loading-state">
            <p>⏳ Loading course materials...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="empty-state">
            <p>📭 No materials found</p>
            <p className="empty-desc">The lecturer hasn't uploaded any materials yet.</p>
          </div>
        ) : (
          <div className="uploads-grid">
            {filteredUploads.map((upload) => (
              <div key={upload._id} className={`upload-card ${upload.type}`}>
                <div className="card-top">
                  <div className="card-icon">
                    {upload.type === 'notes' ? '📘' : '📂'}
                  </div>
                  <div className="card-badge">{upload.type === 'notes' ? 'Notes' : 'Assignment'}</div>
                </div>

                <div className="card-content">
                  <h3>{upload.topic}</h3>

                  {upload.type === 'assignment' && upload.endDate && (
                    <div className="deadline">
                      <span className="deadline-icon">📅</span>
                      <div className="deadline-info">
                        <strong>Deadline:</strong>
                        <br />
                        {new Date(upload.endDate).toLocaleDateString()} at{' '}
                        {new Date(upload.endDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  )}

                  <div className="upload-meta">
                    <small>📁 {upload.fileSize ? `${(upload.fileSize / 1024).toFixed(2)} KB` : 'File'}</small>
                    <small>🕐 {new Date(upload.uploadedAt).toLocaleDateString()}</small>
                  </div>
                </div>

                <button
                  className="download-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `http://localhost:4000${upload.fileUrl}`;
                    link.target = '_blank';
                    link.click();
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseUploads;