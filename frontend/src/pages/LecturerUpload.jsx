import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LecturerUpload.css';

function LecturerUpload() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState('marks');
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!csvData) {
      setMessage('Please select a CSV file');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const parsedData = parseCSV(csvData);

      if (uploadType === 'marks') {
        // Upload marks for each student
        for (const row of parsedData) {
          if (!row.studentId || !row.marks) {
            console.warn('Skipping invalid row:', row);
            continue;
          }

          await fetch(
            `http://localhost:4000/api/lecturer/student/${row.studentId}/marks`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ totalMarks: parseFloat(row.marks) }),
            }
          );
        }
        setMessage(`✅ Marks uploaded successfully for ${parsedData.length} students!`);
      } else if (uploadType === 'attendance') {
        // Upload attendance for each student
        for (const row of parsedData) {
          if (!row.studentId || !row.attendance) {
            console.warn('Skipping invalid row:', row);
            continue;
          }

          await fetch(
            `http://localhost:4000/api/lecturer/student/${row.studentId}/attendance`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ attendance: parseFloat(row.attendance) }),
            }
          );
        }
        setMessage(`✅ Attendance uploaded successfully for ${parsedData.length} students!`);
      }

      setCsvData('');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Error uploading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const downloadTemplate = () => {
    let template = '';

    if (uploadType === 'marks') {
      template = 'studentId,marks\n' +
                 'student_id_1,85\n' +
                 'student_id_2,90\n' +
                 'student_id_3,75';
    } else if (uploadType === 'attendance') {
      template = 'studentId,attendance\n' +
                 'student_id_1,95\n' +
                 'student_id_2,88\n' +
                 'student_id_3,92';
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', `${uploadType}_template.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="lecturer-upload-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📤 Upload Data</h1>
        </div>
        <div className="navbar-right">
          <button onClick={() => navigate('/lecturer')} className="back-btn">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="upload-content">
        <div className="upload-card">
          <h2>Bulk Upload Student Data</h2>
          
          {/* Upload Type Selection */}
          <div className="form-group">
            <label>Select Upload Type *</label>
            <select 
              value={uploadType} 
              onChange={(e) => {
                setUploadType(e.target.value);
                setCsvData('');
                setMessage('');
              }}
              className="select-input"
            >
              <option value="marks">Student Marks</option>
              <option value="attendance">Attendance Records</option>
            </select>
            <small className="help-text">
              {uploadType === 'marks' 
                ? 'Upload total marks for multiple students' 
                : 'Upload attendance percentage for multiple students'}
            </small>
          </div>

          {/* CSV Format Info */}
          <div className="info-box">
            <h3>CSV Format</h3>
            {uploadType === 'marks' && (
              <code>studentId,marks<br/>
              student_id_1,85<br/>
              student_id_2,90</code>
            )}
            {uploadType === 'attendance' && (
              <code>studentId,attendance<br/>
              student_id_1,95<br/>
              student_id_2,88</code>
            )}
          </div>

          {/* Download Template Button */}
          <button 
            onClick={downloadTemplate}
            className="template-btn"
          >
            📥 Download CSV Template
          </button>

          {/* File Upload */}
          <div className="form-group">
            <label>Upload CSV File *</label>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />
            {csvData && <p className="file-uploaded">✅ File loaded</p>}
          </div>

          {/* Preview */}
          {csvData && (
            <div className="preview-box">
              <h3>Data Preview</h3>
              <pre>{csvData.split('\n').slice(0, 5).join('\n')}{csvData.split('\n').length > 5 ? '\n...' : ''}</pre>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* Upload Button */}
          <button 
            onClick={handleUpload}
            disabled={loading || !csvData}
            className="upload-btn"
          >
            {loading ? 'Uploading...' : '📤 Upload Data'}
          </button>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h3>📋 Instructions</h3>
          <ol>
            <li>Select the type of data you want to upload (Marks or Attendance)</li>
            <li>Download the CSV template</li>
            <li>Open the template in Excel or Google Sheets</li>
            <li>Fill in the student IDs and their corresponding data</li>
            <li>Save as CSV format</li>
            <li>Upload the file here</li>
            <li>Click "Upload Data" to submit</li>
          </ol>

          <h4>Requirements:</h4>
          <ul>
            <li><strong>studentId:</strong> The MongoDB ID of the student (get from student list)</li>
            <li><strong>marks:</strong> Total marks out of 100</li>
            <li><strong>attendance:</strong> Attendance percentage (0-100)</li>
            <li>CSV file must have headers in first row</li>
            <li>All rows must have the required columns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LecturerUpload;
