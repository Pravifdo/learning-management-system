import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/LecturerUploads.css';

function LecturerUploads() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, notes, assignment

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/lecturer/uploads', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

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

  const deleteUpload = async (id) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/lecturer/uploads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setUploads(uploads.filter(u => u._id !== id));
        setMessage('✅ Upload deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to delete upload');
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      setMessage('❌ Error deleting upload');
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
    <div className="lecturer-uploads-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>📚 My Uploads</h1>
        <div>
          <button onClick={() => navigate('/lecturer/upload')} className="upload-btn-nav">
            ➕ New Upload
          </button>
          <button onClick={() => navigate('/lecturer')}>← Dashboard</button>
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

        {/* Loading */}
        {loading ? (
          <div className="loading-state">
            <p>⏳ Loading your uploads...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="empty-state">
            <p>📭 No uploads found</p>
            <button onClick={() => navigate('/lecturer/upload')} className="cta-btn">
              ➕ Upload First Content
            </button>
          </div>
        ) : (
          <div className="uploads-grid">
            {filteredUploads.map((upload) => (
              <div key={upload._id} className={`upload-card ${upload.type}`}>
                <div className="card-icon">
                  {upload.type === 'notes' ? '📘' : '📂'}
                </div>

                <div className="card-content">
                  <h3>{upload.subject}</h3>
                  <p className="topic">{upload.topic}</p>

                  {upload.type === 'assignment' && (
                    <div className="dates">
                      <span className="date-badge">
                        📅 Deadline: {new Date(upload.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="upload-meta">
                    <small>
                      📁 {upload.fileSize ? `${(upload.fileSize / 1024).toFixed(2)} KB` : 'File'}
                    </small>
                    <small>
                      🕐 {new Date(upload.uploadedAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="download-btn"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = upload.fileUrl;
                      link.download = true;
                      link.click();
                    }}
                  >
                    ⬇️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteUpload(upload._id)}
                  >
                    🗑️
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

export default LecturerUploads;