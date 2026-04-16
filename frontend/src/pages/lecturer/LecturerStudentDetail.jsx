import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/LecturerStudents.css';

function LecturerStudents() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/lecturer/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lecturer-students-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📚 Students</h1>
        </div>
        <div className="navbar-right">
          <button onClick={() => navigate('/lecturer')} className="back-btn">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="students-content">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <p className="count">{filteredStudents.length} students found</p>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="no-students">No students found</p>
        ) : (
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registration No</th>
                  <th>Index No</th>
                  <th>Level</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.studentDetails?.regNo || '-'}</td>
                    <td>{student.studentDetails?.indexNo || '-'}</td>
                    <td>{student.studentDetails?.level || '-'}</td>
                    <td>{student.studentDetails?.semester || '-'}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/lecturer/student/${student._id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LecturerStudents;
