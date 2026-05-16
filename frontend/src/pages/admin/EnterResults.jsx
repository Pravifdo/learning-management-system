import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import '../../styles/EnterResults.css';

function EnterResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    indexNo: '',
    studentEmail: '',
    studentName: '',
    marksObtained: '',
    grade: '',
    remarks: '',
  });

  const API_BASE_URL = 'http://localhost:4000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExamAndResults();
  }, [examId]);

  const fetchExamAndResults = async () => {
    try {
      setLoading(true);
      // Fetch exam details
      const examRes = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!examRes.ok) throw new Error('Failed to fetch exam details');
      const examData = await examRes.json();
      setExam(examData.data);

      // Fetch existing results
      const resultsRes = await fetch(`${API_BASE_URL}/exams/${examId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData.data || []);
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.indexNo) {
      showNotification('Index Number is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification(data.message, 'success');
        // Reset form but keep some context if needed? 
        // Usually, one-by-one means clearing for next student.
        setFormData({
          indexNo: '',
          studentEmail: '',
          studentName: '',
          marksObtained: '',
          grade: '',
          remarks: '',
        });
        // Refresh results list
        fetchExamAndResults();
      } else {
        throw new Error(data.message || 'Failed to save result');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/exams/results/${resultId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showNotification('Result deleted successfully', 'success');
        setResults(results.filter(r => r._id !== resultId));
      } else {
        throw new Error('Failed to delete result');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="loading">⏳ Loading Exam Data...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="enter-results-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="header-actions">
          <button className="btn-back" onClick={() => navigate('/admin/timetable')}>
            ← Back to Timetable
          </button>
          <h1>Manual Result Entry</h1>
        </div>

        {exam && (
          <div className="exam-info-card">
            <div className="info-item">
              <p>Exam Title</p>
              <h2>{exam.title}</h2>
            </div>
            <div className="info-item">
              <p>Exam Code</p>
              <h2>{exam.code}</h2>
            </div>
            <div className="info-item">
              <p>Total Marks</p>
              <h2>{exam.totalMarks}</h2>
            </div>
            <div className="info-item">
              <p>Year / Semester</p>
              <h2>{exam.year} / Sem {exam.semester}</h2>
            </div>
          </div>
        )}

        <div className="entry-section">
          <div className="form-card">
            <h3>✍️ Enter Student Result</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Index Number *</label>
                <input
                  type="text"
                  name="indexNo"
                  value={formData.indexNo}
                  onChange={handleInputChange}
                  placeholder="e.g. STU12345"
                  required
                />
              </div>
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group">
                <label>Student Email</label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Marks Obtained</label>
                <input
                  type="number"
                  name="marksObtained"
                  value={formData.marksObtained}
                  onChange={handleInputChange}
                  placeholder={`Max: ${exam?.totalMarks || 100}`}
                  max={exam?.totalMarks || 100}
                />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <select name="grade" value={formData.grade} onChange={handleInputChange}>
                  <option value="">Select Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                  <option value="AB">AB (Absent)</option>
                  <option value="W">W (Withdrawn)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Optional notes..."
                  rows="2"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? '⏳ Saving...' : '💾 Save Result'}
              </button>
            </form>
          </div>

          <div className="results-list-card">
            <div className="results-table-header">
              <h3>📋 Entered Results ({results.length})</h3>
            </div>
            
            {results.length === 0 ? (
              <div className="no-results">
                <p>No results entered for this exam yet.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Index No</th>
                      <th>Name</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => (
                      <tr key={res._id}>
                        <td><span className="student-index">{res.indexNo}</span></td>
                        <td>{res.studentName || '—'}</td>
                        <td>{res.marksObtained} / {res.totalMarks}</td>
                        <td>
                          <span className={`badge-grade grade-${res.grade?.charAt(0)}`}>
                            {res.grade || '—'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDelete(res._id)}>
                            🗑️
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
      </div>
    </PageLayout>
  );
}

export default EnterResults;
