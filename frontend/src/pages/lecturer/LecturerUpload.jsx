import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/LecturerUpload.css';

function LecturerUpload() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([
    {
      type: 'notes',
      subject: '',
      topic: '',
      file: null
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle text input
  const handleChange = (index, field, value) => {
    const updated = [...activities];
    updated[index][field] = value;
    setActivities(updated);
  };

  // Handle file input
  const handleFileChange = (index, file) => {
    const updated = [...activities];
    updated[index].file = file;
    setActivities(updated);
  };

  // Add new activity
  const addActivity = (type) => {
    setActivities([
      ...activities,
      {
        type,
        subject: '',
        topic: '',
        startDate: '',
        endDate: '',
        file: null
      }
    ]);
  };

  // Remove activity
  const removeActivity = (index) => {
    const updated = activities.filter((_, i) => i !== index);
    setActivities(updated);
  };

  // Upload all
  const handleUploadAll = async () => {
    setLoading(true);
    setMessage('');

    try {
      for (const activity of activities) {
        if (!activity.subject || !activity.topic || !activity.file) {
          throw new Error('Please fill all fields and upload file');
        }

        const formData = new FormData();
        formData.append('subject', activity.subject);
        formData.append('topic', activity.topic);
        formData.append('file', activity.file);

        if (activity.type === 'assignment') {
          if (!activity.startDate || !activity.endDate) {
            throw new Error('Assignment dates required');
          }
          formData.append('startDate', activity.startDate);
          formData.append('endDate', activity.endDate);
        }

        const endpoint =
          activity.type === 'notes'
            ? '/api/lecturer/notes'
            : '/api/lecturer/assignment';

        await fetch(`http://localhost:4000${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
      }

      setMessage('✅ All activities uploaded successfully!');
      setActivities([
        {
          type: 'notes',
          subject: '',
          topic: '',
          file: null
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lecturer-upload-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>📤 Lecturer Upload Panel</h1>
        <div>
          <button onClick={() => navigate('/lecturer/uploads')}>📚 View My Uploads</button>
          <button onClick={() => navigate('/lecturer')}>← Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Content */}
      <div className="upload-content">

        {/* Add Buttons */}
        <div className="add-buttons">
          <button onClick={() => addActivity('notes')}>
            ➕ Add Notes
          </button>
          <button onClick={() => addActivity('assignment')}>
            ➕ Add Assignment
          </button>
        </div>

        {/* Activity Cards */}
        {activities.map((activity, index) => (
          <div key={index} className="activity-card">

            <div className="card-header">
              <h3>
                {activity.type === 'notes'
                  ? '📘 Lecture Notes'
                  : '📂 Assignment'}
              </h3>
              <button onClick={() => removeActivity(index)}>❌</button>
            </div>

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject Name"
              value={activity.subject}
              onChange={(e) =>
                handleChange(index, 'subject', e.target.value)
              }
            />

            {/* Topic */}
            <input
              type="text"
              placeholder="Topic"
              value={activity.topic}
              onChange={(e) =>
                handleChange(index, 'topic', e.target.value)
              }
            />

            {/* Assignment Dates */}
            {activity.type === 'assignment' && (
              <div className="date-group">
                <input
                  type="datetime-local"
                  value={activity.startDate}
                  onChange={(e) =>
                    handleChange(index, 'startDate', e.target.value)
                  }
                />

                <input
                  type="datetime-local"
                  value={activity.endDate}
                  onChange={(e) =>
                    handleChange(index, 'endDate', e.target.value)
                  }
                />
              </div>
            )}

            {/* File Upload */}
            <input
              type="file"
              onChange={(e) =>
                handleFileChange(index, e.target.files[0])
              }
            />

            {activity.file && <p>✅ {activity.file.name}</p>}
          </div>
        ))}

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUploadAll}
          disabled={loading}
          className="upload-btn"
        >
          {loading ? 'Uploading...' : '📤 Upload All'}
        </button>

      </div>
    </div>
  );
}

export default LecturerUpload;