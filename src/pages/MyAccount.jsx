import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyAccount() {
  const [accounts, setAccounts] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountType, setAccountType] = useState('CHECKING');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showLinkCardModal, setShowLinkCardModal] = useState(null);
  const [availableCards, setAvailableCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [transactionsExpanded, setTransactionsExpanded] = useState({});
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let accountLoaded = false;
    let balanceLoaded = false;

    const checkLoading = () => {
      if (accountLoaded) {
        if (user) {
          // If user exists, wait for balance
          if (balanceLoaded) {
            setLoading(false);
          }
        } else {
          // If no user, don't wait for balance
          setLoading(false);
        }
      }
    };

    // Fetch accounts
    authenticatedFetch('http://localhost:8080/myAccount')
      .then(res => {
        if (!res.ok) {
          // If 404 or other error, no accounts exist
          setAccounts([]);
          accountLoaded = true;
          checkLoading();
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data !== undefined) {
          const accountsList = Array.isArray(data) ? data : (data ? [data] : []);
          setAccounts(accountsList);
          // If only one account exists, expand transactions by default
          if (accountsList.length === 1) {
            const accountNumber = accountsList[0].accountNumber || accountsList[0].account_number;
            setTransactionsExpanded({ [accountNumber]: true });
          }
        } else {
          setAccounts([]);
        }
        accountLoaded = true;
        checkLoading();
      })
      .catch(error => {
        setAccounts([]);
        accountLoaded = true;
        checkLoading();
      });

    // Fetch balance if user is available
    if (user) {
      authenticatedFetch(`http://localhost:8080/myBalance`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch balance data');
          }
          return res.json();
        })
        .then(data => {
          // Ensure data is an array (list of transactions)
          const transactionsList = Array.isArray(data) ? data : [];
          setBalanceData(transactionsList);
          balanceLoaded = true;
          checkLoading();
        })
        .catch(error => {
          balanceLoaded = true;
          checkLoading();
        });
    } else {
      // If no user, mark balance as loaded (not needed)
      balanceLoaded = true;
    }
  }, [user]);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>My Account</h1>
          <p>View and manage your account information and balance</p>
        </div>
        {accounts.length > 0 && (
          <div style={{ position: 'absolute', right: 5, top: 10, display: 'flex', alignItems: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => setShowCreateAccountModal(true)}
            >
              Create Account
            </button>
          </div>
        )}
      </div>
      
      {accounts.length > 0 && accounts.map((account) => {
        const accountNumber = account.accountNumber || account.account_number;
        const accountTransactions = balanceData ? balanceData.filter(tx => {
          const txAccountNumber = tx.accountNumber || tx.account_number;
          return txAccountNumber === accountNumber;
        }) : [];
        
        return (
          <div key={accountNumber} className="account-balance-card" style={{ marginBottom: '1.5rem' }}>
            <div className="balance-section">
              <div style={{ position: 'absolute', top: '1rem', left: '2rem', fontSize: '0.9rem', opacity: 0.9 }}>
                Account #{accountNumber || 'N/A'}
              </div>
              <div className="balance-header">
                <h3>Available Balance</h3>
                <p className="balance-amount">
                  USD {(accountTransactions.length > 0 
                    ? (accountTransactions[0]?.closingBalance || accountTransactions[0]?.closing_balance || 0)
                    : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="balance-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    if (accountTransactions.length === 0) {
                      alert('No transactions available to download');
                      return;
                    }
                    const sortedTransactions = [...accountTransactions].sort((a, b) => {
                      const dateA = new Date(a.transactionDt || a.transaction_dt || 0);
                      const dateB = new Date(b.transactionDt || b.transaction_dt || 0);
                      return dateB - dateA;
                    });
                    const rowsHtml = sortedTransactions
                      .map(tx => {
                        const date = tx.transactionDt || tx.transaction_dt
                          ? new Date(tx.transactionDt || tx.transaction_dt).toLocaleDateString()
                          : 'N/A';
                        const description = tx.transactionSummary || tx.transaction_summary || '';
                        const amount = typeof tx.transactionAmt === 'number'
                          ? tx.transactionAmt
                          : (typeof tx.transaction_amt === 'number' ? tx.transaction_amt : 0);
                        const balance = tx.closingBalance || tx.closing_balance || 0;
                        return `
                          <tr>
                            <td>${date}</td>
                            <td>${description}</td>
                            <td style="text-align:right;">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td style="text-align:right;">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        `;
                      })
                      .join('');
                    const html = `
                      <!doctype html>
                      <html>
                        <head>
                          <title>Account Statement - Account #${accountNumber}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #1e3c72; color: white; }
                          </style>
                        </head>
                        <body>
                          <h1>Account Statement</h1>
                          <h2>Account #${accountNumber}</h2>
                          <table>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${rowsHtml}
                            </tbody>
                          </table>
                        </body>
                      </html>
                    `;
                    const printWindow = window.open('', '_blank');
                    printWindow.document.open();
                    printWindow.document.write(html);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }}
                >
                  Download Statement
                </button>
              </div>
            </div>
            
            <div className="account-section">
              <div className="account-details" style={{ position: 'relative' }}>
                <div className="account-detail-item">
                  <span className="label">Account Type:</span>
                  <span className="value">{account.accountType || account.account_type || 'N/A'}</span>
                </div>
                <div className="account-detail-item">
                  <span className="label">Branch Address:</span>
                  <span className="value">{account.branchAddress || account.branch_address || 'N/A'}</span>
                </div>
                {account.createDt && (
                  <div className="account-detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(account.createDt || account.create_dt).toLocaleDateString()}</span>
                  </div>
                )}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <button
                    onClick={() => setShowAccountMenu(prev => ({ ...prev, [accountNumber]: !prev[accountNumber] }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      fontSize: '1.2rem',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onBlur={() => setTimeout(() => setShowAccountMenu(prev => ({ ...prev, [accountNumber]: false })), 200)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                  {showAccountMenu[accountNumber] && (
                    <div className="account-menu-dropdown">
                      <button
                        className="account-menu-item"
                        onClick={async () => {
                          setShowAccountMenu(prev => ({ ...prev, [accountNumber]: false }));
                          setShowLinkCardModal(account);
                          setLoadingCards(true);
                          try {
                            const response = await authenticatedFetch('http://localhost:8080/myCards');
                            if (response.ok) {
                              const cards = await response.json();
                              const accountType = account.accountType || account.account_type || '';
                              const matchingCards = Array.isArray(cards) ? cards.filter(card => {
                                const cardType = (card.cardType || card.card_type || '').toUpperCase();
                                const accType = accountType.toUpperCase();
                                if (accType === 'CHECKING' || accType === 'SAVINGS') {
                                  return cardType === 'DEBIT';
                                }
                                if (accType === 'CREDIT') {
                                  return cardType === 'CREDIT';
                                }
                                return cardType === accType;
                              }) : [];
                              setAvailableCards(matchingCards);
                            }
                          } catch (error) {
                            setAvailableCards([]);
                          } finally {
                            setLoadingCards(false);
                          }
                        }}
                      >
                        Link Card
                      </button>
                      <div className="account-menu-separator"></div>
                      <button
                        className="account-menu-item delete-option"
                        onClick={() => {
                          setShowAccountMenu(prev => ({ ...prev, [accountNumber]: false }));
                          setShowDeleteModal(account);
                        }}
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const sortedTransactions = accountTransactions.length > 0 ? [...accountTransactions]
                .sort((a, b) => {
                  const dateA = new Date(a.transactionDt || a.transaction_dt || 0);
                  const dateB = new Date(b.transactionDt || b.transaction_dt || 0);
                  return dateB - dateA;
                })
                .filter((transaction, index, sortedArray) => {
                  const currentBalance = transaction.closingBalance || transaction.closing_balance || 0;
                  const previousTransaction = index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
                  const previousBalance = previousTransaction 
                    ? (previousTransaction.closingBalance || previousTransaction.closing_balance || 0)
                    : currentBalance;
                  const transactionAmount = Math.abs(currentBalance - previousBalance);
                  return transactionAmount !== 0;
                }) : [];
              
              const TRANSACTION_OVERFLOW_THRESHOLD = 4;
              const isExpanded = transactionsExpanded[accountNumber] || (accounts.length === 1);
              const shouldCollapse = sortedTransactions.length > TRANSACTION_OVERFLOW_THRESHOLD;
              const displayedTransactions = shouldCollapse 
                ? sortedTransactions.slice(0, TRANSACTION_OVERFLOW_THRESHOLD)
                : sortedTransactions;
              const hasMoreTransactions = shouldCollapse;
              
              const renderTransaction = (transaction, index, sortedArray) => {
                const originalIndex = sortedArray.findIndex(t => 
                  (t.transactionId || t.transaction_id) === (transaction.transactionId || transaction.transaction_id)
                );
                const currentBalance = transaction.closingBalance || transaction.closing_balance || 0;
                const previousTransaction = originalIndex < sortedArray.length - 1 ? sortedArray[originalIndex + 1] : null;
                const previousBalance = previousTransaction 
                  ? (previousTransaction.closingBalance || previousTransaction.closing_balance || 0)
                  : currentBalance;
                const isDebit = currentBalance < previousBalance;
                const transactionAmount = Math.abs(currentBalance - previousBalance);
                const cardNumber =
                  (transaction.card && (transaction.card.cardNumber || transaction.card.card_number)) ||
                  transaction.cardNumber ||
                  transaction.card_number ||
                  null;
                
                return (
                  <div key={originalIndex} className="transaction-card">
                    <div className="transaction-header">
                      <span
                        className="transaction-amount"
                        style={{
                          color: isDebit ? '#dc3545' : '#28a745',
                        }}
                      >
                        {isDebit ? '-' : '+'}
                        $
                        {transactionAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <div className="transaction-header-right">
                        {cardNumber && (
                          <div className="transaction-card-number">
                            Card Number: {cardNumber}
                          </div>
                        )}
                        <span className="transaction-date">
                          {transaction.transactionDt || transaction.transaction_dt
                            ? new Date(
                                transaction.transactionDt ||
                                  transaction.transaction_dt
                              ).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {(transaction.transactionSummary || transaction.transaction_summary) && (
                      <div className="transaction-summary">
                        {transaction.transactionSummary || transaction.transaction_summary}
                      </div>
                    )}
                    <div className="transaction-balance">
                      Balance: ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              };
              
              return (
                <>
                  <div className="transactions-section">
                    <div className="transactions-header">
                      <h3>Transactions</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="see-all-btn"
                          onClick={() => setTransactionsExpanded(prev => ({ ...prev, [accountNumber]: !prev[accountNumber] }))}
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                        <button 
                          className="see-all-btn"
                          onClick={() => setShowTransactionsModal({ accountNumber, transactions: sortedTransactions })}
                        >
                          See All
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="transactions-list">
                        {sortedTransactions.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            No transactions
                          </div>
                        ) : (
                          displayedTransactions.map((transaction, index) => {
                            return renderTransaction(transaction, index, sortedTransactions);
                          })
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        );
      })}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete Account #{showDeleteModal.accountNumber || showDeleteModal.account_number || 'N/A'}? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  setDeletingAccount(true);
                  try {
                    const accountNumber = showDeleteModal.accountNumber || showDeleteModal.account_number;
                    const response = await authenticatedFetch(`http://localhost:8080/myAccount?accountNumber=${accountNumber}`, {
                      method: 'DELETE'
                    });
                    if (response.ok) {
                      setAccounts(prev => prev.filter(acc => (acc.accountNumber || acc.account_number) !== accountNumber));
                      setShowDeleteModal(null);
                    } else {
                      alert('Failed to delete account');
                    }
                  } catch (error) {
                    alert('Error deleting account');
                  } finally {
                    setDeletingAccount(false);
                  }
                }}
                disabled={deletingAccount}
                style={{ 
                  backgroundColor: '#dc3545', 
                  borderColor: '#dc3545'
                }}
              >
                {deletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkCardModal && (
        <div className="modal-overlay" onClick={() => setShowLinkCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Link Card to Account</h2>
              <button className="modal-close" onClick={() => setShowLinkCardModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Select a {(() => {
                  const accType = (showLinkCardModal.accountType || showLinkCardModal.account_type || '').toUpperCase();
                  if (accType === 'CHECKING' || accType === 'SAVINGS') {
                    return 'DEBIT';
                  }
                  return accType;
                })()} card to link to Account #{showLinkCardModal.accountNumber || showLinkCardModal.account_number || 'N/A'}
              </p>
              {loadingCards ? (
                <p>Loading cards...</p>
              ) : availableCards.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                  No {(() => {
                    const accType = (showLinkCardModal.accountType || showLinkCardModal.account_type || '').toUpperCase();
                    if (accType === 'CHECKING' || accType === 'SAVINGS') {
                      return 'DEBIT';
                    }
                    return accType;
                  })()} cards available to link.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableCards.map((card, index) => {
                    const cardKey = card.id ?? card.cardNumber ?? index;
                    return (
                      <button
                        key={cardKey}
                        className="btn-secondary"
                        onClick={async () => {
                          // TODO: Implement actual linking API call
                          alert(`Linking card ${card.cardNumber || card.card_number || 'N/A'} to account...`);
                          setShowLinkCardModal(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {card.cardType || card.card_type || 'Card'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            •••• {String(card.cardNumber || card.card_number || '').slice(-4)}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: '#1e3c72' }}>→</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowLinkCardModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionsModal && (
        <div className="modal-overlay" onClick={() => setShowTransactionsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Transactions - Account #{showTransactionsModal.accountNumber}</h2>
              <button className="modal-close" onClick={() => setShowTransactionsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {showTransactionsModal.transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No transactions
                </div>
              ) : (
                <div className="transactions-list">
                  {showTransactionsModal.transactions.map((transaction, index) => {
                    const currentBalance = transaction.closingBalance || transaction.closing_balance || 0;
                    const previousTransaction = index < showTransactionsModal.transactions.length - 1 ? showTransactionsModal.transactions[index + 1] : null;
                    const previousBalance = previousTransaction 
                      ? (previousTransaction.closingBalance || previousTransaction.closing_balance || 0)
                      : currentBalance;
                    const isDebit = currentBalance < previousBalance;
                    const transactionAmount = Math.abs(currentBalance - previousBalance);
                    const cardNumber =
                      (transaction.card && (transaction.card.cardNumber || transaction.card.card_number)) ||
                      transaction.cardNumber ||
                      transaction.card_number ||
                      null;
                    return (
                      <div key={index} className="transaction-card" style={{ borderLeft: 'none' }}>
                        <div className="transaction-header">
                          <span
                            className="transaction-amount"
                            style={{
                              color: isDebit ? '#dc3545' : '#28a745',
                            }}
                          >
                            {isDebit ? '-' : '+'}
                            $
                            {transactionAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <div className="transaction-header-right">
                            {cardNumber && (
                              <div className="transaction-card-number">
                                Card Number: {cardNumber}
                              </div>
                            )}
                            <span className="transaction-date">
                              {transaction.transactionDt || transaction.transaction_dt
                                ? new Date(
                                    transaction.transactionDt ||
                                      transaction.transaction_dt
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                        {(transaction.transactionSummary || transaction.transaction_summary) && (
                          <div className="transaction-summary">
                            {transaction.transactionSummary || transaction.transaction_summary}
                          </div>
                        )}
                        <div className="transaction-balance">
                          Balance: ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="empty-state">
          <p>No account found</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateAccountModal(true)}
            style={{ marginTop: '1rem' }}
          >
            Create Account
          </button>
        </div>
      )}

      {showCreateAccountModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAccountModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Create New Account</h2>
              <button className="modal-close" onClick={() => setShowCreateAccountModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label htmlFor="modalAccountType" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Account Type:</label>
                  <select
                    id="modalAccountType"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontSize: '0.9rem'
                    }}
                    disabled={creatingAccount}
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateAccountModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  setCreatingAccount(true);
                  try {
                    const response = await authenticatedFetch('http://localhost:8080/myAccount', {
                      method: 'POST',
                      body: JSON.stringify({ accountType })
                    });
                    if (response.ok) {
                      const newAccount = await response.json();
                      setAccounts(prev => [...prev, newAccount]);
                      const accountNumber = newAccount.accountNumber || newAccount.account_number;
                      if (accounts.length === 0) {
                        setTransactionsExpanded({ [accountNumber]: true });
                      }
                      setShowCreateAccountModal(false);
                    } else {
                      alert('Failed to create account');
                    }
                  } catch (error) {
                    alert('Error creating account');
                  } finally {
                    setCreatingAccount(false);
                  }
                }}
                disabled={creatingAccount}
              >
                {creatingAccount ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAccount;

