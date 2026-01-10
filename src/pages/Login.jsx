import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCsrfToken, getCsrfToken } from '../utils/csrf';
import './Page.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/myAccount');
    }
  }, [isAuthenticated, navigate]);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const loadCsrfToken = async () => {
      // Always try to fetch from backend first to ensure cookie is set
      let token = await fetchCsrfToken();
      
      // If still not found, try to get from cookie
      if (!token) {
        token = getCsrfToken();
      }
      
      setCsrfToken(token);
      console.log('CSRF Token loaded:', token ? 'Found' : 'Not found');
    };

    loadCsrfToken();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Get CSRF token (from state, or try to fetch fresh)
    let token = csrfToken || getCsrfToken();
    
    // If still no token, try to fetch it
    if (!token) {
      token = await fetchCsrfToken();
      if (token) {
        setCsrfToken(token);
      }
    }
    
    if (!token) {
      setError('Unable to retrieve CSRF token. Please refresh the page.');
      setLoading(false);
      return;
    }
    
    const result = await login(formData.email, formData.password, token);

    if (result.success) {
      navigate('/myAccount');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your EasyBank account</p>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link-primary">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

