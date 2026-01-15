import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyAccount() {
  const [account, setAccount] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const { user } = useAuth();

  const handleDownloadStatement = () => {
    if (!balanceData || balanceData.length === 0) {
      return;
    }

    const sortedTransactions = [...balanceData].sort((a, b) => {
      const dateA = new Date(a.transactionDt || a.transaction_dt || 0);
      const dateB = new Date(b.transactionDt || b.transaction_dt || 0);
      return dateB - dateA; // newest first
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

    const accountTitle = account
      ? `Account #${account.accountNumber || account.account_number || ''}`
      : 'Account Statement';

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${accountTitle} - Statement</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 24px;
              color: #222;
            }
            h1 {
              font-size: 20px;
              margin-bottom: 4px;
            }
            h2 {
              font-size: 16px;
              margin-top: 0;
              margin-bottom: 16px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 6px 8px;
              font-size: 12px;
            }
            th {
              background: #f5f5f5;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>${accountTitle}</h1>
          <h2>Transaction Statement</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount (USD)</th>
                <th>Closing Balance (USD)</th>
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
    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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

    // Fetch account
    authenticatedFetch('http://localhost:8080/myAccount')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch account data');
        }
        return res.json();
      })
      .then(data => {
        setAccount(data);
        accountLoaded = true;
        checkLoading();
      })
      .catch(error => {
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
      <div className="page-header">
        <h1>My Account</h1>
        <p>View and manage your account information and balance</p>
      </div>
      
      {account && (
        <div className="account-balance-card">
          {balanceData && balanceData.length > 0 && (
            <div className="balance-section">
              <div className="balance-header">
                <h3>Available Balance</h3>
                <p className="balance-amount">
                  USD {(balanceData[0]?.closingBalance || balanceData[0]?.closing_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="balance-actions">
                <button 
                  className="btn-secondary"
                  onClick={handleDownloadStatement}
                >
                  Download Statement
                </button>
              </div>
            </div>
          )}
          
          <div className="account-section">
            <div className="account-header">
              <h3>Account #{account.accountNumber || account.account_number || 'N/A'}</h3>
            </div>
            <div className="account-details">
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
            </div>
          </div>
        </div>
      )}

      {balanceData && balanceData.length > 0 && (() => {
        const sortedTransactions = [...balanceData]
          .sort((a, b) => {
            const dateA = new Date(a.transactionDt || a.transaction_dt || 0);
            const dateB = new Date(b.transactionDt || b.transaction_dt || 0);
            return dateB - dateA; // Sort descending (newest first)
          })
          .filter((transaction, index, sortedArray) => {
            const currentBalance = transaction.closingBalance || transaction.closing_balance || 0;
            const previousTransaction = index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const previousBalance = previousTransaction 
              ? (previousTransaction.closingBalance || previousTransaction.closing_balance || 0)
              : currentBalance;
            const transactionAmount = Math.abs(currentBalance - previousBalance);
            return transactionAmount !== 0;
          });
        
        // Only show a small number of transactions inline to avoid vertical overflow
        const TRANSACTION_OVERFLOW_THRESHOLD = 4;
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
                <h3>Recent Transactions</h3>
                {hasMoreTransactions && (
                  <button 
                    className="see-all-btn"
                    onClick={() => setShowTransactionsModal(true)}
                  >
                    See All
                  </button>
                )}
              </div>
              <div className="transactions-list">
                {displayedTransactions.map((transaction, index) => {
                  return renderTransaction(transaction, index, sortedTransactions);
                })}
              </div>
            </div>
            
            {showTransactionsModal && (
              <div className="modal-overlay" onClick={() => setShowTransactionsModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>All Transactions</h2>
                    <button className="modal-close" onClick={() => setShowTransactionsModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="transactions-list">
                      {sortedTransactions.map((transaction, index) => {
                        return renderTransaction(transaction, index, sortedTransactions);
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {!account && (
        <div className="empty-state">
          <p>No account found</p>
        </div>
      )}
    </div>
  );
}

export default MyAccount;

