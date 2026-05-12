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

  const [editableRows, setEditableRows] = useState([]);
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
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value) : value,
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

  const loadSampleData = async () => {
    const sampleExams = [
      {
        title: 'Mathematics Final Examination',
        subject: 'Mathematics',
        code: 'MATH101-FIN',
        topic: 'Calculus, Algebra, Geometry',
        date: new Date(2026, 4, 20).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        duration: '120',
        totalMarks: '100',
        year: 2026,
        semester: '1',
        status: 'Scheduled',
        description: 'Final examination covering chapters 1-12. Calculator allowed.'
      },
      {
        title: 'English Literature Mid-Term',
        subject: 'English Literature',
        code: 'ENG201-MID',
        topic: 'Shakespeare, Poetry, Modern Literature',
        date: new Date(2026, 4, 22).toISOString().split('T')[0],
        startTime: '10:30',
        endTime: '12:30',
        duration: '120',
        totalMarks: '75',
        year: 2026,
        semester: '1',
        status: 'Scheduled',
        description: 'Essay-based exam. Three questions - choose two.'
      },
      {
        title: 'Physics Practical Examination',
        subject: 'Physics',
        code: 'PHY301-LAB',
        topic: 'Optics, Electricity, Mechanics',
        date: new Date(2026, 4, 25).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        duration: '120',
        totalMarks: '50',
        year: 2026,
        semester: '1',
        status: 'Scheduled',
        description: 'Laboratory practical exam. 5 experiments to perform.'
      },
      {
        title: 'Chemistry Comprehensive Final',
        subject: 'Chemistry',
        code: 'CHEM101-COMP',
        topic: 'Organic Chemistry, Inorganic Chemistry, Physical Chemistry',
        date: new Date(2026, 5, 1).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:30',
        duration: '150',
        totalMarks: '100',
        year: 2026,
        semester: '2',
        status: 'Scheduled',
        description: 'Comprehensive final exam covering entire course.'
      },
      {
        title: 'Biology Semester Exam',
        subject: 'Biology',
        code: 'BIO102-SEM',
        topic: 'Cell Biology, Genetics, Evolution, Ecology',
        date: new Date(2026, 5, 3).toISOString().split('T')[0],
        startTime: '13:00',
        endTime: '15:00',
        duration: '120',
        totalMarks: '80',
        year: 2026,
        semester: '2',
        status: 'Scheduled',
        description: 'Multiple choice and short answer format.'
      }
    ];

    try {
      let successCount = 0;
      for (const exam of sampleExams) {
        try {
          const response = await fetch(`${API_BASE_URL}/exams`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(exam),
          });

          if (response.ok) {
            successCount++;
          }
        } catch (err) {
          console.error('Error adding exam:', err);
        }
      }

      showNotification(`Sample data loaded! ${successCount} exams added.`, 'success');
      fetchExams();
    } catch (error) {
      console.error('Error loading sample data:', error);
      showNotification('Error loading sample data', 'error');
    }
  };

  const addNewTableRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      _id: null,
      title: '',
      subject: '',
      code: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: '',
      isSaving: false,
    };
    setEditableRows([...editableRows, newRow]);
  };

  const updateTableCell = (index, field, value) => {
    const updatedRows = [...editableRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    };
    setEditableRows(updatedRows);
  };

  const deleteTableRow = async (index) => {
    const row = editableRows[index];
    
    if (row._id) {
      // Existing exam - confirm deletion
      if (window.confirm('Delete this exam?')) {
        try {
          const response = await fetch(`${API_BASE_URL}/exams/${row._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            showNotification('Exam deleted successfully', 'success');
            setEditableRows(editableRows.filter((_, i) => i !== index));
            fetchExams();
          }
        } catch (error) {
          console.error('Error deleting exam:', error);
          showNotification('Error deleting exam', 'error');
        }
      }
    } else {
      // New row - just remove it
      setEditableRows(editableRows.filter((_, i) => i !== index));
    }
  };

  const saveTableRow = async (index) => {
    const row = editableRows[index];

    // Validation
    if (!row.title || !row.code || !row.date || !row.startTime) {
      showNotification('Please fill in all required fields (Title, Code, Date, Start Time)', 'error');
      return;
    }

    try {
      // Update saving state
      const updatedRows = [...editableRows];
      updatedRows[index] = { ...row, isSaving: true };
      setEditableRows(updatedRows);

      // Prepare data with year/semester/status from filters or defaults
      const examData = {
        title: row.title,
        subject: row.subject,
        code: row.code,
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        year: parseInt(selectedYear),
        semester: selectedSemester,
        status: 'Scheduled',
        description: '',
        topic: '',
        totalMarks: '',
      };

      const method = row._id ? 'PUT' : 'POST';
      const url = row._id ? `${API_BASE_URL}/exams/${row._id}` : `${API_BASE_URL}/exams`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      if (response.ok) {
        showNotification(row._id ? 'Exam updated successfully' : 'Exam added successfully', 'success');
        setEditableRows(editableRows.filter((_, i) => i !== index));
        fetchExams();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error saving exam', 'error');
        // Reset saving state
        updatedRows[index] = { ...row, isSaving: false };
        setEditableRows(updatedRows);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error saving exam', 'error');
      // Reset saving state
      const updatedRows = [...editableRows];
      updatedRows[index] = { ...row, isSaving: false };
      setEditableRows(updatedRows);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
          <div className="editable-table-container">
            <h3>Add/Edit Exams - Enter Data Directly</h3>
            <div className="editable-table-wrapper">
              <table className="editable-input-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration (min)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editableRows.map((row, index) => (
                    <tr key={row.id} className={row.isSaving ? 'saving' : ''}>
                      <td>
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => updateTableCell(index, 'title', e.target.value)}
                          placeholder="Exam title"
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.subject}
                          onChange={(e) => updateTableCell(index, 'subject', e.target.value)}
                          placeholder="Subject"
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => updateTableCell(index, 'code', e.target.value)}
                          placeholder="Code"
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateTableCell(index, 'date', e.target.value)}
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateTableCell(index, 'startTime', e.target.value)}
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => updateTableCell(index, 'endTime', e.target.value)}
                          disabled={row.isSaving}
                          className="editable-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.duration}
                          onChange={(e) => updateTableCell(index, 'duration', e.target.value)}
                          placeholder="120"
                          disabled={row.isSaving}
                          className="editable-input"
                          min="1"
                        />
                      </td>
                      <td className="action-buttons">
                        <button
                          className="btn-save"
                          onClick={() => saveTableRow(index)}
                          disabled={row.isSaving}
                          title="Save"
                        >
                          {row.isSaving ? '⏳' : '💾'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => deleteTableRow(index)}
                          disabled={row.isSaving}
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
            <div className="editable-table-controls">
              <button className="btn-add-row" onClick={addNewTableRow}>
                ➕ Add Row
              </button>
              {editableRows.length > 0 && (
                <span className="row-count">{editableRows.length} row(s) ready to save</span>
              )}
            </div>
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
          <div className="filter-group">
            <button 
              className="btn-load-sample"
              onClick={loadSampleData}
              title="Load sample exam data"
            >
              📋 Load Sample Data
            </button>
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
                    <th>Topic</th>
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
                      <td>{exam.topic || '-'}</td>
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
            <button 
              className="btn-primary" 
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditableRows([]);
                }
              }}
            >
              {showForm ? 'Close Table' : '+ Add Exam to Timetable'}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ExamTimeTable;
