import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>EasyBank</h2>
        </Link>
        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to="/myAccount" 
                  className={isActive('/myAccount') ? 'active' : ''}
                >
                  Account
                </Link>
              </li>
              <li>
                <Link 
                  to="/myLoans" 
                  className={isActive('/myLoans') ? 'active' : ''}
                >
                  Loans
                </Link>
              </li>
              <li>
                <Link 
                  to="/myCards" 
                  className={isActive('/myCards') ? 'active' : ''}
                >
                  Cards
                </Link>
              </li>
              <li>
                <Link 
                  to="/notices" 
                  className={isActive('/notices') ? 'active' : ''}
                >
                  Notices
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={isActive('/contact') ? 'active' : ''}
                >
                  Contact
                </Link>
              </li>
              <li className="user-info">
                <span className="user-email">{user?.email || 'User'}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/contact" 
                  className={isActive('/contact') ? 'active' : ''}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={isActive('/login') ? 'active' : ''}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`register-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

