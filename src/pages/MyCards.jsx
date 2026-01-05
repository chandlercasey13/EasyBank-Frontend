import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function MyCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('Error fetching cards data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Cards</h1>
        <p>Manage your debit and credit cards</p>
      </div>
      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.id} className="card-display">
            <div className={`card-front ${card.cardType.toLowerCase()}`}>
              <div className="card-chip"></div>
              <div className="card-number">{card.cardNumber}</div>
              <div className="card-info">
                <div className="card-name">{card.cardholderName}</div>
                <div className="card-expiry">{card.expiryDate}</div>
              </div>
              <div className="card-type-badge">{card.cardType}</div>
            </div>
            <div className="card-actions">
              <button className="btn-secondary">Block Card</button>
              <button className="btn-secondary">View Transactions</button>
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

