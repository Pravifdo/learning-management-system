import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/StudentDetail.css';

function StudentDetail() {
  const { studentId } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [marks, setMarks] = useState('');
  const [attendance, setAttendance] = useState('');

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/lecturer/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudent(data);
        setMarks(data.studentDetails?.totalMarks || '');
        setAttendance(data.studentDetails?.attendance || '');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarks = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/lecturer/student/${studentId}/marks`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ totalMarks: parseFloat(marks) }),
        }
      );

      if (response.ok) {
        alert('Marks updated successfully!');
        fetchStudentDetail();
      } else {
        alert('Error updating marks');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating marks');
    }
  };

  const handleUpdateAttendance = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/lecturer/student/${studentId}/attendance`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ attendance: parseFloat(attendance) }),
        }
      );

      if (response.ok) {
        alert('Attendance updated successfully!');
        fetchStudentDetail();
      } else {
        alert('Error updating attendance');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating attendance');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found</p>;

  return (
    <div className="student-detail-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📝 Student Details</h1>
        </div>
        <div className="navbar-right">
          <button onClick={() => navigate('/lecturer/students')} className="back-btn">
            ← Back to Students
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="detail-content">
        <div className="student-info-card">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <p>{student.user.fullName}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{student.user.email}</p>
            </div>
            <div className="info-item">
              <label>Registration Number</label>
              <p>{student.studentDetails?.regNo || '-'}</p>
            </div>
            <div className="info-item">
              <label>Index Number</label>
              <p>{student.studentDetails?.indexNo || '-'}</p>
            </div>
            <div className="info-item">
              <label>Level</label>
              <p>{student.studentDetails?.level || '-'}</p>
            </div>
            <div className="info-item">
              <label>Semester</label>
              <p>{student.studentDetails?.semester || '-'}</p>
            </div>
          </div>
        </div>

        <div className="grades-section">
          <h2>Grades & Attendance</h2>
          <div className="edit-section">
            <div className="form-group">
              <label>Total Marks</label>
              <div className="input-group">
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks"
                  disabled={!editMode}
                />
                <button
                  onClick={handleUpdateMarks}
                  disabled={!editMode}
                  className="update-btn"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Attendance (%)</label>
              <div className="input-group">
                <input
                  type="number"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  placeholder="Enter attendance %"
                  min="0"
                  max="100"
                  disabled={!editMode}
                />
                <button
                  onClick={handleUpdateAttendance}
                  disabled={!editMode}
                  className="update-btn"
                >
                  Update
                </button>
              </div>
            </div>

            <button
              className={`edit-mode-btn ${editMode ? 'cancel' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel Editing' : 'Edit Marks & Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
