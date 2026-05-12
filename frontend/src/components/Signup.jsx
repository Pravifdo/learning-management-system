import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Signup.css';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [regNo, setRegNo] = useState('');
  const [indexNo, setIndexNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (role === 'student' && !regNo) {
      setError('Registration number is required for students');
      setLoading(false);
      return;
    }

    if (role === 'student' && !indexNo) {
      setError('Index number is required for exam and results tracking');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          regNo: role === 'student' ? regNo : null,
          indexNo: role === 'student' ? indexNo : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      // Login immediately after signup
      if (data.token) {
        login(data.token, data.user);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="regNo">Registration Number</label>
              <input
                type="text"
                id="regNo"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="Enter your registration number"
              />
            </div>
          )}

          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="indexNo">Index Number <span className="required">*</span></label>
              <input
                type="text"
                id="indexNo"
                value={indexNo}
                onChange={(e) => setIndexNo(e.target.value)}
                placeholder="Enter your index number (for exam & results)"
                required
              />
              <small className="help-text">This index number will be used for exam writing and result tracking</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
