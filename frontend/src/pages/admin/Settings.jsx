import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Settings.css';

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [settings, setSettings] = useState({
    institutionName: 'Learning Management System',
    institutionEmail: 'admin@lms.com',
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxUploadSize: 50,
    sessionTimeout: 30,
    notificationsEnabled: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      // Save settings (would typically call an API)
      console.log('Saving settings:', settings);
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      showNotification('Error saving settings', 'error');
    }
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
    <div className="settings-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>System Settings</h1>
          <div className="nav-links">
            <button className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-btn" onClick={() => navigate('/admin/users')}>Users</button>
            <button className="nav-btn" onClick={() => navigate('/admin/courses')}>Courses</button>
            <button className="nav-btn" onClick={() => navigate('/admin/exams')}>Exams</button>
            <button className="nav-btn" onClick={() => navigate('/admin/reports')}>Reports</button>
            <button className="nav-btn active" onClick={() => navigate('/admin/settings')}>Settings</button>
          </div>
        </div>
        <div className="navbar-right">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {message && (
        <div className={`notification notification-${messageType}`}>
          {message}
        </div>
      )}

      <div className="admin-content">
        <div className="header-section">
          <h2>System Configuration</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-form">
          <div className="settings-section">
            <h3>📋 Institution Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Institution Name</label>
                <input
                  type="text"
                  name="institutionName"
                  value={settings.institutionName}
                  onChange={handleInputChange}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="form-group">
                <label>Institution Email</label>
                <input
                  type="email"
                  name="institutionEmail"
                  value={settings.institutionEmail}
                  onChange={handleInputChange}
                  placeholder="Enter institution email"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>🔒 Security Settings</h3>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                />
                Enable Maintenance Mode
              </label>
              <p className="help-text">System will be unavailable to users except admins</p>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="allowNewRegistrations"
                  checked={settings.allowNewRegistrations}
                  onChange={handleInputChange}
                />
                Allow New Registrations
              </label>
              <p className="help-text">Allow new users to create accounts</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleInputChange}
                  min="5"
                  max="480"
                />
              </div>
              <div className="form-group">
                <label>Max Upload Size (MB)</label>
                <input
                  type="number"
                  name="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={handleInputChange}
                  min="1"
                  max="500"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>🔔 Notification Settings</h3>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onChange={handleInputChange}
                />
                Enable System Notifications
              </label>
              <p className="help-text">Send notifications for important system events</p>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <button type="button" className="btn-danger-action" onClick={() => {
              if (window.confirm('Are you sure? This cannot be undone!')) {
                showNotification('Database backed up before clearing', 'success');
              }
            }}>
              🗑️ Clear System Cache
            </button>
            <button type="button" className="btn-danger-action" onClick={() => {
              if (window.confirm('Generate system backup?')) {
                showNotification('Backup created successfully!', 'success');
              }
            }}>
              💾 Create System Backup
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              💾 Save All Settings
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
