import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ManageCourses.css';

function ManageCourses() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    description: '',
    credits: '',
    semester: '1',
    lecturer: '',
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Error loading courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCourses(filtered);
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

    if (!formData.courseName || !formData.courseCode) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/courses/${editingId}` : `${API_BASE_URL}/courses`;

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
          editingId ? 'Course updated successfully' : 'Course created successfully',
          'success'
        );
        resetForm();
        fetchCourses();
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error saving course', 'error');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData(course);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          showNotification('Course deleted successfully', 'success');
          fetchCourses();
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting course', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      description: '',
      credits: '',
      semester: '1',
      lecturer: '',
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="manage-courses-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>📚 Manage Courses</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        {message && (
          <div className={`notification notification-${messageType}`}>
            {message}
          </div>
        )}

        <div className="header-section">
          <h2>Courses Management</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Course'}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? 'Edit Course' : 'Create New Course'}</h3>
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courseName">Course Name *</label>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    placeholder="Enter course name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courseCode">Course Code *</label>
                  <input
                    type="text"
                    id="courseCode"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="credits">Credits</label>
                  <input
                    type="number"
                    id="credits"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    placeholder="Enter credits"
                    min="1"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lecturer">Lecturer</label>
                <input
                  type="text"
                  id="lecturer"
                  name="lecturer"
                  value={formData.lecturer}
                  onChange={handleInputChange}
                  placeholder="Enter lecturer name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter course description"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Course' : 'Create Course'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="courses-section">
          <h3>Courses ({filteredCourses.length})</h3>
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="no-data">No courses found</div>
          ) : (
            <div className="courses-table-wrapper">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Semester</th>
                    <th>Credits</th>
                    <th>Lecturer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>Sem {course.semester}</td>
                      <td>{course.credits}</td>
                      <td>{course.lecturer || 'N/A'}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(course)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(course._id)}
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
        </div>
      </div>
    </div>
  );
}

export default ManageCourses;
