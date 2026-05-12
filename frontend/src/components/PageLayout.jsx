import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/PageStyles.css';

function PageLayout({ title, subtitle, children, showUserInfo = false, userDetails = null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="navbar-left">
          <h1>{title}</h1>
        </div>
        <div className="page-header-right">
          <span className="page-header-user">{user?.fullName}</span>
          <button onClick={handleLogout} className="page-header-btn">Logout</button>
        </div>
      </header>

      {/* Page Content */}
      <div className="page-content">
        {/* Title Section */}
        {subtitle && (
          <div className="page-title-section">
            <h2>{subtitle}</h2>
          </div>
        )}

        {/* Main Content */}
        <div className="page-main">
          {children}
        </div>

        {/* User Info Section */}
        {showUserInfo && (
          <div className="info-section">
            <h3>Account Information</h3>
            <div className="user-details">
              {userDetails ? (
                userDetails
              ) : (
                <>
                  <p><strong>Name:</strong> {user?.fullName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                  {user?.regNo && <p><strong>Registration No:</strong> {user?.regNo}</p>}
                  {user?.indexNo && <p><strong>Index No:</strong> {user?.indexNo}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageLayout;
