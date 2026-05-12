import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/ExamTimeTable.css';

function ExamTimeTable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const EXAMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    code: '',
    date: '',
    startTime: '',
    endTime: '',
    totalMarks: '',
    duration: '',
    description: '',
    topic: '',
    year: new Date().getFullYear(),
    semester: '1',
    status: 'Scheduled',
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, selectedYear, selectedSemester]);

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
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      showNotification('Error loading exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams.filter(
      (exam) =>
        exam.year?.toString() === selectedYear &&
        exam.semester?.toString() === selectedSemester
    );
    filtered = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredExams(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === 'year' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.code || !formData.date || !formData.startTime) {
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
        showNotification(
          editingId ? 'Exam updated successfully' : 'Exam added to timetable successfully',
          'success'
        );
        resetForm();
        fetchExams();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error saving exam', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error saving exam', 'error');
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setFormData({
      ...exam,
      year: parseInt(exam.year),
      date: new Date(exam.date).toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam from the timetable?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          showNotification('Exam removed from timetable', 'success');
          fetchExams();
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting exam', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      code: '',
      date: '',
      startTime: '',
      endTime: '',
      totalMarks: '',
      duration: '',
      description: '',
      topic: '',
      year: new Date().getFullYear(),
      semester: '1',
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
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Pagination functions
  const getPaginatedExams = () => {
    const startIndex = (currentPage - 1) * EXAMS_PER_PAGE;
    const endIndex = startIndex + EXAMS_PER_PAGE;
    return filteredExams.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredExams.length / EXAMS_PER_PAGE);
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <PageLayout title="📅 Examination Time Table" subtitle="Manage Exam Schedule">
      <div className="admin-content">
        {message && (
          <div className={`notification notification-${messageType}`}>
            {message}
          </div>
        )}

        <div className="header-section">
          <h2>Exam Schedule</h2>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? 'Edit Exam' : 'Add Exam to Timetable'}</h3>
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
                    placeholder="e.g., Mathematics Final"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="code">Exam Code *</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., MATH101-FIN"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="topic">Topic</label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="Enter topic"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Exam Date *</label>
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
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
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
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 120"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="Special">Special</option>
                  </select>
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
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Exam' : 'Add to Timetable'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="filterYear">Year:</label>
            <select
              id="filterYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="filterSemester">Semester:</label>
            <select
              id="filterSemester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="Special">Special</option>
            </select>
          </div>
        </div>

        <div className="timetable-section">
          <div className="table-header-info">
            <h3>Exams Schedule - Year: {selectedYear} | Semester: {selectedSemester}</h3>
          </div>

          {loading ? (
            <div className="loading">Loading exam schedule...</div>
          ) : filteredExams.length === 0 ? (
            <div className="no-data">No exams scheduled for this period</div>
          ) : (
            <div className="timetable-wrapper">
              <div className="timetable-grid">
                {filteredExams.map((exam) => (
                  <div key={exam._id} className={`exam-card exam-status-${exam.status}`}>
                    <div className="exam-header">
                      <h4>{exam.title}</h4>
                      <span className={`status-badge status-${exam.status}`}>{exam.status}</span>
                    </div>
                    <div className="exam-details">
                      <p><strong>Code:</strong> {exam.code}</p>
                      <p><strong>Subject:</strong> {exam.subject}</p>
                      <p><strong>Date:</strong> {formatDate(exam.date)}</p>
                      <p><strong>Time:</strong> {exam.startTime} - {exam.endTime}</p>
                      <p><strong>Duration:</strong> {exam.duration} minutes</p>
                      <p><strong>Total Marks:</strong> {exam.totalMarks}</p>
                      {exam.topic && <p><strong>Topic:</strong> {exam.topic}</p>}
                      {exam.description && <p className="description"><strong>Details:</strong> {exam.description}</p>}
                    </div>
                    <div className="exam-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(exam)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(exam._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredExams.length > 0 && (
            <div className="timetable-table">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Exam Code</th>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Duration</th>
                    <th>Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedExams().map((exam) => (
                    <tr key={exam._id}>
                      <td>{formatDate(exam.date)}</td>
                      <td>{exam.startTime} - {exam.endTime}</td>
                      <td><strong>{exam.code}</strong></td>
                      <td>{exam.title}</td>
                      <td>{exam.subject}</td>
                      <td>{exam.duration} min</td>
                      <td>{exam.totalMarks}</td>
                      <td><span className={`status-badge status-${exam.status}`}>{exam.status}</span></td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(exam)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(exam._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredExams.length > 0 && (
            <div className="pagination-controls">
              <button 
                className="btn-pagination" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {getTotalPages()} (Total: {filteredExams.length} exams)
              </span>
              <button 
                className="btn-pagination" 
                onClick={handleNextPage}
                disabled={currentPage === getTotalPages()}
              >
                Next →
              </button>
            </div>
          )}

          <div className="add-button-section">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add Exam to Timetable'}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ExamTimeTable;
