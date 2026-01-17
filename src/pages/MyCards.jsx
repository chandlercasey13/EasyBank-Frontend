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
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [creatingCard, setCreatingCard] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState({});
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(null);
  const [deletingCard, setDeletingCard] = useState(false);

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

  // Generate a consistent random color for each card based on its unique identifier
  const getCardColor = (cardId) => {
    // Use a simple hash function to generate consistent colors
    let hash = 0;
    const str = String(cardId);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate HSL color with good saturation and lightness for gradients
    const hue = Math.abs(hash) % 360;
    const saturation = 50 + (Math.abs(hash) % 30); // 50-80%
    const lightness = 35 + (Math.abs(hash) % 15); // 35-50%
    
    // Create gradient colors
    const light1 = lightness;
    const light2 = lightness + 10;
    
    return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${light1}%) 0%, hsl(${hue}, ${saturation}%, ${light2}%) 100%)`;
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
        <button className="btn-primary" onClick={() => {
          setShowAddCardModal(true);
          setLoadingAccounts(true);
          setSelectedAccount(null);
          // Fetch accounts when opening modal
          authenticatedFetch('http://localhost:8080/myAccount')
            .then(res => {
              if (!res.ok) {
                setAccounts([]);
                setLoadingAccounts(false);
                return;
              }
              return res.json();
            })
            .then(data => {
              if (data !== undefined) {
                const accountsList = Array.isArray(data) ? data : (data ? [data] : []);
                setAccounts(accountsList);
              } else {
                setAccounts([]);
              }
              setLoadingAccounts(false);
            })
            .catch(() => {
              setAccounts([]);
              setLoadingAccounts(false);
            });
        }}>Add New Card</button>
      </div>
      <div className="cards-grid">
        {cards.map((card, index) => {
          const cardKey = card.id ?? card.cardNumber ?? index;
          const isDebitCard =
            (card.cardType || card.type || '').toLowerCase() === 'debit';
          const cardNumber = card.cardNumber || card.card_number;
          const attachedAccount =
            isDebitCard && cardNumber ? cardAccountMap[cardNumber] : null;
          // Get account number from card object first, then fall back to attachedAccount from transactions
          const accountNumber = card.accountNumber || card.account_number || attachedAccount;
          
          return (
          <div key={cardKey} className="card-display" style={{ position: 'relative' }}>
            <div className="card-front-wrapper">
              <div 
                className={`card-front ${card.cardType.toLowerCase()} ${blockedCards[cardKey] ? 'blocked' : ''}`}
                style={{ background: getCardColor(cardKey) }}
              >
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowCardMenu(prev => ({ ...prev, [cardKey]: !prev[cardKey] }))}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '1.2rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                      }}
                      onBlur={() => setTimeout(() => setShowCardMenu(prev => ({ ...prev, [cardKey]: false })), 200)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                    {showCardMenu[cardKey] && (
                      <div className="account-menu-dropdown" style={{ right: 0, left: 'auto' }}>
                        <button
                          className="account-menu-item delete-option"
                          onClick={() => {
                            setShowCardMenu(prev => ({ ...prev, [cardKey]: false }));
                            setShowDeleteCardModal(card);
                          }}
                        >
                          Delete Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-logo">EasyBank</div>
                <div className="card-chip"></div>
                <div className="cardholder-row">
                  <div className="cardholder-name">{userName}</div>
                  {accountNumber && (
                    <div className="card-account-tag">
                      Acct {accountNumber}
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
                      const currentBalance = tx.closingBalance || tx.closing_balance || 0;
                      const previousTransaction = idx < sorted.length - 1 ? sorted[idx + 1] : null;
                      const previousBalance = previousTransaction 
                        ? (previousTransaction.closingBalance || previousTransaction.closing_balance || 0)
                        : currentBalance;
                      const isDebit = currentBalance < previousBalance;
                      const transactionAmount = Math.abs(currentBalance - previousBalance);

                      return (
                        <div key={idx} className="transaction-card">
                          <div className="transaction-header">
                            <span
                              className="transaction-amount"
                              style={{ color: isDebit ? '#dc3545' : '#28a745' }}
                            >
                              {isDebit ? '-' : '+'}
                              $
                              {transactionAmount.toLocaleString('en-US', {
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

      {showAddCardModal && (
        <div className="modal-overlay" onClick={() => setShowAddCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add New Card</h2>
              <button className="modal-close" onClick={() => setShowAddCardModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="accountSelect" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                    Link to Account:
                  </label>
                  {loadingAccounts ? (
                    <p style={{ color: '#666', padding: '0.75rem' }}>Loading accounts...</p>
                  ) : (
                    <select
                      id="accountSelect"
                      value={selectedAccount || ''}
                      onChange={(e) => {
                        setSelectedAccount(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '0.9rem'
                      }}
                      disabled={creatingCard || loadingAccounts}
                    >
                      <option value="">Select an account...</option>
                      {accounts.map((account) => {
                        const accountNumber = account.accountNumber || account.account_number;
                        const accountType = account.accountType || account.account_type || 'N/A';
                        return (
                          <option key={accountNumber} value={accountNumber}>
                            Account #{accountNumber} - {accountType}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAddCardModal(false);
                  setSelectedAccount(null);
                }}
                disabled={creatingCard}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  if (!selectedAccount) {
                    alert('Please select an account');
                    return;
                  }
                  
                  // Find the selected account to determine accountType
                  const account = accounts.find(acc => {
                    const accNumber = acc.accountNumber || acc.account_number;
                    return String(accNumber) === String(selectedAccount);
                  });
                  
                  if (!account) {
                    alert('Selected account not found');
                    return;
                  }
                  
                  // Determine cardType based on account type
                  const accType = (account.accountType || account.account_type || '').toUpperCase();
                  let cardType = 'CREDIT';
                  if (accType === 'CHECKING' || accType === 'SAVINGS') {
                    cardType = 'DEBIT';
                  }
                  
                  setCreatingCard(true);
                  try {
                    const response = await authenticatedFetch('http://localhost:8080/myCards', {
                      method: 'POST',
                      body: JSON.stringify({
                        cardType: cardType,
                        accountNumber: selectedAccount
                      })
                    });
                    if (response.ok) {
                      const newCard = await response.json();
                      setCards(prev => [...prev, newCard]);
                      setShowAddCardModal(false);
                      setSelectedAccount(null);
                    } else {
                      alert('Failed to create card');
                    }
                  } catch (error) {
                    alert('Error creating card');
                  } finally {
                    setCreatingCard(false);
                  }
                }}
                disabled={!selectedAccount || creatingCard || loadingAccounts}
              >
                {creatingCard ? 'Creating Card...' : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteCardModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteCardModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Delete Card</h2>
              <button className="modal-close" onClick={() => setShowDeleteCardModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this card? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteCardModal(null)}
                disabled={deletingCard}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  setDeletingCard(true);
                  try {
                    const cardId = showDeleteCardModal.cardId || showDeleteCardModal.id || showDeleteCardModal.cardNumber || showDeleteCardModal.card_number;
                    const response = await authenticatedFetch(`http://localhost:8080/myCards?cardId=${cardId}`, {
                      method: 'DELETE'
                    });
                    if (response.ok) {
                      setCards(prev => prev.filter(c => {
                        const cId = c.cardId || c.id || c.cardNumber || c.card_number;
                        return String(cId) !== String(cardId);
                      }));
                      setShowDeleteCardModal(null);
                    } else {
                      alert('Failed to delete card');
                    }
                  } catch (error) {
                    alert('Error deleting card');
                  } finally {
                    setDeletingCard(false);
                  }
                }}
                disabled={deletingCard}
                style={{ 
                  backgroundColor: '#dc3545', 
                  borderColor: '#dc3545'
                }}
              >
                {deletingCard ? 'Deleting...' : 'Delete Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCards;

