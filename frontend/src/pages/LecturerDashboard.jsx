import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/LecturerDashboard.css';

function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    department: '',
    officeLocation: '',
    officeHours: '',
    bio: '',
  });

  useEffect(() => {
    fetchLecturerProfile();
  }, []);

  const fetchLecturerProfile = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/lecturer/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLecturer(data.lecturer);
      } else {
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error('Error fetching lecturer profile:', error);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/lecturer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setLecturer(data.lecturer);
        setShowProfileForm(false);
        alert('Profile created successfully!');
      } else {
        alert('Error creating profile');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lecturer-dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📚 Lecturer Dashboard</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="lecturer-content">
        {!lecturer ? (
          <div className="setup-section">
            <h2>Complete Your Profile</h2>
            <form onSubmit={handleCreateProfile} className="profile-form">
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g., Science"
                />
              </div>

              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                  placeholder="e.g., Building A, Room 301"
                />
              </div>

              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({...formData, officeHours: e.target.value})}
                  placeholder="e.g., Mon-Wed: 2-4 PM"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief bio..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn-primary">Create Profile</button>
            </form>
          </div>
        ) : (
          <>
            <div className="lecturer-profile-section">
              <h2>Your Profile</h2>
              <div className="profile-card">
                <p><strong>Name:</strong> {user?.fullName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Subject:</strong> {lecturer.subject}</p>
                {lecturer.department && <p><strong>Department:</strong> {lecturer.department}</p>}
                {lecturer.officeLocation && <p><strong>Office:</strong> {lecturer.officeLocation}</p>}
                {lecturer.officeHours && <p><strong>Office Hours:</strong> {lecturer.officeHours}</p>}
                {lecturer.bio && <p><strong>Bio:</strong> {lecturer.bio}</p>}
              </div>
            </div>

            <div className="lecturer-actions">
              <h2>Actions</h2>
              <div className="action-cards">
                <div 
                  className="action-card"
                  onClick={() => navigate('/lecturer/students')}
                >
                  <h3>👥 View All Students</h3>
                  <p>See and manage all students</p>
                </div>
                <div 
                  className="action-card"
                  onClick={() => navigate('/lecturer/upload')}
                >
                  <h3>📤 Bulk Upload</h3>
                  <p>Upload marks & attendance via CSV</p>
                </div>
                <div className="action-card">
                  <h3>📊 Class Stats</h3>
                  <p>View class statistics</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LecturerDashboard;
