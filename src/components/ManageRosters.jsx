import React, { useState, useEffect } from 'react';
import { getRosters } from '../utils/firestoreEvents';

const ManageRosters = ({ onBack }) => {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRosters = async () => {
      try {
        setLoading(true);
        const rosterData = await getRosters();
        setRosters(rosterData);
      } catch (err) {
        console.error('Failed to fetch rosters:', err);
        setError('Failed to load rosters: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRosters();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRosterClick = (roster) => {
    // TODO: Open roster details/edit view
    console.log('Selected roster:', roster);
  };

  if (loading) {
    return (
      <div className="manage-rosters">
        <div className="manage-rosters-header">
          <button onClick={onBack} className="back-button">← Back to Admin</button>
          <h2>Manage Rosters</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rosters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-rosters">
        <div className="manage-rosters-header">
          <button onClick={onBack} className="back-button">← Back to Admin</button>
          <h2>Manage Rosters</h2>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-rosters">
      <div className="manage-rosters-header">
        <button onClick={onBack} className="back-button">← Back to Admin</button>
        <h2>Manage Rosters</h2>
        <p className="roster-count">{rosters.length} roster{rosters.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="rosters-grid">
        {rosters.length === 0 ? (
          <div className="no-rosters">
            <p>No rosters found in the database.</p>
          </div>
        ) : (
          rosters.map((roster) => (
            <button
              key={roster.id}
              className="roster-card"
              onClick={() => handleRosterClick(roster)}
            >
              <div className="roster-card-header">
                <h3 className="roster-event-name">{roster.eventName || 'Untitled Event'}</h3>
                <span className="roster-date">{formatDate(roster.createdAt)}</span>
              </div>
              <div className="roster-card-body">
                <p className="roster-author">
                  <strong>Author:</strong> {roster.author || 'Unknown'}
                </p>
                {roster.eventDescription && (
                  <p className="roster-description">{roster.eventDescription}</p>
                )}
                <div className="roster-stats">
                  <span className="party-count">
                    {roster.parties?.length || 0} partie{roster.parties?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="position-count">
                    {roster.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0} positions
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageRosters;
