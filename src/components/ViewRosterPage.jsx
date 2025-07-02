import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { getLiveRoster } from '../utils/firestoreEvents';

const ViewRosterPage = () => {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper function to safely handle equipment data (both array and string formats)
  const safeGetEquipmentItems = (equipment) => {
    if (!equipment) return [];
    if (Array.isArray(equipment)) return equipment.filter(item => item && item.trim());
    if (typeof equipment === 'string') return equipment.split('/').map(item => item.trim()).filter(item => item);
    return [];
  };

  // Fetch live roster data
  useEffect(() => {
    const fetchLiveRoster = async () => {
      try {
        const data = await getLiveRoster();
        setRoster(data);
      } catch (error) {
        console.error('Failed to fetch live roster:', error);
        setError('Failed to load live roster data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRoster();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
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

  const totalPositions = roster?.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0;
  const filledPositions = roster?.parties?.reduce((total, party) => 
    total + (party.positions?.filter(pos => pos.signedUpUser).length || 0), 0) || 0;
  const totalParties = roster?.parties?.length || 0;

  if (loading) {
    return (
      <div className="view-roster-page">
        <UserProfile />
        <div className="view-roster-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading live roster...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-roster-page">
        <UserProfile />
        <div className="view-roster-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!roster) {
    return (
      <div className="view-roster-page">
        <UserProfile />
        <div className="view-roster-content">
          <div className="no-roster-container">
            <h2>No Live Roster Available</h2>
            <p>There is currently no active roster to display.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-roster-page">
      <UserProfile />
      
      <div className="view-roster-content">
        <div className="signup-section">
          <button className="signup-btn">
            Sign Up for Event
          </button>
        </div>

        <div className="view-roster-header">
          <h1 className="roster-title">{roster.eventName || 'No Event Name'}</h1>
        </div>

        <div className="roster-details">
          <div className="detail-item">
            <span className="detail-label">Total Parties:</span>
            <span className="detail-value">{totalParties}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Players:</span>
            <span className="detail-value">{filledPositions}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Available Positions:</span>
            <span className="detail-value">{totalPositions - filledPositions}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Author:</span>
            <span className="detail-value">{roster.author || 'Unknown'}</span>
          </div>
        </div>

        <div className="roster-container">
          {roster.parties && roster.parties.length > 0 ? (
            roster.parties.map((party, partyIndex) => (
              <div key={partyIndex} className="party-section">
                <div className="party-header">
                  <h2 className="party-name">{party.partyName || `Party ${partyIndex + 1}`}</h2>
                  {party.partyNotes && (
                    <p className="party-notes">{party.partyNotes}</p>
                  )}
                </div>
                
                <table className="view-roster-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Weapon</th>
                      <th>Head</th>
                      <th>Chest</th>
                      <th>Boots</th>
                      <th>Player</th>
                      <th>Build Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {party.positions && party.positions.length > 0 ? (
                      party.positions.map((position, posIndex) => (
                        <tr key={`${partyIndex}-${posIndex}`} className={`position-row ${position.signedUpUser ? 'filled' : 'empty'}`}>
                          <td className="position-role">{position.role || ''}</td>
                          <td className="position-weapon">{position.weapon || ''}</td>
                          <td className="position-equipment">
                            {safeGetEquipmentItems(position.head).length > 0 ? (
                              <div className="equipment-items">
                                {safeGetEquipmentItems(position.head).map((item, index) => (
                                  <div key={index} className="equipment-item">{item}</div>
                                ))}
                              </div>
                            ) : ''}
                          </td>
                          <td className="position-equipment">
                            {safeGetEquipmentItems(position.chest).length > 0 ? (
                              <div className="equipment-items">
                                {safeGetEquipmentItems(position.chest).map((item, index) => (
                                  <div key={index} className="equipment-item">{item}</div>
                                ))}
                              </div>
                            ) : ''}
                          </td>
                          <td className="position-equipment">
                            {safeGetEquipmentItems(position.boots).length > 0 ? (
                              <div className="equipment-items">
                                {safeGetEquipmentItems(position.boots).map((item, index) => (
                                  <div key={index} className="equipment-item">{item}</div>
                                ))}
                              </div>
                            ) : ''}
                          </td>
                          <td className="position-player">
                            {position.signedUpUser ? (
                              <span className="player-name">{position.signedUpUser}</span>
                            ) : (
                              <span className="empty-slot">Available</span>
                            )}
                          </td>
                          <td className="position-build-notes">{position.buildNotes || ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-positions">No positions defined for this party</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="no-parties">
              <h2>No Parties Found</h2>
              <p>This roster doesn't have any parties defined.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRosterPage;
