import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ManageUsers.css';

function ManageUsers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    department: '',
    enrollmentNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
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
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId 
        ? `http://localhost:5000/api/users/${editingId}` 
        : 'http://localhost:5000/api/users';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingId ? 'User updated successfully!' : 'User created successfully!');
        fetchUsers();
        resetForm();
      } else {
        alert('Error saving user');
      }
    } catch (error) {
      alert('Error saving user: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'student',
      department: '',
      enrollmentNumber: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (userItem) => {
    setFormData(userItem);
    setEditingId(userItem._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('User deleted successfully!');
          fetchUsers();
        } else {
          alert('Error deleting user');
        }
      } catch (error) {
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-users-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>👥 User Management Panel</h1>
          <div className="nav-links">
            <button onClick={() => navigate('/admin/exams')} className="nav-btn">📋 Manage Exams</button>
            <button className="nav-btn active">👥 Manage Users</button>
          </div>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="header-section">
          <h2>Manage Users</h2>
          <button 
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '✕ Cancel' : '➕ Add New User'}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Enrollment Number</label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={formData.enrollmentNumber}
                    onChange={handleInputChange}
                    placeholder="Enter enrollment number"
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                {editingId ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="users-list">
          <h3>All Users ({users.length})</h3>
          {users.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Enrollment #</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id}>
                      <td>{userItem.fullName}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge role-${userItem.role}`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td>{userItem.department || '-'}</td>
                      <td>{userItem.enrollmentNumber || '-'}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEdit(userItem)} 
                          className="btn-edit"
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(userItem._id)} 
                          className="btn-delete"
                          title="Delete user"
                        >
                          🗑️ Delete
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

export default ManageUsers;
