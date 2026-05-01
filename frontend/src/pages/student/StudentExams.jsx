import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/StudentExams.css';

function StudentExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      if (data.success) {
        setExams(data.data);
      } else {
        setError('Unable to load exams');
      }
    } catch (err) {
      setError(err.message || 'Error loading exams');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedExam(null);
  };

  const getFilteredExams = () => {
    if (filterStatus === 'all') {
      return exams;
    }
    return exams.filter(exam => exam.status === filterStatus);
  };

  const filteredExams = getFilteredExams();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  return (
    <div className="student-exams-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>� Exam Topics Timetable</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
        </div>
      </nav>

      <div className="exams-content">
        <div className="exams-header">
          <h2>📚 Your Exam Topics & Schedule</h2>
          <div className="filter-controls">
            <label>Filter by Status: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Exams</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && <div className="loading">Loading exam schedule...</div>}
        {error && <div className="error-message">⚠️ {error}</div>}

        {!loading && !error && filteredExams.length === 0 && (
          <div className="no-exams">
            <p>No exams found for your courses.</p>
          </div>
        )}

        {!loading && !error && filteredExams.length > 0 && (
          <div className="exams-table-wrapper">
            <table className="exams-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Exam Code</th>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam._id} className={`exam-row status-${exam.status}`}>
                    <td className="date-cell">{formatDate(exam.date)}</td>
                    <td className="subject-cell">{exam.subject}</td>
                    <td className="code-cell"><span className="code-badge">{exam.code}</span></td>
                    <td className="title-cell">{exam.title}</td>
                    <td className="topic-cell">{exam.topic || 'N/A'}</td>
                    <td className="year-cell">{exam.year || 'N/A'}</td>
                    <td className="semester-cell">{exam.semester || 'N/A'}</td>
                    <td className="time-cell">{formatTime(exam.startTime)}</td>
                    <td className="time-cell">{formatTime(exam.endTime)}</td>
                    <td className="duration-cell">{exam.duration} mins</td>
                    <td className={`status-cell status-${exam.status}`}>
                      <span className="status-badge">{exam.status}</span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="view-btn"
                        onClick={() => handleViewDetails(exam)}
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

        {/* Details Modal */}
        {showDetailsModal && selectedExam && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedExam.title}</h3>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <label>Subject:</label>
                  <span>{selectedExam.subject}</span>
                </div>
                <div className="detail-row">
                  <label>Exam Code:</label>
                  <span className="code-badge">{selectedExam.code}</span>
                </div>
                <div className="detail-row">
                  <label>Date:</label>
                  <span>{formatDate(selectedExam.date)}</span>
                </div>
                <div className="detail-row">
                  <label>Start Time:</label>
                  <span>{formatTime(selectedExam.startTime)}</span>
                </div>
                <div className="detail-row">
                  <label>End Time:</label>
                  <span>{formatTime(selectedExam.endTime)}</span>
                </div>
                <div className="detail-row">
                  <label>Duration:</label>
                  <span>{selectedExam.duration} minutes</span>
                </div>
                <div className="detail-row">
                  <label>Total Marks:</label>
                  <span>{selectedExam.totalMarks}</span>
                </div>
                <div className="detail-row">
                  <label>Topic:</label>
                  <span>{selectedExam.topic || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Year:</label>
                  <span>{selectedExam.year || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Semester:</label>
                  <span>{selectedExam.semester || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={`status-badge status-${selectedExam.status}`}>
                    {selectedExam.status}
                  </span>
                </div>
                {selectedExam.description && (
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{selectedExam.description}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="close-modal-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentExams;
