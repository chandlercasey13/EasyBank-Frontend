import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Page.css';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(22, 33, 62, 0.85) 50%, rgba(15, 52, 96, 0.85) 100%)',
        backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"), linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(22, 33, 62, 0.85) 50%, rgba(15, 52, 96, 0.85) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          transform: 'rotate(-45deg)'
        }}></div>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {isAuthenticated ? 'Welcome Back to EasyBank' : 'Boost Your Financial Future With EasyBank'}
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          maxWidth: '800px',
          lineHeight: '1.6',
          opacity: 0.95
        }}>
          {isAuthenticated 
            ? 'Manage your accounts, track your finances, and achieve your goals with our comprehensive banking platform.'
            : 'We\'re Here To Support Your Goals With Secure Banking, Easy Account Management, And 24/7 Access To Your Finances.'}
        </p>
        {!isAuthenticated && (
          <Link 
            to="/register" 
            style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '1rem 2.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ffb300'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
          >
            LEARN MORE
          </Link>
        )}
        {isAuthenticated && (
          <Link 
            to="/myAccount" 
            style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '1rem 2.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ffb300'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
          >
            GO TO DASHBOARD
          </Link>
        )}
      </div>

      {/* How Can We Help Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '4rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#1a1a1a'
        }}>
          How Can We Help?
        </h2>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative'
        }}>
          {/* Lost or Stolen Cards */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '2rem',
            flex: '1',
            minWidth: '250px',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e3c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              Lost or Stolen Cards
            </h3>
            <Link 
              to="/myCards" 
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              GET HELP <span>→</span>
            </Link>
          </div>

          {/* FDIC Insurance */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '2rem',
            flex: '1',
            minWidth: '250px',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e3c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              FDIC Insurance
            </h3>
            <Link 
              to="/contact" 
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              LEARN MORE <span>→</span>
            </Link>
          </div>

          {/* Open an Account */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '2rem',
            flex: '1',
            minWidth: '250px',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e3c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              Open an Account
            </h3>
            <Link 
              to="/register" 
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              GET STARTED <span>→</span>
            </Link>
          </div>

          {/* Customer Service */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '2rem',
            flex: '1',
            minWidth: '250px',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e3c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              Customer Service
            </h3>
            <Link 
              to="/contact" 
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              LEARN MORE <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

