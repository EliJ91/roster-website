import React, { useState, useEffect } from 'react';
import { buildDetails } from '../data/weaponOptions';
import { ROLE_OPTIONS, WEAPON_OPTIONS_BY_ROLE } from '../data/rosterOptions';

// Discord role ID that represents the guild
const GUILD_ROLE_ID = '663082455422468096';
const GUILD_NAME = 'Conflict';

const SignupModal = ({ open, onClose, rosterId }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    guildName: '',
    hasGuildRole: false
  });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedWeaponsByRole, setSelectedWeaponsByRole] = useState({});
  const [showBuild, setShowBuild] = useState(null); // weapon name or null
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Load user info from localStorage if available
  useEffect(() => {
    if (open) {
      try {
        const user = JSON.parse(localStorage.getItem('discordUser'));
        const roles = JSON.parse(localStorage.getItem('discordRoles') || '[]');
        
        if (user) {
          // Check if user has the specific guild role ID
          const hasGuildRole = Array.isArray(roles) && roles.includes(GUILD_ROLE_ID);
          
          setUserInfo({
            name: user.nickname || user.displayName || user.username || '',
            guildName: GUILD_NAME,
            hasGuildRole: hasGuildRole
          });
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      }
      
      // Reset form when modal opens
      setSelectedRoles([]);
      setSelectedWeaponsByRole({});
      setSubmitError('');
      setSubmitSuccess(false);
    }
  }, [open]);

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      const isSelected = prev.includes(role);
      if (isSelected) {
        // If deselecting a role, remove all weapon selections for that role
        setSelectedWeaponsByRole(prevWeapons => {
          const updatedWeapons = { ...prevWeapons };
          delete updatedWeapons[role];
          return updatedWeapons;
        });
        return prev.filter(r => r !== role);
      } else {
        // If selecting a role, initialize its weapons array if not exists
        setSelectedWeaponsByRole(prevWeapons => ({
          ...prevWeapons,
          [role]: prevWeapons[role] || []
        }));
        return [...prev, role];
      }
    });
  };

  const handleWeaponToggle = (role, weapon) => {
    setSelectedWeaponsByRole(prev => {
      const roleWeapons = prev[role] || [];
      const isSelected = roleWeapons.includes(weapon);
      
      const updatedWeapons = {
        ...prev,
        [role]: isSelected
          ? roleWeapons.filter(w => w !== weapon)
          : [...roleWeapons, weapon]
      };
      
      return updatedWeapons;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow changing the name
    if (name === 'name') {
      setUserInfo(prev => ({
        ...prev,
        name: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (submitInProgress) return;
    
    // Validate form
    if (!userInfo.name.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    
    if (selectedRoles.length === 0) {
      setSubmitError('Please select at least one role');
      return;
    }
    
    // Check if at least one weapon is selected for each role
    const hasWeaponForEachRole = selectedRoles.every(role => 
      selectedWeaponsByRole[role] && selectedWeaponsByRole[role].length > 0
    );
    
    if (!hasWeaponForEachRole) {
      setSubmitError('Please select at least one weapon for each selected role');
      return;
    }
    
    setSubmitInProgress(true);
    setSubmitError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('discordUser')) || {};
      
      const signupData = {
        userId: user.id || Date.now().toString(),
        discordId: user.id, // Using id as discordId
        name: userInfo.name,
        guildName: userInfo.hasGuildRole ? GUILD_NAME : '',
        hasGuildRole: userInfo.hasGuildRole,
        roles: selectedRoles,
        weaponsByRole: selectedWeaponsByRole,
        timestamp: new Date().toISOString(),
        rosterId: rosterId || 'default'
      };
      
      // Submit to backend
      const response = await fetch('/.netlify/functions/submit-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      setSubmitSuccess(true);
      
      // Close after a short delay to show success message
      setTimeout(() => {
        onClose();
        // Reset form state after closing
        setSelectedRoles([]);
        setSelectedWeaponsByRole({});
        setSubmitSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to submit signup:', error);
      setSubmitError('Failed to submit your signup. Please try again.');
    } finally {
      setSubmitInProgress(false);
    }
  };

  if (!open) return null;

  // Handler for clicking outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '2rem',
          minWidth: 500,
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          fontFamily: 'Segoe UI, Arial, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 15, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>×</button>
        <h2 style={{ marginTop: 0, fontWeight: 600, color: '#3730a3', fontFamily: 'Segoe UI, Arial, sans-serif' }}>Sign Up for Roster</h2>
        
        {/* User info section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                placeholder="Your name"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 500,
                color: userInfo.hasGuildRole ? '#22c55e' : '#6b7280'
              }}>
                Guild:
              </label>
              <div
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  color: userInfo.hasGuildRole ? '#22c55e' : '#6b7280',
                  minHeight: '37px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: userInfo.hasGuildRole ? 500 : 400,
                }}
              >
                {userInfo.hasGuildRole ? (
                  <span>{userInfo.guildName}</span>
                ) : (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not a member of {GUILD_NAME}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Role selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: 18, color: '#444', display: 'block', marginBottom: '8px' }}>Select Roles:</strong>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginTop: 8,
            }}
          >
            {ROLE_OPTIONS.map(role => (
              <label key={role} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                fontSize: 16, 
                cursor: 'pointer', 
                fontWeight: 500, 
                color: '#373737',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: selectedRoles.includes(role) ? '#e0e7ff' : 'transparent',
                border: '1px solid',
                borderColor: selectedRoles.includes(role) ? '#6366f1' : '#e5e7eb',
              }}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  style={{ accentColor: '#6366f1', width: 16, height: 16 }}
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Weapons selection by role */}
        {selectedRoles.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ fontSize: 18, color: '#444', display: 'block', marginBottom: '8px' }}>Select Weapons by Role:</strong>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedRoles.map(role => (
                <div key={role} style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#3730a3' }}>{role}</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '8px',
                  }}>
                    {WEAPON_OPTIONS_BY_ROLE[role]?.map(weapon => (
                      <label key={`${role}-${weapon}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: '4px',
                        backgroundColor: selectedWeaponsByRole[role]?.includes(weapon) ? '#e0e7ff' : 'white',
                        border: '1px solid',
                        borderColor: selectedWeaponsByRole[role]?.includes(weapon) ? '#6366f1' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedWeaponsByRole[role]?.includes(weapon) || false}
                          onChange={() => handleWeaponToggle(role, weapon)}
                          style={{ accentColor: '#6366f1', width: 14, height: 14 }}
                        />
                        <span 
                          style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: buildDetails[weapon] ? '#6366f1' : 'inherit',
                            textDecoration: buildDetails[weapon] ? 'underline' : 'none',
                            cursor: buildDetails[weapon] ? 'pointer' : 'inherit',
                          }}
                          onClick={buildDetails[weapon] ? () => setShowBuild(weapon) : undefined}
                          title={weapon}
                        >
                          {weapon}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {submitError && (
            <div style={{ color: '#ef4444', marginBottom: '10px', textAlign: 'center' }}>
              {submitError}
            </div>
          )}
          
          {submitSuccess && (
            <div style={{ color: '#22c55e', marginBottom: '10px', textAlign: 'center' }}>
              Your signup was successfully submitted!
            </div>
          )}
          
          <button
            style={{
              padding: '0.6rem 2rem',
              borderRadius: 8,
              background: submitInProgress ? '#9ca3af' : 
                        (selectedRoles.length === 0 ? '#9ca3af' : '#6366f1'),
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              cursor: submitInProgress || selectedRoles.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 17,
              fontFamily: 'Segoe UI, Arial, sans-serif',
              opacity: submitInProgress || selectedRoles.length === 0 ? 0.7 : 1,
              transition: 'background 0.2s, opacity 0.2s',
              minWidth: '180px',
            }}
            disabled={submitInProgress || selectedRoles.length === 0}
            onClick={handleSubmit}
          >
            {submitInProgress ? "Submitting..." : "Sign Up"}
          </button>
        </div>
        {showBuild && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              fontFamily: 'Segoe UI, Arial, sans-serif',
            }}
            onClick={() => setShowBuild(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: '1.5rem',
                minWidth: 300,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                position: 'relative',
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowBuild(null)} style={{ position: 'absolute', top: 10, right: 15, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>×</button>
              <h3 style={{ marginTop: 0, color: '#3730a3', fontWeight: 600 }}>{showBuild} Build Details</h3>
              <div style={{ marginTop: 4, background: '#f3f4f6', borderRadius: 6, padding: 10, fontSize: 16, color: '#222' }}>
                {buildDetails[showBuild]}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;
