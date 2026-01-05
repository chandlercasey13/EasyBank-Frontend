import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyBalance() {
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch('http://localhost:8080/myBalance')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch balance data');
        }
        return res.json();
      })
      .then(data => {
        setBalanceData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching balance data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Balance</h1>
        <p>View your current account balance</p>
      </div>
      <div className="balance-card">
        <div className="balance-header">
          <h3>Available Balance</h3>
          <p className="balance-amount">
            {balanceData?.currency || 'USD'} {(balanceData?.closing_balance || balanceData?.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="balance-actions">
          <button className="btn-primary">View Transactions</button>
          <button className="btn-secondary">Download Statement</button>
        </div>
      </div>
    </div>
  );
}

export default MyBalance;

