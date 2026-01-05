import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './Page.css';

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch('http://localhost:8080/notices')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch notices');
        }
        return res.json();
      })
      .then(data => {
        setNotices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching notices:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notices</h1>
        <p>Important updates and announcements</p>
      </div>
      <div className="notices-list">
        {notices.length === 0 ? (
          <div className="empty-state">
            <p>No notices at this time</p>
          </div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`notice-card priority-${notice.priority}`}>
              <div className="notice-header">
                <h3>{notice.title}</h3>
                <span className={`priority-badge priority-${notice.priority}`}>
                  {notice.priority.toUpperCase()}
                </span>
              </div>
              <p className="notice-message">{notice.message}</p>
              <div className="notice-footer">
                <span className="notice-date">Posted: {notice.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notices;

