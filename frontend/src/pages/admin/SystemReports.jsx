import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/SystemReports.css';

function SystemReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalExams: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  
  // Results management state
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [viewingResultsFor, setViewingResultsFor] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_BASE_URL = 'http://localhost:4000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, selectedYear, selectedSemester]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes, examsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      let users = [], courses = [], examsData = [];

      if (usersRes.ok) users = await usersRes.json();
      if (coursesRes.ok) courses = await coursesRes.json();
      if (examsRes.ok) examsData = await examsRes.json();

      const userArray = users.data || users || [];
      const courseArray = courses.data || courses || [];
      const examArray = examsData.data || examsData || [];

      setStats({
        totalUsers: userArray.length,
        totalCourses: courseArray.length,
        totalExams: examArray.length,
        totalStudents: userArray.filter((u) => u.role === 'student').length,
        totalLecturers: userArray.filter((u) => u.role === 'lecturer').length,
        totalAdmins: userArray.filter((u) => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExams(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const filterExams = () => {
    const filtered = exams.filter(
      (exam) =>
        exam.year?.toString() === selectedYear &&
        exam.semester?.toString() === selectedSemester
    );
    setFilteredExams(filtered);
  };

  const handleUploadClick = (exam) => {
    setSelectedExam(exam);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedExam) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('examId', selectedExam._id);

      const response = await fetch(`${API_BASE_URL}/exams/${selectedExam._id}/upload-results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(`Successfully uploaded ${data.data.uploadedCount} results!`, 'success');
        setShowUploadModal(false);
        setUploadFile(null);
        if (viewingResultsFor === selectedExam._id) {
          fetchResults(selectedExam._id);
        }
      } else {
        showMessage(data.message || 'Error uploading results', 'error');
      }
    } catch (error) {
      showMessage('Network error during upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const fetchResults = async (examId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
        setViewingResultsFor(examId);
      }
    } catch (error) {
      showMessage('Error fetching results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMasterReport = () => {
    const url = `${API_BASE_URL}/exams/results/download?year=${selectedYear}&semester=${selectedSemester}`;
    
    setLoading(true);
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (response.ok) return response.blob();
      return response.json().then(err => { throw new Error(err.message || 'Download failed'); });
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Master_Results_${selectedYear}_Sem_${selectedSemester}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showMessage('Master report downloaded successfully!', 'success');
    })
    .catch(err => showMessage(err.message, 'error'))
    .finally(() => setLoading(false));
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#2563eb';
      case 'Ongoing': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <PageLayout title="📊 System Reports" subtitle="System Analytics & Reports">
      <div className="admin-content">
        {message.text && (
          <div className={`notification notification-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h4>Total Users</h4>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <h4>Students</h4>
              <p className="stat-number">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-info">
              <h4>Lecturers</h4>
              <p className="stat-number">{stats.totalLecturers}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h4>Courses</h4>
              <p className="stat-number">{stats.totalCourses}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h4>Exams</h4>
              <p className="stat-number">{stats.totalExams}</p>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <div className="report-tabs">
            <button
              className={`report-tab ${selectedReport === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedReport('overview')}
            >
              📈 Overview
            </button>
            <button
              className={`report-tab ${selectedReport === 'results' ? 'active' : ''}`}
              onClick={() => setSelectedReport('results')}
            >
              🎓 Exam Results
            </button>
            <button
              className={`report-tab ${selectedReport === 'users' ? 'active' : ''}`}
              onClick={() => setSelectedReport('users')}
            >
              👥 User Distribution
            </button>
            <button
              className={`report-tab ${selectedReport === 'system' ? 'active' : ''}`}
              onClick={() => setSelectedReport('system')}
            >
              ⚙️ System Info
            </button>
          </div>

          <div className="report-content">
            {selectedReport === 'overview' && (
              <div className="report-view">
                <h3>System Overview</h3>
                <div className="overview-stats">
                  <p><strong>System Status:</strong> <span className="status-active">✓ Active</span></p>
                  <p><strong>Total Registered Users:</strong> {stats.totalUsers}</p>
                  <p><strong>Active Courses:</strong> {stats.totalCourses}</p>
                  <p><strong>Scheduled Exams:</strong> {stats.totalExams}</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>
            )}

            {selectedReport === 'results' && (
              <div className="report-view">
                <div className="results-header">
                  <h3>Exam Results Management</h3>
                  <div className="results-filters">
                    <div className="filter-group">
                      <label>Year:</label>
                      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Semester:</label>
                      <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="Special">Special</option>
                      </select>
                    </div>
                    <button 
                      className="btn-download-all" 
                      onClick={handleDownloadMasterReport}
                      title="Download results for all subjects in one Excel sheet"
                    >
                      📥 Download Master Report
                    </button>
                  </div>
                </div>

                <div className="exam-list-container">
                  <h4>Exams ({filteredExams.length})</h4>
                  {filteredExams.length === 0 ? (
                    <p className="no-data">No exams found for the selected year and semester.</p>
                  ) : (
                    <div className="exam-results-grid">
                      {filteredExams.map((exam) => (
                        <div key={exam._id} className="exam-result-card">
                          <div className="exam-card-header">
                            <span className="exam-code">{exam.code}</span>
                            <span className="status-dot" style={{ backgroundColor: getStatusColor(exam.status) }}></span>
                          </div>
                          <h5>{exam.title}</h5>
                          <p className="exam-subject">{exam.subject}</p>
                          <div className="exam-card-actions">
                            <button className="btn-upload" onClick={() => handleUploadClick(exam)}>
                              📤 Upload
                            </button>
                            <button className="btn-view" onClick={() => fetchResults(exam._id)}>
                              👁️ View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {viewingResultsFor && (
                  <div className="results-detail-section">
                    <div className="detail-header">
                      <h4>Results Detail - {selectedYear} Semester {selectedSemester}</h4>
                      <button className="btn-close" onClick={() => setViewingResultsFor(null)}>✕</button>
                    </div>
                    {results.length === 0 ? (
                      <p className="no-data">No results uploaded yet for this exam.</p>
                    ) : (
                      <div className="results-table-wrapper">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>Index No</th>
                              <th>Student Name</th>
                              <th>Email</th>
                              <th>Subject</th>
                              <th>Marks</th>
                              <th>Total</th>
                              <th>Grade</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((res) => (
                              <tr key={res._id}>
                                <td><strong>{res.indexNo || '-'}</strong></td>
                                <td>{res.studentName}</td>
                                <td>{res.studentEmail}</td>
                                <td>{res.examId?.subject || '-'}</td>
                                <td>{res.marksObtained}</td>
                                <td>{res.totalMarks}</td>
                                <td><span className={`grade-badge grade-${res.grade ? res.grade[0] : 'default'}`}>{res.grade}</span></td>
                                <td>{res.remarks || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedReport === 'users' && (
              <div className="report-view">
                <h3>User Distribution</h3>
                <div className="distribution-chart">
                  <div className="chart-item">
                    <span className="chart-label">Students</span>
                    <div className="chart-bar">
                      <div
                        className="chart-fill"
                        style={{
                          width: `${(stats.totalStudents / stats.totalUsers * 100) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="chart-value">{stats.totalStudents} ({Math.round((stats.totalStudents / stats.totalUsers * 100) || 0)}%)</span>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Lecturers</span>
                    <div className="chart-bar">
                      <div
                        className="chart-fill lecturer"
                        style={{
                          width: `${(stats.totalLecturers / stats.totalUsers * 100) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="chart-value">{stats.totalLecturers} ({Math.round((stats.totalLecturers / stats.totalUsers * 100) || 0)}%)</span>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Admins</span>
                    <div className="chart-bar">
                      <div
                        className="chart-fill admin"
                        style={{
                          width: `${(stats.totalAdmins / stats.totalUsers * 100) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="chart-value">{stats.totalAdmins} ({Math.round((stats.totalAdmins / stats.totalUsers * 100) || 0)}%)</span>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'system' && (
              <div className="report-view">
                <h3>System Information</h3>
                <div className="system-info">
                  <p><strong>Application:</strong> Learning Management System (LMS)</p>
                  <p><strong>Version:</strong> 1.0.1</p>
                  <p><strong>Backend URL:</strong> {API_BASE_URL}</p>
                  <p><strong>Database:</strong> MongoDB</p>
                  <p><strong>Authentication:</strong> JWT Token Based</p>
                  <p><strong>Last Sync:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Upload Exam Results</h3>
              <div className="exam-info-summary">
                <p><strong>Exam:</strong> {selectedExam.title}</p>
                <p><strong>Code:</strong> {selectedExam.code}</p>
                <p><strong>Year/Sem:</strong> {selectedExam.year} / Semester {selectedExam.semester}</p>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div className="form-group">
                  <label>Select Excel File (.xlsx, .xls)</label>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <small>Columns: Index Number, Student Name, Student Email, Marks Obtained, Remarks</small>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Results'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default SystemReports;
