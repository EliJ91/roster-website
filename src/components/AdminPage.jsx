import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import ManageRosters from './ManageRosters';
import SelectPlayers from './SelectPlayers';

const AdminPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'manage-rosters', or 'select-players'

  // Check if user is elevated/admin
  const ELEVATED_ROLE_ID = process.env.REACT_APP_ELEVATED_ROLE_ID;
  const isElevated = currentUser?.guildRoles && ELEVATED_ROLE_ID && currentUser.guildRoles.includes(ELEVATED_ROLE_ID);

  // Redirect non-admin users
  React.useEffect(() => {
    if (!currentUser || !isElevated) {
      navigate('/');
    }
  }, [currentUser, isElevated, navigate]);

  if (!currentUser || !isElevated) {
    return null; // Will redirect
  }

  const handleManageRosters = () => {
    setCurrentView('manage-rosters');
  };

  const handleSelectPlayers = () => {
    setCurrentView('select-players');
  };

  const handleCreateRoster = () => {
    navigate('/create-roster');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="admin-page">
      <div className="user-profile-bar">
        <UserProfile />
      </div>
      
      <div className="admin-content">
        {currentView === 'dashboard' ? (
          <>
            <div className="admin-header">
              <h1 className="admin-heading">Admin Dashboard</h1>
              <p className="admin-subtitle">Manage rosters and server settings</p>
            </div>

            <div className="admin-blocks-container">
              <div className="admin-block">
                <div className="admin-block-icon">📋</div>
                <h3 className="admin-block-title">Manage Rosters</h3>
                <p className="admin-block-description">View, edit, and delete existing rosters</p>
                <button className="admin-block-button" onClick={handleManageRosters}>
                  Open
                </button>
              </div>

              <div className="admin-block">
                <div className="admin-block-icon">➕</div>
                <h3 className="admin-block-title">Create Roster</h3>
                <p className="admin-block-description">Create a new roster for upcoming events</p>
                <button className="admin-block-button" onClick={handleCreateRoster}>
                  Create
                </button>
              </div>

              <div className="admin-block">
                <div className="admin-block-icon">👥</div>
                <h3 className="admin-block-title">Select Players</h3>
                <p className="admin-block-description">Player selection tool for roster management</p>
                <button className="admin-block-button" onClick={handleSelectPlayers}>
                  Open
                </button>
              </div>

              <div className="admin-block">
                <div className="admin-block-icon">📊</div>
                <h3 className="admin-block-title">Analytics</h3>
                <p className="admin-block-description">View usage statistics and reports</p>
                <button className="admin-block-button" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </>
        ) : currentView === 'manage-rosters' ? (
          <ManageRosters onBack={handleBackToDashboard} />
        ) : (
          <SelectPlayers onBack={handleBackToDashboard} />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
