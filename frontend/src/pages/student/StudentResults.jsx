import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/StudentResults.css';

function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:4000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/exams/my/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your results');
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError('Unable to load results');
      }
    } catch (err) {
      setError(err.message || 'Error loading results');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <PageLayout title="📊 My Exam Results" subtitle="View your grades and performance">
      <div className="results-content">
        {loading && <div className="loading">Loading your results...</div>}
        {error && <div className="error-message">⚠️ {error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">📄</div>
            <h3>No Results Available</h3>
            <p>Your exam results haven't been uploaded yet. Please check back later or contact your instructor.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="results-grid">
            {results.map((result) => (
              <div key={result._id} className="result-card">
                <div className="result-card-header">
                  <div className="exam-info">
                    <span className="exam-code">{result.examId?.code || 'EXAM'}</span>
                    <h3>{result.examId?.title || 'Unknown Exam'}</h3>
                  </div>
                  <div className={`grade-badge grade-${result.grade}`}>
                    {result.grade}
                  </div>
                </div>
                
                <div className="result-card-body">
                  <div className="result-stat">
                    <label>Marks Obtained</label>
                    <div className="stat-value">
                      <span className="obtained">{result.marksObtained}</span>
                      <span className="total">/ {result.totalMarks}</span>
                    </div>
                  </div>
                  
                  <div className="result-stat">
                    <label>Percentage</label>
                    <div className="stat-value">
                      <span className="percentage">{result.percentage}%</span>
                    </div>
                    <div className="progress-mini">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${result.percentage}%`, backgroundColor: getGradeColor(result.grade) }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="result-card-footer">
                  <div className="footer-item">
                    <span>📅 Date:</span>
                    <strong>{formatDate(result.examId?.date)}</strong>
                  </div>
                  <div className="footer-item">
                    <span>📚 Subject:</span>
                    <strong>{result.examId?.subject || 'N/A'}</strong>
                  </div>
                  {result.indexNo && (
                    <div className="footer-item">
                      <span>🎓 Index No:</span>
                      <strong>{result.indexNo}</strong>
                    </div>
                  )}
                </div>
                {result.remarks && (
                  <div className="result-remarks">
                    <p><strong>Remarks:</strong> {result.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

// Helper to get color based on grade
const getGradeColor = (grade) => {
  const colors = {
    'A+': '#27ae60',
    'A': '#2ecc71',
    'B+': '#3498db',
    'B': '#2980b9',
    'C+': '#f1c40f',
    'C': '#f39c12',
    'D': '#e67e22',
    'F': '#e74c3c'
  };
  return colors[grade] || '#95a5a6';
};

export default StudentResults;
