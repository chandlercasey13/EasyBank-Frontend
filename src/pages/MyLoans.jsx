import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch, apiUrl } from '../utils/api';
import './Page.css';

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentSourceType, setPaymentSourceType] = useState('ACCOUNT');
  const [cards, setCards] = useState([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    authenticatedFetch(apiUrl('myLoans'))
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
        setLoading(false);
      });
  }, [user]);

  const openPaymentModal = (loan) => {
    setSelectedLoan(loan);
    setPaymentSourceType('ACCOUNT');
    setSelectedCardId('');
    setShowPaymentModal(true);

    // Lazy-load cards for payment source selection
    if (!cardsLoaded && user) {
      authenticatedFetch(apiUrl('myCards'))
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch cards data');
          }
          return res.json();
        })
        .then(data => {
          setCards(Array.isArray(data) ? data : []);
          setCardsLoaded(true);
        })
        .catch(() => {
          setCardsLoaded(true);
        });
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleConfirmPayment = () => {
    // UI-only mock: close the modal and show confirmation notice
    setShowPaymentModal(false);
    setPaymentNotice('Payment submitted. It may take 1–2 business days to be reflected on your loan.');

    // Auto-clear the notice after a short delay
    setTimeout(() => {
      setPaymentNotice('');
    }, 5000);
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Loans</h1>
        <p>Manage your loan accounts</p>
      </div>
      {paymentNotice && (
        <div className="page-notice success">
          {paymentNotice}
        </div>
      )}
      {loans.length === 0 ? (
        <div className="empty-state">
          <p>No active loans found</p>
          <button className="btn-primary">Apply for a Loan</button>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map(loan => {
            const amountPaid =
              Number(loan.amount_paid ?? loan.amountPaid ?? 0) || 0;
            const outstanding =
              Number(
                loan.outstanding_amount ??
                  loan.outstandingAmount ??
                  loan.remainingBalance ??
                  0
              ) || 0;
            const originalAmount = amountPaid + outstanding;

            return (
              <div
                key={loan.loan_number || loan.loanNumber || loan.id}
                className="loan-card"
              >
                <div className="loan-header">
                  <h3>{loan.loan_type || loan.loanType || 'Loan'}</h3>
                  <span className="loan-status">{loan.status || 'Active'}</span>
                </div>
                <div className="loan-details">
                  <div className="loan-detail-item">
                    <span className="label">Loan Number:</span>
                    <span className="value">
                      {loan.loan_number || loan.loanNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="loan-detail-item">
                    <span className="label">Original Amount:</span>
                    <span className="value">
                      ${originalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="loan-detail-item">
                    <span className="label">Amount Paid:</span>
                    <span className="value">
                      ${amountPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="loan-detail-item">
                    <span className="label">Outstanding Amount:</span>
                    <span className="value">
                      ${outstanding.toLocaleString()}
                    </span>
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
                      <span className="value">
                        {loan.payment_date ||
                          loan.paymentDate ||
                          loan.nextPayment}
                      </span>
                    </div>
                  )}
                </div>
                <div className="loan-actions">
                  <button
                    className="btn-primary"
                    onClick={() => openPaymentModal(loan)}
                  >
                    Make Payment
                  </button>
                  <button className="btn-secondary">View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPaymentModal && selectedLoan && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Make Payment</h2>
              <button className="modal-close" onClick={closePaymentModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="loan-summary-row">
                <div>
                  <div className="label">Loan</div>
                  <div className="value">
                    {selectedLoan.loan_type || selectedLoan.loanType || 'Loan'} ·{' '}
                    {selectedLoan.loan_number || selectedLoan.loanNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="label">Outstanding</div>
                  <div className="value">
                    ${(selectedLoan.outstanding_amount || selectedLoan.outstandingAmount || selectedLoan.remainingBalance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="payment-source-section">
                <h3>Select payment source</h3>
                <div className="payment-source-options">
                  <label className={`payment-source-option ${paymentSourceType === 'ACCOUNT' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentSourceType"
                      value="ACCOUNT"
                      checked={paymentSourceType === 'ACCOUNT'}
                      onChange={() => setPaymentSourceType('ACCOUNT')}
                    />
                    <div className="payment-source-label">
                      <span className="source-title">EasyBank Account</span>
                      <span className="source-subtitle">Pay directly from your primary account</span>
                    </div>
                  </label>

                  <label className={`payment-source-option ${paymentSourceType === 'CARD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentSourceType"
                      value="CARD"
                      checked={paymentSourceType === 'CARD'}
                      onChange={() => setPaymentSourceType('CARD')}
                    />
                    <div className="payment-source-label">
                      <span className="source-title">Debit Card</span>
                      <span className="source-subtitle">Use any non-credit EasyBank card</span>
                    </div>
                  </label>
                </div>

                {paymentSourceType === 'CARD' && (
                  <div className="card-select-row">
                    <label className="label" htmlFor="card-select">Select card</label>
                    <select
                      id="card-select"
                      className="input"
                      value={selectedCardId}
                      onChange={e => setSelectedCardId(e.target.value)}
                    >
                      <option value="">Choose a debit card</option>
                      {cards
                        .filter(card => {
                          const type = (card.cardType || card.type || '').toLowerCase();
                          return type && type !== 'credit';
                        })
                        .map(card => {
                          const last4 = String(card.cardNumber || '').slice(-4);
                          const label = `${card.cardType || 'Card'} •••• ${last4 || '????'}`;
                          const value = card.id ?? card.cardNumber ?? label;
                          return (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          );
                        })}
                    </select>
                    {cardsLoaded && cards.filter(card => (card.cardType || card.type || '').toLowerCase() !== 'credit').length === 0 && (
                      <p className="helper-text">No eligible debit cards found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closePaymentModal}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleConfirmPayment}
                disabled={paymentSourceType === 'CARD' && !selectedCardId}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLoans;

