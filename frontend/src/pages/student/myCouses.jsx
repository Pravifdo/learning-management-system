import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/MyCourses.css';

function MyCourses() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <PageLayout title="📚 My Lecturers" subtitle="View All Available Lecturers">

        {lecturers.length > 0 ? (
          <div className="courses-grid">

            {lecturers.map((lec) => (
              <div key={lec.id} className="course-card">

                <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '1rem' }}>
                  <h2>{lec.fullName}</h2>
                  <div style={{ 
                    background: '#eff6ff', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    fontWeight: '700',
                    color: '#2563eb',
                    fontSize: '1rem'
                  }}>
                    📚 {lec.subject}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <p><strong>Department:</strong> {lec.department}</p>
                  <p><strong>Office Location:</strong> {lec.officeLocation}</p>
                  <p><strong>Office Hours:</strong> {lec.officeHours}</p>

                  {lec.bio && (
                    <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#6b7280' }}>
                      <strong>Bio:</strong> {lec.bio}
                    </p>
                  )}
                </div>

                <button
                  className="view-btn"
                  onClick={() => navigate(`/lecturer/${lec.id}`)}
                >
                  View Details →
                </button>

              </div>
            ))}

          </div>
        ) : (
          <p className="no-courses">No lecturers found</p>
        )}

      </PageLayout>
  );
}

export default MyCourses;