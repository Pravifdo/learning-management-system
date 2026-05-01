import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ExamAdmin.css';

function ExamAdmin() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [newRows, setNewRows] = useState([]);
  const [editingData, setEditingData] = useState({});

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
          exam.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((exam) => exam.status === filterStatus);
    }

    setFilteredExams(filtered);
  };

  const addNewRow = () => {
    const newRowId = `new-${Date.now()}`;
    setNewRows([
      ...newRows,
      {
        id: newRowId,
        title: '',
        subject: '',
        code: '',
        date: '',
        startTime: '',
        endTime: '',
        totalMarks: '',
        duration: '',
        description: '',
        status: 'Scheduled',
      },
    ]);
    setEditingRowId(newRowId);
  };

  const handleNewRowChange = (rowId, field, value) => {
    setNewRows(
      newRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleEditChange = (examId, field, value) => {
    setEditingData({
      ...editingData,
      [examId]: {
        ...(editingData[examId] || exams.find((e) => e._id === examId)),
        [field]: value,
      },
    });
  };

  const saveNewRow = async (rowId) => {
    const newRow = newRows.find((r) => r.id === rowId);

    if (
      !newRow.title ||
      !newRow.subject ||
      !newRow.code ||
      !newRow.date ||
      !newRow.totalMarks
    ) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newRow.title,
          subject: newRow.subject,
          code: newRow.code,
          date: newRow.date,
          startTime: newRow.startTime,
          endTime: newRow.endTime,
          totalMarks: newRow.totalMarks,
          duration: newRow.duration,
          description: newRow.description,
          status: newRow.status,
        }),
      });

      if (response.ok) {
        showNotification('Exam created successfully', 'success');
        setNewRows(newRows.filter((r) => r.id !== rowId));
        setEditingRowId(null);
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

  const cancelNewRow = (rowId) => {
    setNewRows(newRows.filter((r) => r.id !== rowId));
    setEditingRowId(null);
  };

  const startEdit = (examId) => {
    const exam = exams.find((e) => e._id === examId);
    setEditingData({
      [examId]: { ...exam },
    });
    setEditingRowId(examId);
  };

  const saveEdit = async (examId) => {
    const data = editingData[examId];

    if (!data.title || !data.subject || !data.code || !data.date || !data.totalMarks) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          subject: data.subject,
          code: data.code,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          totalMarks: data.totalMarks,
          duration: data.duration,
          description: data.description,
          status: data.status,
        }),
      });

      if (response.ok) {
        showNotification('Exam updated successfully', 'success');
        setEditingRowId(null);
        setEditingData({});
        fetchExams();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update exam');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    }
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
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

  const showNotification = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const displayDate = (dateString) => {
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
        <div className="institution-header">
          <h2 className="institution-name">Easter University Sri Lanka</h2>
          <p className="campus-name">Trincomalee Campus</p>
          <p className="faculty-info">Faculty of Applied Science | Department of Computer Science</p>
          <h1 className="exam-title">📋 Examination Time Table</h1>
        </div>
        <button className="btn btn-primary" onClick={addNewRow}>
          + Add New Row
        </button>
      </div>

      {message && (
        <div className={`notification notification-${messageType}`}>
          {message}
        </div>
      )}

      <div className="exam-filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by exam title, subject, or code..."
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
        <h2>Exam Timetable ({filteredExams.length + newRows.length})</h2>
        {loading ? (
          <div className="loading">Loading exams...</div>
        ) : filteredExams.length === 0 && newRows.length === 0 ? (
          <div className="no-data">No exams found. Click "Add New Row" to create one.</div>
        ) : (
          <div className="exam-table-wrapper">
            <table className="exam-table timetable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration (min)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* New Rows */}
                {newRows.map((row) => (
                  <tr key={row.id} className="new-row">
                    <td>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleNewRowChange(row.id, 'date', e.target.value)}
                        className="cell-input"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.subject}
                        onChange={(e) => handleNewRowChange(row.id, 'subject', e.target.value)}
                        className="cell-input"
                        placeholder="Subject"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.code}
                        onChange={(e) => handleNewRowChange(row.id, 'code', e.target.value)}
                        className="cell-input"
                        placeholder="Code"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => handleNewRowChange(row.id, 'title', e.target.value)}
                        className="cell-input"
                        placeholder="Title"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) => handleNewRowChange(row.id, 'startTime', e.target.value)}
                        className="cell-input"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={(e) => handleNewRowChange(row.id, 'endTime', e.target.value)}
                        className="cell-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.duration}
                        onChange={(e) => handleNewRowChange(row.id, 'duration', e.target.value)}
                        className="cell-input"
                        placeholder="mins"
                      />
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => saveNewRow(row.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => cancelNewRow(row.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Existing Exams */}
                {filteredExams.map((exam) => (
                  <tr key={exam._id} className={`status-${exam.status.toLowerCase()}`}>
                    <td className="date-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="date"
                          value={formatDate(editingData[exam._id]?.date)}
                          onChange={(e) => handleEditChange(exam._id, 'date', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        displayDate(exam.date)
                      )}
                    </td>
                    <td className="subject-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="text"
                          value={editingData[exam._id]?.subject}
                          onChange={(e) => handleEditChange(exam._id, 'subject', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        exam.subject
                      )}
                    </td>
                    <td className="code-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="text"
                          value={editingData[exam._id]?.code}
                          onChange={(e) => handleEditChange(exam._id, 'code', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        <span className="code-badge">{exam.code}</span>
                      )}
                    </td>
                    <td className="title-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="text"
                          value={editingData[exam._id]?.title}
                          onChange={(e) => handleEditChange(exam._id, 'title', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        exam.title
                      )}
                    </td>
                    <td className="time-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="time"
                          value={editingData[exam._id]?.startTime}
                          onChange={(e) => handleEditChange(exam._id, 'startTime', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        exam.startTime || 'N/A'
                      )}
                    </td>
                    <td className="time-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="time"
                          value={editingData[exam._id]?.endTime}
                          onChange={(e) => handleEditChange(exam._id, 'endTime', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        exam.endTime || 'N/A'
                      )}
                    </td>
                    <td className="duration-cell">
                      {editingRowId === exam._id ? (
                        <input
                          type="number"
                          value={editingData[exam._id]?.duration}
                          onChange={(e) => handleEditChange(exam._id, 'duration', e.target.value)}
                          className="cell-input"
                        />
                      ) : (
                        exam.duration
                      )}
                    </td>
                    <td className="action-buttons">
                      {editingRowId === exam._id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => saveEdit(exam._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewDetails(exam)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => startEdit(exam._id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(exam._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
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
                <span className="detail-label">Code:</span>
                <span className="detail-value">
                  <span className="code-badge">{selectedExam.code}</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{displayDate(selectedExam.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Time:</span>
                <span className="detail-value">{selectedExam.startTime || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">End Time:</span>
                <span className="detail-value">{selectedExam.endTime || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{selectedExam.duration} minutes</span>
              </div>
              {selectedExam.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedExam.description}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamAdmin;
