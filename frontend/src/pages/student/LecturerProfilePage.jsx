import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/LecturerProfilePage.css';

function LecturerProfilePage() {
  const { lecturerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, uploads
  const [message, setMessage] = useState('');
  const [courseFilter, setCourseFilter] = useState('all'); // all, notes, assignment

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:4000/api';

  useEffect(() => {
    fetchLecturerProfile();
  }, [lecturerId]);

  const fetchLecturerProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer/${lecturerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLecturer(data.lecturer);
        setUploads(data.uploads || []);
        setLoading(false);
      } else {
        setMessage('❌ Failed to load lecturer profile');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching lecturer profile:', error);
      setMessage('❌ Error loading lecturer profile');
      setLoading(false);
    }
  };

  const filteredUploads = uploads.filter(upload => {
    if (courseFilter === 'all') return true;
    return upload.type === courseFilter;
  });



  if (loading) {
    return <PageLayout title="Loading..."><p>⏳ Loading lecturer profile...</p></PageLayout>;
  }

  return (
    <PageLayout 
      title={`👨‍🏫 ${lecturer?.fullName || 'Lecturer Profile'}`} 
      subtitle={lecturer?.subject || ''}
    >
      <div className="lecturer-profile-container">
        {/* Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
            onClick={() => setActiveTab('uploads')}
          >
            📂 Materials ({uploads.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && lecturer && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">👨‍🏫</div>
                <div className="profile-info">
                  <h2>{lecturer.fullName}</h2>
                  <p className="subject-badge">📚 {lecturer.subject}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <span className="label">🏢 Department:</span>
                  <span className="value">{lecturer.department || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📍 Office Location:</span>
                  <span className="value">{lecturer.officeLocation || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">⏰ Office Hours:</span>
                  <span className="value">{lecturer.officeHours || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📧 Email:</span>
                  <span className="value">{lecturer.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📱 Phone:</span>
                  <span className="value">{lecturer.phone || 'N/A'}</span>
                </div>

                {lecturer.bio && (
                  <div className="detail-item bio-section">
                    <span className="label">📝 Bio:</span>
                    <p className="bio-text">{lecturer.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className="uploads-content">
            {/* Filter Buttons */}
            {uploads.length > 0 && (
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${courseFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCourseFilter('all')}
                >
                  📋 All ({uploads.length})
                </button>
                <button
                  className={`filter-btn ${courseFilter === 'notes' ? 'active' : ''}`}
                  onClick={() => setCourseFilter('notes')}
                >
                  📘 Notes ({uploads.filter(u => u.type === 'notes').length})
                </button>
                <button
                  className={`filter-btn ${courseFilter === 'assignment' ? 'active' : ''}`}
                  onClick={() => setCourseFilter('assignment')}
                >
                  📂 Assignments ({uploads.filter(u => u.type === 'assignment').length})
                </button>
              </div>
            )}

            {filteredUploads.length === 0 ? (
              <div className="empty-state">
                <p>📭 No materials found</p>
              </div>
            ) : (
              <div className="uploads-grid">
                {filteredUploads.map((upload) => (
                  <div key={upload._id} className={`upload-card ${upload.type}`}>
                    <div className="card-top">
                      <div className="card-icon">
                        {upload.type === 'notes' ? '📘' : '📂'}
                      </div>
                      <span className="type-badge">{upload.type}</span>
                    </div>
                    <div className="card-body">
                      <h4>{upload.title || upload.fileName}</h4>
                      <p className="subject-text">📚 {upload.subject}</p>
                      {upload.description && (
                        <p className="description-text">{upload.description}</p>
                      )}
                      <div className="upload-meta">
                        <span className="date">
                          📅 {new Date(upload.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={upload.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      ⬇️ Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default LecturerProfilePage;
