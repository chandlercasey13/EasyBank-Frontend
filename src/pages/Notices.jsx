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
        // Ensure data is an array (list of notices)
        const noticesList = Array.isArray(data) ? data : [];
        setNotices(noticesList);
        setLoading(false);
      })
      .catch(error => {
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
            <div key={notice.noticeId || notice.id} className="notice-card">
              <div className="notice-header">
                <h3>{notice.noticeSummary || notice.notice_summary}</h3>
              </div>
              <p className="notice-message">{notice.noticeDetails || notice.notice_details}</p>
              <div className="notice-footer">
                <span className="notice-date">
                  Start Date: {notice.noticBegDt || notice.notic_beg_dt ? new Date(notice.noticBegDt || notice.notic_beg_dt).toLocaleDateString() : 'N/A'}
                  {(notice.noticEndDt || notice.notic_end_dt) && (
                    <> | End Date: {new Date(notice.noticEndDt || notice.notic_end_dt).toLocaleDateString()}</>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notices;

