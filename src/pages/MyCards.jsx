import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [blockedCards, setBlockedCards] = useState({});

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

    // Get id from user object (could be id, customer_id, or customerId)
    // Default to 12 if not found
    const id = user.id || user.customer_id || user.customerId || 12;

    authenticatedFetch(`http://localhost:8080/myCards?id=${id}`)
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
  }, [user]);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cards</h1>
        <p>Manage your debit and credit cards</p>
      </div>
      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.id} className="card-display">
            <div className="card-front-wrapper">
              <div className={`card-front ${card.cardType.toLowerCase()} ${blockedCards[card.id] ? 'blocked' : ''}`}>
                <div className="card-logo">EasyBank</div>
                <div className="card-chip"></div>
                <div className="cardholder-name">{userName}</div>
                <div className="card-number">{card.cardNumber}</div>
                <div className="card-expiry">{expiryDate}</div>
                <div className="card-type-badge">{card.cardType}</div>
              </div>
              {blockedCards[card.id] && (
                <div className="card-block-overlay">
                  <span>Blocked</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button
                className="btn-secondary"
                onClick={() => toggleBlockCard(card.id)}
              >
                {blockedCards[card.id] ? 'Unblock Card' : 'Block Card'}
              </button>
              <button
                className="btn-secondary"
                disabled={!!blockedCards[card.id]}
                style={blockedCards[card.id] ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                View Transactions
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="page-actions">
        <button className="btn-primary">Request New Card</button>
      </div>
    </div>
  );
}

export default MyCards;

