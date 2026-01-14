import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (check sessionStorage for JWT)
    const token = sessionStorage.getItem('jwt');
    const userData = sessionStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, csrfToken) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add CSRF token to headers if provided
      // Spring Security expects X-XSRF-TOKEN header
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch('http://localhost:8080/apiLogin', {
        method: 'POST',
        headers: headers,
        credentials: 'include', // Include cookies for CSRF
        body: JSON.stringify({
          username: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store JWT in sessionStorage and user data
      const jwt = data.jwtToken;
      if (jwt) {
        // Remove 'Bearer ' prefix if present
        const jwtWithoutBearer = jwt.startsWith('Bearer ') ? jwt.substring(7) : jwt;
        sessionStorage.setItem('jwt', jwtWithoutBearer);
        console.log('JWT set in sessionStorage:', jwtWithoutBearer);
      }
      sessionStorage.setItem('user', JSON.stringify(data.user || { email }));
      
      setIsAuthenticated(true);
      setUser(data.user || { email });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
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



