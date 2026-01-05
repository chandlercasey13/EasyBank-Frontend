import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch('http://localhost:8080/myLoans')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch loans data');
        }
        return res.json();
      })
      .then(data => {
        setLoans(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching loans data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Loans</h1>
        <p>Manage your loan accounts</p>
      </div>
      {loans.length === 0 ? (
        <div className="empty-state">
          <p>No active loans found</p>
          <button className="btn-primary">Apply for a Loan</button>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map(loan => (
            <div key={loan.loan_number || loan.loanNumber || loan.id} className="loan-card">
              <div className="loan-header">
                <h3>{loan.loan_type || loan.loanType || 'Loan'}</h3>
                <span className="loan-status">{loan.status || 'Active'}</span>
              </div>
              <div className="loan-details">
                <div className="loan-detail-item">
                  <span className="label">Loan Number:</span>
                  <span className="value">{loan.loan_number || loan.loanNumber || 'N/A'}</span>
                </div>
                <div className="loan-detail-item">
                  <span className="label">Original Amount:</span>
                  <span className="value">${(loan.total_loan || loan.amount || 0).toLocaleString()}</span>
                </div>
                <div className="loan-detail-item">
                  <span className="label">Amount Paid:</span>
                  <span className="value">${(loan.amount_paid || loan.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="loan-detail-item">
                  <span className="label">Outstanding Amount:</span>
                  <span className="value">${(loan.outstanding_amount || loan.outstandingAmount || loan.remainingBalance || 0).toLocaleString()}</span>
                </div>
                {loan.rate && (
                  <div className="loan-detail-item">
                    <span className="label">Interest Rate:</span>
                    <span className="value">{loan.rate}%</span>
                  </div>
                )}
                {loan.payment_date && (
                  <div className="loan-detail-item">
                    <span className="label">Next Payment Due:</span>
                    <span className="value">{loan.payment_date || loan.paymentDate || loan.nextPayment}</span>
                  </div>
                )}
              </div>
              <div className="loan-actions">
                <button className="btn-primary">Make Payment</button>
                <button className="btn-secondary">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyLoans;

