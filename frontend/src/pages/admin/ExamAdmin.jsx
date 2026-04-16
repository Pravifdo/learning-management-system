import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllExams, createExam, updateExam, deleteExam } from '../../services/examService';
import '../../styles/ExamAdmin.css';

function ExamAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const isAdmin = user?.role === 'admin';
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    totalMarks: '',
    duration: '',
    description: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const examsData = await getAllExams();
      setExams(examsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update exam
        await updateExam(editingId, formData);
        alert('Exam updated successfully!');
      } else {
        // Create new exam
        await createExam(formData);
        alert('Exam created successfully!');
      }
      
      // Refresh exams list
      fetchExams();
      resetForm();
    } catch (error) {
      alert('Error saving exam: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      totalMarks: '',
      duration: '',
      description: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (exam) => {
    setFormData(exam);
    setEditingId(exam._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(id);
        alert('Exam deleted successfully!');
        // Refresh exams list
        fetchExams();
      } catch (error) {
        alert('Error deleting exam: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="exam-admin-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>{isAdmin ? '📋 Exam Administration Panel' : '📋 View Exams'}</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {!isAdmin && (
        <div className="read-only-banner">
          <p>📖 You are in view-only mode. Only exam administrators can create, edit, or delete exams.</p>
        </div>
      )}

      <div className="admin-content">
        <div className="header-section">
          <h2>{isAdmin ? 'Manage Exams' : 'View Exams'}</h2>
          {isAdmin && (
            <button 
              className="btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? '✕ Cancel' : '➕ Create New Exam'}
            </button>
          )}
        </div>

        {isAdmin && showForm && (
          <div className="form-container">
            <h3>{editingId ? 'Edit Exam' : 'Create New Exam'}</h3>
            <form onSubmit={handleSubmit} className="exam-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics Mid-Term"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 120"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Exam description..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Exam' : 'Create Exam'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="exams-section">
          {isAdmin && (
            <div className="stats-cards">
              <div className="stat-card">
                <h4>Total Exams</h4>
                <p className="stat-number">{exams.length}</p>
              </div>
              <div className="stat-card">
                <h4>Scheduled</h4>
                <p className="stat-number">{exams.filter(e => e.status === 'Scheduled').length}</p>
              </div>
              <div className="stat-card">
                <h4>Completed</h4>
                <p className="stat-number">{exams.filter(e => e.status === 'Completed').length}</p>
              </div>
            </div>
          )}

          {exams.length === 0 ? (
            <div className="no-exams">
              <p>No exams created yet. {isAdmin && 'Click "Create New Exam" to get started.'}</p>
            </div>
          ) : (
            <div className="exams-table-wrapper">
              <table className="exams-table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td><strong>{exam.title}</strong></td>
                      <td>{exam.subject}</td>
                      <td>{new Date(exam.date).toLocaleDateString()}</td>
                      <td>{exam.startTime} - {exam.endTime}</td>
                      <td>{exam.duration} min</td>
                      <td>{exam.totalMarks}</td>
                      <td>
                        <span className="status-badge">{exam.status}</span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(exam)}
                              title="Edit exam"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(exam._id)}
                              title="Delete exam"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamAdmin;
