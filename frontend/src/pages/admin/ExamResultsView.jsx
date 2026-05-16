import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/ExamResultsView.css';

function ExamResultsView() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  const API_BASE_URL = 'http://localhost:4000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!examId) {
      setError('No exam selected');
      setLoading(false);
      return;
    }
    fetchExamAndResults();
  }, [examId]);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm]);

  const fetchExamAndResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch exam details
      const examResponse = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!examResponse.ok) throw new Error('Failed to fetch exam');
      const examData = await examResponse.json();
      setExam(examData.data || examData);

      // Fetch results
      const resultsResponse = await fetch(
        `${API_BASE_URL}/exams/${examId}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resultsResponse.ok) {
        if (resultsResponse.status === 404) {
          setResults([]);
        } else {
          throw new Error('Failed to fetch results');
        }
      } else {
        const resultsData = await resultsResponse.json();
        setResults(resultsData.data || resultsData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    if (!results.length) {
      setFilteredResults([]);
      return;
    }

    let filtered = results;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = results.filter((result) =>
        result.studentEmail?.toLowerCase().includes(term) ||
        result.studentName?.toLowerCase().includes(term) ||
        result.studentIndex?.toLowerCase().includes(term)
      );
    }

    setFilteredResults(filtered.sort((a, b) => a.studentIndex?.localeCompare(b.studentIndex)));
  };

  const downloadAsCSV = () => {
    if (!filteredResults.length) {
      alert('No results to download');
      return;
    }

    const headers = [
      'Index Number',
      'Student Email',
      'Student Name',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'Grade',
      'Remarks',
    ];

    const rows = filteredResults.map((result) => [
      result.studentIndex || result.studentEmail,
      result.studentEmail,
      result.studentName || 'N/A',
      result.marksObtained || '',
      result.totalMarks || exam?.totalMarks || '',
      result.percentage?.toFixed(2) || '',
      result.grade || '',
      result.remarks || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${examId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="exam-results-container">
          <div className="loading">⏳ Loading exam results...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="exam-results-container">
          <button className="btn-back" onClick={() => navigate('/admin/exam-timetable')}>
            ← Back to Exams
          </button>
          <div className="error-message">❌ {error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="exam-results-container">
        <button className="btn-back" onClick={() => navigate('/admin/exam-timetable')}>
          ← Back to Exams
        </button>

        {exam && (
          <div className="exam-header">
            <h1>📊 Exam Results</h1>
            <div className="exam-details">
              <p>
                <strong>Exam:</strong> {exam.title} ({exam.code})
              </p>
              <p>
                <strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Marks:</strong> {exam.totalMarks}
              </p>
              <p>
                <strong>Results:</strong> {filteredResults.length} records
              </p>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="no-results">
            <p>📭 No results uploaded for this exam yet</p>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-controls">
              <input
                type="text"
                placeholder="🔍 Search by email, name, or index..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="btn-download" onClick={downloadAsCSV}>
                📥 Download CSV
              </button>
            </div>

            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Index Number</th>
                    <th>Student Email</th>
                    <th>Student Name</th>
                    <th>Marks</th>
                    <th>Total</th>
                    <th>%</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => (
                    <tr key={idx} className={`grade-${result.grade?.toLowerCase()}`}>
                      <td className="index-number">
                        {result.studentIndex || result.studentEmail}
                      </td>
                      <td>{result.studentEmail}</td>
                      <td>{result.studentName || '—'}</td>
                      <td className="marks">{result.marksObtained || '—'}</td>
                      <td className="total-marks">{result.totalMarks || exam?.totalMarks || '—'}</td>
                      <td className="percentage">
                        {result.percentage?.toFixed(2) || '—'}%
                      </td>
                      <td className={`grade grade-badge-${result.grade?.toLowerCase()}`}>
                        {result.grade || '—'}
                      </td>
                      <td className="remarks">{result.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="results-summary">
              <p>
                <strong>Total Records:</strong> {filteredResults.length}
              </p>
              {filteredResults.length > 0 && (
                <p>
                  <strong>Average Grade:</strong>{' '}
                  {(
                    filteredResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
                    filteredResults.length
                  ).toFixed(2)}
                  %
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default ExamResultsView;
