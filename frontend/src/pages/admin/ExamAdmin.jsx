import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ExamAdmin.css';

function ExamAdmin() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadingExamId, setUploadingExamId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    totalMarks: '',
    duration: '',
    description: '',
    status: 'Scheduled',
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, searchTerm, filterStatus]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.data || data);
        showNotification('Exams loaded successfully', 'success');
      } else {
        throw new Error('Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      showNotification('Error loading exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((exam) => exam.status === filterStatus);
    }

    setFilteredExams(filtered);
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

    if (!formData.title || !formData.subject || !formData.date || !formData.totalMarks) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/exams/${editingId}` : `${API_BASE_URL}/exams`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(
          editingId ? 'Exam updated successfully' : 'Exam created successfully',
          'success'
        );
        resetForm();
        fetchExams();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save exam');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      description: exam.description,
      status: exam.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          showNotification('Exam deleted successfully', 'success');
          fetchExams();
        } else {
          throw new Error('Failed to delete exam');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting exam', 'error');
      }
    }
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const handleUploadResults = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      showNotification('Please select a file', 'error');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadFile);

      const response = await fetch(
        `${API_BASE_URL}/exams/${uploadingExamId}/upload-results`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        showNotification('Exam results uploaded successfully', 'success');
        setUploadingExamId(null);
        setUploadFile(null);
        fetchExams();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload results');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploading(false);
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
      status: 'Scheduled',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const showNotification = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="exam-admin-container">
      <div className="exam-admin-header">
        <h1>Exam Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Exam'}
        </button>
      </div>

      {message && (
        <div className={`notification notification-${messageType}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="exam-form-section">
          <h2>{editingId ? 'Edit Exam' : 'Create New Exam'}</h2>
          <form onSubmit={handleSubmit} className="exam-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Exam Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter exam title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter subject"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalMarks">Total Marks *</label>
                <input
                  type="number"
                  id="totalMarks"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  placeholder="Enter total marks"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Duration in minutes"
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter exam description"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update Exam' : 'Create Exam'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="exam-filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by exam title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-status">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="exam-list-section">
        <h2>Exams ({filteredExams.length})</h2>
        {loading ? (
          <div className="loading">Loading exams...</div>
        ) : filteredExams.length === 0 ? (
          <div className="no-data">No exams found</div>
        ) : (
          <div className="exam-table-wrapper">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.title}</td>
                    <td>{exam.subject}</td>
                    <td>{formatDate(exam.date)}</td>
                    <td>{exam.totalMarks}</td>
                    <td>
                      <span className={`status-badge status-${exam.status.toLowerCase()}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewDetails(exam)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(exam)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-upload"
                        onClick={() => setUploadingExamId(exam._id)}
                      >
                        Upload
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(exam._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetailsModal && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Exam Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{selectedExam.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="detail-value">{selectedExam.subject}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(selectedExam.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">
                  {selectedExam.startTime} - {selectedExam.endTime}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Marks:</span>
                <span className="detail-value">{selectedExam.totalMarks}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{selectedExam.duration} minutes</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${selectedExam.status.toLowerCase()}`}>
                  {selectedExam.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedExam.description || 'N/A'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadingExamId && (
        <div className="modal-overlay" onClick={() => setUploadingExamId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Exam Results</h2>
              <button
                className="close-btn"
                onClick={() => setUploadingExamId(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUploadResults}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="uploadFile">Select Excel File</label>
                  <input
                    type="file"
                    id="uploadFile"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                  />
                  <small className="file-help">
                    Supported formats: Excel (.xlsx, .xls) or CSV
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUploadingExamId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Results'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamAdmin;
