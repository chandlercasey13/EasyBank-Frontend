import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyAccount() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch('http://localhost:8080/myAccount')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch account data');
        }
        return res.json();
      })
      .then(data => {
        setAccountData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching account data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Account</h1>
        <p>View and manage your account information</p>
      </div>
      <div className="card-grid">
        <div className="info-card">
          <h3>Account Number</h3>
          <p className="value">{accountData?.account_number || accountData?.accountNumber || 'N/A'}</p>
        </div>
        <div className="info-card">
          <h3>Account Type</h3>
          <p className="value">{accountData?.account_type || accountData?.accountType || 'N/A'}</p>
        </div>
        <div className="info-card">
          <h3>Branch Address</h3>
          <p className="value">{accountData?.branch_address || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;

