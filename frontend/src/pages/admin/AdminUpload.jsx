import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/PageLayout';
import '../../styles/AdminUpload.css';

function AdminUpload() {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, history

  const [formData, setFormData] = useState({
    type: 'notes',
    lecturerId: '',
    subject: '',
    topic: '',
    file: null,
    startDate: '',
    endDate: '',
  });

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:4000/api';

  // Fetch all lecturers
  useEffect(() => {
    fetchLecturers();
    if (activeTab === 'history') {
      fetchAllUploads();
    }
  }, [activeTab]);

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLecturers(data.lecturers || []);
      } else {
        setMessage('❌ Failed to load lecturers');
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      setMessage('❌ Error loading lecturers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUploads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/uploads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsUploading(true);

    try {
      // Validate form
      if (!formData.lecturerId || !formData.subject || !formData.topic || !formData.file) {
        throw new Error('Please fill all required fields');
      }

      if (formData.type === 'assignment' && (!formData.startDate || !formData.endDate)) {
        throw new Error('Assignment requires start and end dates');
      }

      // Prepare FormData
      const uploadFormData = new FormData();
      uploadFormData.append('lecturerId', formData.lecturerId);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('topic', formData.topic);
      uploadFormData.append('file', formData.file);

      if (formData.type === 'assignment') {
        uploadFormData.append('startDate', formData.startDate);
        uploadFormData.append('endDate', formData.endDate);
      }

      // Determine endpoint
      const endpoint =
        formData.type === 'notes'
          ? `${API_BASE_URL}/admin/uploads/notes`
          : `${API_BASE_URL}/admin/uploads/assignment`;

      // Upload file
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (response.ok) {
        setMessage(`✅ ${formData.type === 'notes' ? 'Lecture notes' : 'Assignment'} uploaded successfully!`);

        // Reset form
        setFormData({
          type: 'notes',
          lecturerId: '',
          subject: '',
          topic: '',
          file: null,
          startDate: '',
          endDate: '',
        });

        // Clear file input
        document.getElementById('fileInput').value = '';

        // Refresh history
        if (activeTab === 'history') {
          fetchAllUploads();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/uploads/${uploadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('✅ Upload deleted successfully');
        fetchAllUploads();
      } else {
        setMessage('❌ Failed to delete upload');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('❌ Error deleting upload');
    }
  };

  const selectedLecturer = lecturers.find((l) => l.id === formData.lecturerId);
  const lecturerUploads = uploads.filter(
    (u) => u.lecturerId._id === formData.lecturerId
  );

  return (
    <PageLayout
      title="📤 Manage Lecturer Materials"
      subtitle="Upload and manage lecturer notes and assignments"
    >
      <div className="admin-upload-container">
        {/* Message */}
        {message && (
          <div
            className={`alert ${
              message.includes('✅') ? 'alert-success' : 'alert-error'
            }`}
          >
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload Materials
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Upload History ({uploads.length})
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="upload-section">
            <form onSubmit={handleSubmit} className="upload-form">
              {/* Type Selection */}
              <div className="form-group">
                <label>Material Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="notes">📘 Lecture Notes</option>
                  <option value="assignment">📂 Assignment</option>
                </select>
              </div>

              {/* Lecturer Selection */}
              <div className="form-group">
                <label>Select Lecturer *</label>
                <select
                  name="lecturerId"
                  value={formData.lecturerId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.fullName} - {lecturer.subject}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLecturer && (
                <div className="lecturer-info">
                  <p>
                    <strong>Subject:</strong> {selectedLecturer.subject}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedLecturer.department}
                  </p>
                </div>
              )}

              {/* Subject */}
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g., Mathematics 101"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Topic */}
              <div className="form-group">
                <label>Topic *</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g., Calculus - Chapter 5"
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Dates for Assignment */}
              {formData.type === 'assignment' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* File Upload */}
              <div className="form-group">
                <label>Upload File *</label>
                <div className="file-upload">
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="fileInput" className="file-label">
                    {formData.file
                      ? `✅ ${formData.file.name}`
                      : '📎 Choose file or drag and drop'}
                  </label>
                </div>
                <small>
                  Supported: PDF, Word, PowerPoint, Excel, Images (Max 50MB)
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="btn-submit"
              >
                {isUploading ? '⏳ Uploading...' : '📤 Upload Material'}
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-section">
            {loading && <p>Loading upload history...</p>}

            {!loading && uploads.length === 0 && (
              <div className="empty-state">
                <p>📭 No uploads yet</p>
              </div>
            )}

            {!loading && uploads.length > 0 && (
              <>
                <div className="filter-info">
                  <p>Total Uploads: {uploads.length}</p>
                </div>

                <div className="uploads-table-wrapper">
                  <table className="uploads-table">
                    <thead>
                      <tr>
                        <th>Lecturer</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Topic</th>
                        <th>Uploaded</th>
                        <th>File Size</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((upload) => (
                        <tr key={upload._id} className={`upload-row ${upload.type}`}>
                          <td>
                            <strong>{upload.userId?.fullName || 'N/A'}</strong>
                          </td>
                          <td>
                            <span className={`type-badge ${upload.type}`}>
                              {upload.type === 'notes' ? '📘 Notes' : '📂 Assignment'}
                            </span>
                          </td>
                          <td>{upload.subject}</td>
                          <td>{upload.topic}</td>
                          <td>
                            {new Date(upload.uploadedAt).toLocaleDateString()}
                          </td>
                          <td>
                            {upload.fileSize
                              ? `${(upload.fileSize / 1024).toFixed(2)} KB`
                              : 'N/A'}
                          </td>
                          <td className="actions">
                            <a
                              href={upload.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-small btn-download"
                            >
                              ⬇️ Download
                            </a>
                            <button
                              onClick={() => handleDeleteUpload(upload._id)}
                              className="btn-small btn-delete"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default AdminUpload;
