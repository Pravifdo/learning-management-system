import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/MyCourses.css';

function MyCourses() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:4000/api/lecturer/all', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLecturers(data.lecturers || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-courses-container">

      {/* Navbar */}
      <nav className="navbar">

        {/* Back Button */}
        <button 
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>

        <h1>Lecturers</h1>

        {/* Logout */}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

      </nav>

      {/* Content */}
      <div className="courses-content">

        {lecturers.length > 0 ? (
          <div className="courses-grid">

            {lecturers.map((lec) => (
              <div key={lec.id} className="course-card">

                <h2>{lec.fullName}</h2>

                <p><strong>Subject:</strong> {lec.subject}</p>
                <p><strong>Department:</strong> {lec.department}</p>
                <p><strong>Office Location:</strong> {lec.officeLocation}</p>
                <p><strong>Office Hours:</strong> {lec.officeHours}</p>

                {lec.bio && (
                  <p><strong>Bio:</strong> {lec.bio}</p>
                )}

                <button
                  className="view-btn"
                  onClick={() => navigate(`/lecturer/${lec.id}`)}
                >
                  View Details
                </button>

              </div>
            ))}

          </div>
        ) : (
          <p className="no-courses">No lecturers found</p>
        )}

      </div>

    </div>
  );
}

export default MyCourses;