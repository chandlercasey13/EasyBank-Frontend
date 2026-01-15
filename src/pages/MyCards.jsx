import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [blockedCards, setBlockedCards] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [activeCardForModal, setActiveCardForModal] = useState(null);
  const [cardAccountMap, setCardAccountMap] = useState({});

  const userName =
    (user && (user.name || user.fullName || user.email)) || 'Cardholder';

  const expiryDate = (() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear() + 2;
    const mm = month.toString().padStart(2, '0');
    const yy = (year % 100).toString().padStart(2, '0');
    return `${mm}/${yy}`;
  })();

  const toggleBlockCard = (cardId) => {
    setBlockedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  useEffect(() => {
    if (!user) return;

    authenticatedFetch('http://localhost:8080/myCards')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch cards data');
        }
        return res.json();
      })
      .then(data => {
        setCards(data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });

    authenticatedFetch('http://localhost:8080/myBalance')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch transactions data');
        }
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setTransactions(list);

        const accountMap = {};
        list.forEach(tx => {
          const accountNumber = tx.accountNumber || tx.account_number || null;
          const cardNumber =
            (tx.card && (tx.card.cardNumber || tx.card.card_number)) ||
            tx.cardNumber ||
            tx.card_number ||
            null;
          if (accountNumber && cardNumber && !accountMap[cardNumber]) {
            accountMap[cardNumber] = accountNumber;
          }
        });
        setCardAccountMap(accountMap);
        setTransactionsLoaded(true);
      })
      .catch(() => {
        setTransactionsLoaded(true);
      });
  }, [user]);

  const openTransactionsModal = (card) => {
    setActiveCardForModal(card);
    setShowTransactionsModal(true);
  };

  const closeTransactionsModal = () => {
    setShowTransactionsModal(false);
    setActiveCardForModal(null);
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cards</h1>
        <p>Manage your debit and credit cards</p>
      </div>
      <div className="page-actions" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn-primary">Request New Card</button>
      </div>
      <div className="cards-grid">
        {cards.map((card, index) => {
          const cardKey = card.id ?? card.cardNumber ?? index;
          const isDebitCard =
            (card.cardType || card.type || '').toLowerCase() === 'debit';
          const cardNumber = card.cardNumber || card.card_number;
          const attachedAccount =
            isDebitCard && cardNumber ? cardAccountMap[cardNumber] : null;
          
          return (
          <div key={cardKey} className="card-display">
            <div className="card-front-wrapper">
              <div className={`card-front ${card.cardType.toLowerCase()} ${blockedCards[cardKey] ? 'blocked' : ''}`}>
                <div className="card-logo">EasyBank</div>
                <div className="card-chip"></div>
                <div className="cardholder-row">
                  <div className="cardholder-name">{userName}</div>
                  {attachedAccount && (
                    <div className="card-account-tag">
                      Acct {attachedAccount}
                    </div>
                  )}
                </div>
                <div className="card-number">{card.cardNumber}</div>
                <div className="card-expiry">{expiryDate}</div>
                <div className="card-type-badge">{card.cardType}</div>
              </div>
              {blockedCards[cardKey] && (
                <div className="card-block-overlay">
                  <span>Blocked</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button
                className="btn-secondary"
                onClick={() => toggleBlockCard(cardKey)}
              >
                {blockedCards[cardKey] ? 'Unblock Card' : 'Block Card'}
              </button>
              <button
                className="btn-secondary"
                disabled={!!blockedCards[cardKey]}
                style={blockedCards[cardKey] ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                onClick={() => !blockedCards[cardKey] && openTransactionsModal(card)}
              >
                View Transactions
              </button>
            </div>
          </div>
        )})}
      </div>
      {showTransactionsModal && activeCardForModal && (
        <div className="modal-overlay" onClick={closeTransactionsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Card Transactions</h2>
              <button className="modal-close" onClick={closeTransactionsModal}>×</button>
            </div>
            <div className="modal-body">
              {(() => {
                const cardNumber =
                  activeCardForModal.cardNumber ??
                  activeCardForModal.card_number ??
                  null;

                const filtered = (transactions || []).filter(tx => {
                  const txCardNumber =
                    (tx.card && (tx.card.cardNumber || tx.card.card_number)) ||
                    tx.cardNumber ||
                    tx.card_number ||
                    null;
                  return (
                    cardNumber &&
                    txCardNumber &&
                    String(txCardNumber) === String(cardNumber)
                  );
                });

                if (!transactionsLoaded) {
                  return <p>Loading transactions...</p>;
                }

                if (filtered.length === 0) {
                  return <p>No transactions found for this card.</p>;
                }

                const sorted = [...filtered].sort((a, b) => {
                  const dateA = new Date(a.transactionDt || a.transaction_dt || 0);
                  const dateB = new Date(b.transactionDt || b.transaction_dt || 0);
                  return dateB - dateA;
                });

                return (
                  <div className="transactions-list">
                    {sorted.map((tx, idx) => {
                      const amount =
                        typeof tx.transactionAmt === 'number'
                          ? tx.transactionAmt
                          : (typeof tx.transaction_amt === 'number'
                            ? tx.transaction_amt
                            : 0);
                      const isDebit =
                        (tx.transactionType || tx.transaction_type || '').toLowerCase() === 'debit';

                      return (
                        <div key={idx} className="transaction-card">
                          <div className="transaction-header">
                            <span
                              className="transaction-amount"
                              style={{ color: isDebit ? '#dc3545' : '#28a745' }}
                            >
                              {isDebit ? '-' : '+'}
                              ${Math.abs(amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span className="transaction-date">
                              {tx.transactionDt || tx.transaction_dt
                                ? new Date(tx.transactionDt || tx.transaction_dt).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          {(tx.transactionSummary || tx.transaction_summary) && (
                            <div className="transaction-summary">
                              {tx.transactionSummary || tx.transaction_summary}
                            </div>
                          )}
                          {((tx.card && (tx.card.cardNumber || tx.card.card_number)) ||
                            tx.cardNumber ||
                            tx.card_number) && (
                            <div className="transaction-meta">
                              Card:{' '}
                              <span className="transaction-card-id">
                                {(tx.card && (tx.card.cardNumber || tx.card.card_number)) ||
                                  tx.cardNumber ||
                                  tx.card_number}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCards;

