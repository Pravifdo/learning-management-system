import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllExams, createExam, updateExam, deleteExam } from '../../services/examService';
import { uploadExamResults, getExamResults } from '../../services/resultsService';
import '../../styles/ExamAdmin.css';

function ExamAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  // Upload states
  const [selectedExamForUpload, setSelectedExamForUpload] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

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

  // Upload handlers
  const handleUploadClick = (exam) => {
    setSelectedExamForUpload(exam);
    setUploadFile(null);
    setUploadMessage('');
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        setUploadError('Please upload a valid Excel or CSV file (.xlsx, .xls, or .csv)');
        setUploadFile(null);
        return;
      }
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !selectedExamForUpload) {
      setUploadError('Please select a file and exam');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadMessage('');

    try {
      const response = await uploadExamResults(selectedExamForUpload._id, uploadFile);
      
      setUploadMessage(`✅ Upload successful! ${response.data.uploadedCount} results processed.`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        setUploadError(`⚠️ Some errors occurred:\n${response.data.errors.slice(0, 5).join('\n')}${response.data.errors.length > 5 ? `\n... and ${response.data.errors.length - 5} more errors` : ''}`);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedExamForUpload(null);
      }, 2000);
    } catch (error) {
      setUploadError('Error uploading results: ' + (error.message || JSON.stringify(error)));
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setSelectedExamForUpload(null);
    setUploadMessage('');
    setUploadError('');
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

        {showUploadModal && (
          <div className="modal-overlay" onClick={closeUploadModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📊 Upload Exam Results</h3>
                <button className="modal-close" onClick={closeUploadModal}>✕</button>
              </div>

              <div className="modal-body">
                {selectedExamForUpload && (
                  <div className="selected-exam-info">
                    <p><strong>Selected Exam:</strong> {selectedExamForUpload.title}</p>
                    <p><strong>Subject:</strong> {selectedExamForUpload.subject}</p>
                    <p><strong>Total Marks:</strong> {selectedExamForUpload.totalMarks}</p>
                  </div>
                )}

                <form onSubmit={handleUploadSubmit} className="upload-form">
                  <div className="upload-instructions">
                    <h4>📋 Excel File Format Required:</h4>
                    <ul>
                      <li>Column 1: <strong>Student Email</strong> (required)</li>
                      <li>Column 2: <strong>Student Name</strong> (optional)</li>
                      <li>Column 3: <strong>Marks Obtained</strong> (required)</li>
                      <li>Column 4: <strong>Remarks</strong> (optional)</li>
                    </ul>
                    <p className="format-example">Example: | Student Email | Student Name | Marks Obtained | Remarks |</p>
                  </div>

                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-input"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                      {uploadFile ? (
                        <>
                          ✓ {uploadFile.name}
                        </>
                      ) : (
                        <>
                          📁 Click to select Excel file (.xlsx, .xls, or .csv)
                        </>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <div className="alert alert-error">
                      {uploadError}
                    </div>
                  )}

                  {uploadMessage && (
                    <div className="alert alert-success">
                      {uploadMessage}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="btn-upload"
                      disabled={!uploadFile || uploading}
                    >
                      {uploading ? '⏳ Uploading...' : '📤 Upload Results'}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-modal"
                      onClick={closeUploadModal}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
                              className="btn-upload-results"
                              onClick={() => handleUploadClick(exam)}
                              title="Upload exam results"
                            >
                              📊
                            </button>
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
