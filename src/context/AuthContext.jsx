import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (check localStorage)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, csrfToken) => {
    try {
      // Create HTTP Basic Auth header
      const credentials = btoa(`${email}:${password}`);
      const basicAuth = `Basic ${credentials}`;

      const headers = {
        'Authorization': basicAuth
      };

      // Add CSRF token to headers if provided
      // Spring Security expects X-XSRF-TOKEN header
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch('http://localhost:8080/user', {
        method: 'POST',
        headers: headers,
        credentials: 'include' // Include cookies for CSRF
        // No body - credentials are in Authorization header
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token || 'authenticated');
      localStorage.setItem('user', JSON.stringify(data.user || { email }));
      
      setIsAuthenticated(true);
      setUser(data.user || { email });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



