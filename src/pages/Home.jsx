import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Page.css';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>Welcome to EasyBank</h1>
        <p className="hero-subtitle">Your trusted banking partner</p>
        <p className="hero-description">
          Manage your finances with ease. Access your accounts, view balances, 
          manage loans, and stay updated with the latest notices - all in one place.
        </p>
        {!isAuthenticated && (
          <div className="hero-actions">
            <Link to="/register" className="btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Sign In
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="hero-actions">
            <Link to="/myAccount" className="btn-primary btn-large">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
      
      <div className="benefits-section">
        <h2>Why Choose EasyBank?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>
            <h3>Secure Banking</h3>
            <p>Your financial data is protected with bank-level encryption and security measures</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <h3>24/7 Access</h3>
            <p>Manage your accounts anytime, anywhere with our easy-to-use online platform</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">💳</div>
            <h3>Complete Control</h3>
            <p>View balances, track transactions, manage loans and cards all in one place</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access your accounts seamlessly on any device, desktop or mobile</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10M+</div>
            <div className="stat-label">Active Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">$500B+</div>
            <div className="stat-label">Assets Under Management</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Years of Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime Guarantee</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers who trust EasyBank with their financial needs</p>
          {!isAuthenticated && (
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary btn-large">
                Open an Account
              </Link>
              <Link to="/contact" className="btn-secondary btn-large">
                Learn More
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;

