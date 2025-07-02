import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServerSettings, updateServerSettings } from '../utils/firestoreEvents';
import '../styles/serversettings.css';

// Helper component for managing dropdown options
function OptionsList({ title, items, onAdd, onRemove }) {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  const handleAdd = async () => {
    if (newItem.trim() === '') return;
    setIsAdding(true);
    try {
      await onAdd(newItem);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (item) => {
    setRemovingItem(item);
    try {
      await onRemove(item);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="options-list">
      <h4 className="options-title">{title}</h4>
      <div className="options-input-group">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Add ${title.toLowerCase()}`}
          className="options-input"
          disabled={isAdding}
        />
        <button 
          type="button" 
          onClick={handleAdd}
          className={`options-add-btn ${isAdding ? 'adding' : ''}`}
          disabled={isAdding || newItem.trim() === ''}
        >
          {isAdding ? '...' : '+'}
        </button>
      </div>
      {items && items.length > 0 ? (
        <ul className="options-items">
          {items.map((item) => (
            <li key={item} className="option-item">
              <span className="option-text" title={item}>
                {item}
              </span>
              <button 
                type="button" 
                onClick={() => handleRemove(item)}
                className={`option-remove-btn ${removingItem === item ? 'removing' : ''}`}
                disabled={removingItem === item}
              >
                {removingItem === item ? '...' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="options-empty">No items added yet</div>
      )}
    </div>
  );
}

// Helper component for role weapons accordion
function AccordionRoleWeapons({ roles, weaponsByRole, onUpdateWeapons }) {
  // Initialize with the first role open if there are roles
  const initialOpenState = roles.length > 0 ? { [roles[0]]: true } : {};
  const [openRoles, setOpenRoles] = useState(initialOpenState);
  
  const toggleRole = (role) => {
    setOpenRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };
  
  const handleAddWeapon = (role, newWeapon) => {
    if (weaponsByRole[role] && weaponsByRole[role].includes(newWeapon)) {
      alert("This weapon already exists for this role!");
      return;
    }
    
    const updatedWeapons = [...(weaponsByRole[role] || []), newWeapon];
    onUpdateWeapons(role, updatedWeapons);
  };
  
  const handleRemoveWeapon = (role, weaponToRemove) => {
    const updatedWeapons = (weaponsByRole[role] || []).filter(
      weapon => weapon !== weaponToRemove
    );
    onUpdateWeapons(role, updatedWeapons);
  };
  
  return (
    <div className="accordion">
      {roles.map((role) => {
        const isOpen = !!openRoles[role];
        return (
          <div key={role} className="accordion-item">
            <div 
              className={`accordion-header ${isOpen ? 'active' : ''}`}
              onClick={() => toggleRole(role)}
            >
              <h4>{role}</h4>
              <div className="accordion-indicators">
                <span className="weapon-count">
                  {(weaponsByRole[role] || []).length} weapons
                </span>
                <span className="accordion-arrow">{isOpen ? '▼' : '▶'}</span>
              </div>
            </div>
            {isOpen && (
              <div className="accordion-content">
                <OptionsList
                  title={`Weapons for ${role}`}
                  items={weaponsByRole[role] || []}
                  onAdd={(newWeapon) => handleAddWeapon(role, newWeapon)}
                  onRemove={(weaponToRemove) => handleRemoveWeapon(role, weaponToRemove)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ServerSettings({ currentUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validatingGuild, setValidatingGuild] = useState(false);
  const [guildValidation, setGuildValidation] = useState({ validated: false, name: '' });
  const [settings, setSettings] = useState({
    guildId: '',
    elevatedRoleId: '',
    userRoleId: '',
    guestRoleId: '',
    guildName: '',
    roles: [],
    weaponsByRole: {},
    armorOptions: {
      head: [],
      chest: [],
      feet: []
    }
  });
  
  // Check if user is elevated/admin
  const ELEVATED_ROLE_ID = process.env.REACT_APP_ELEVATED_ROLE_ID;
  const isElevated = currentUser?.guildRoles && ELEVATED_ROLE_ID && currentUser.guildRoles.includes(ELEVATED_ROLE_ID);

  // Redirect non-admin users
  useEffect(() => {
    if (!currentUser || !isElevated) {
      navigate('/');
    }
  }, [currentUser, isElevated, navigate]);

  // Auto-dismiss success and error messages after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load server settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getServerSettings();
        if (data) {
          // Ensure all required structure exists
          const processedData = {
            guildId: data.guildId || '',
            elevatedRoleId: data.elevatedRoleId || '',
            userRoleId: data.userRoleId || '',
            guestRoleId: data.guestRoleId || '',
            guildName: data.guildName || '',
            roles: data.roles || [],
            weaponsByRole: data.weaponsByRole || {},
            armorOptions: {
              head: data.armorOptions?.head || [],
              chest: data.armorOptions?.chest || [],
              feet: data.armorOptions?.feet || []
            }
          };
          
          setSettings(processedData);
          
          // Validate guild ID if it exists to get the server name
          if (processedData.guildId) {
            validateGuildId(processedData.guildId);
          }
        }
      } catch (err) {
        console.error("Error fetching server settings:", err);
        setError("Failed to load server settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Fetch Discord server name using guild ID
  const fetchServerName = async (guildId) => {
    if (!guildId || guildId.trim() === '') {
      return null;
    }
    
    try {
      // We'll use the Netlify function to make this request to protect our bot token
      const response = await fetch('/.netlify/functions/get-server-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guildId })
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch server name: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      if (data.guildName) {
        return data.guildName;
      }
      
      return null; // Return null if no guild name was found
    } catch (error) {
      console.error("Error fetching server name:", error);
      return null;
    }
  };

  // Validate Discord Server ID and fetch server name
  const validateGuildId = async (guildId) => {
    if (!guildId) {
      setGuildValidation({ validated: false, name: '' });
      setSettings(prev => ({ ...prev, guildName: '' }));
      return;
    }

    setValidatingGuild(true);
    try {
      const response = await fetch('/.netlify/functions/get-server-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guildId })
      });
      
      if (!response.ok) {
        setGuildValidation({ validated: false, name: '' });
        setSettings(prev => ({ ...prev, guildName: '' }));
        return;
      }
      
      const data = await response.json();
      if (data.guildName) {
        setGuildValidation({ validated: true, name: data.guildName });
        // Update the server name field automatically
        setSettings(prev => ({ ...prev, guildName: data.guildName }));
      } else {
        setGuildValidation({ validated: false, name: '' });
        setSettings(prev => ({ ...prev, guildName: '' }));
      }
    } catch (error) {
      console.error("Error validating guild ID:", error);
      setGuildValidation({ validated: false, name: '' });
      setSettings(prev => ({ ...prev, guildName: '' }));
    } finally {
      setValidatingGuild(false);
    }
  };

  // Handle guild ID input with debounced validation
  const handleGuildIdChange = (e) => {
    const newGuildId = e.target.value;
    setSettings(prev => ({ ...prev, guildId: newGuildId }));
    
    // Clear previous validation
    setGuildValidation({ validated: false, name: '' });
    
    // Debounce the validation call
    if (newGuildId) {
      // Clear any existing timeout
      if (window.guildValidationTimeout) {
        clearTimeout(window.guildValidationTimeout);
      }
      
      // Set new timeout
      window.guildValidationTimeout = setTimeout(() => {
        validateGuildId(newGuildId);
      }, 1000); // Wait 1 second after typing stops
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Basic validation
      if (!settings.guildId) throw new Error("Discord Server ID is required");
      if (!settings.elevatedRoleId) throw new Error("Admin Role ID is required");
      if (!settings.roles || settings.roles.length === 0) throw new Error("At least one role is required");
      
      // Validate that each role has at least one weapon
      const rolesWithoutWeapons = settings.roles.filter(role => 
        !settings.weaponsByRole[role] || settings.weaponsByRole[role].length === 0
      );
      
      if (rolesWithoutWeapons.length > 0) {
        throw new Error(`These roles have no weapons: ${rolesWithoutWeapons.join(', ')}`);
      }
      
      // Validate that each armor type has at least one option
      const armorTypes = ['head', 'chest', 'feet'];
      const emptyArmorTypes = armorTypes.filter(type => 
        !settings.armorOptions[type] || settings.armorOptions[type].length === 0
      );
      
      if (emptyArmorTypes.length > 0) {
        throw new Error(`These armor types have no options: ${emptyArmorTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}`);
      }

      // Try to fetch the server name if the guild ID changed or no name is set
      if (settings.guildId && (!settings.guildName || settings.guildName.trim() === '')) {
        const serverName = await fetchServerName(settings.guildId);
        if (serverName) {
          settings.guildName = serverName;
        } else {
          // Warning if we couldn't fetch the server name, but don't block saving
          console.warn("Could not fetch Discord server name. Continuing with save.");
        }
      }

      // Cleanup any empty arrays that might have been created
      const cleanSettings = {
        ...settings,
        roles: (settings.roles || []).filter(role => role.trim() !== ''),
        weaponsByRole: { ...settings.weaponsByRole },
        armorOptions: {
          head: (settings.armorOptions.head || []).filter(item => item.trim() !== ''),
          chest: (settings.armorOptions.chest || []).filter(item => item.trim() !== ''),
          feet: (settings.armorOptions.feet || []).filter(item => item.trim() !== '')
        }
      };

      // Save to Firestore
      await updateServerSettings(cleanSettings);
      setSuccess(true);
    } catch (err) {
      setError("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // We've removed the addRole, removeRole, addWeaponToRole, and removeWeaponFromRole functions as they're now handled by the OptionsList component

  // We've removed the addArmorPiece and removeArmorPiece functions as they're now handled by the OptionsList component

  // Return null if user is not authorized (will redirect)
  if (!currentUser || !isElevated) {
    return null;
  }
  
  if (loading) {
    return <div className="server-settings-page"><div className="server-settings-loading">Loading server settings...</div></div>;
  }

  return (
    <div className="server-settings-page">
      <div className="server-settings-content">
        {/* Header with back button */}
        <div className="server-settings-header">
          <h1 className="server-settings-heading">Server Settings</h1>
          
          <div className="server-settings-actions">
            <button 
              className="back-to-admin-btn"
              onClick={() => navigate('/admin')}
            >
              ← Back to Admin
            </button>
            <div></div> {/* This keeps the space for right alignment if needed */}
          </div>
        </div>

        <div className="server-settings-card">
          <div className="server-settings-instructions">
            <h3>Server Settings Instructions</h3>
            <p>This page allows you to configure your server's roster settings. When saved, these settings will be used throughout the application instead of environment variables.</p>
            <ul>
              <li>Enter your <strong>Discord Server ID</strong> to validate and fetch the server name</li>
              <li>Set the <strong>Admin Role ID</strong> that controls who has access to admin tools</li>
              <li>Manage <strong>Roles</strong> and their available <strong>Weapons</strong></li>
              <li>Configure <strong>Armor Options</strong> for character builds</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="server-settings-form">
            <div className="server-settings-section">
              <h2>Discord Server Configuration</h2>
              <div className="server-settings-grid">
                <div>
                  <label>Discord Server ID:</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={settings.guildId}
                      onChange={handleGuildIdChange}
                      placeholder="Discord Server ID"
                      required
                      style={{ 
                        flex: 1, 
                        borderColor: guildValidation.validated ? '#22c55e' : undefined
                      }}
                    />
                    {validatingGuild && (
                      <div style={{ marginLeft: '10px', color: '#666' }}>
                        Validating...
                      </div>
                    )}
                    {!validatingGuild && guildValidation.validated && (
                      <div style={{ marginLeft: '10px', color: '#22c55e' }}>
                        ✓ Valid
                      </div>
                    )}
                  </div>
                  {guildValidation.validated && (
                    <small style={{ display: 'block', marginTop: '4px', color: '#22c55e' }}>
                      Server found: {guildValidation.name}
                    </small>
                  )}
                  {!guildValidation.validated && settings.guildId && !validatingGuild && (
                    <small style={{ display: 'block', marginTop: '4px', color: '#ef4444' }}>
                      Server not found or bot doesn't have access
                    </small>
                  )}
                </div>
                <div>
                  <label>Server Name:</label>
                  <input
                    type="text"
                    value={settings.guildName}
                    onChange={(e) => setSettings(prev => ({ ...prev, guildName: e.target.value }))}
                    placeholder="Will be fetched from Discord"
                    readOnly
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                    Server name is automatically fetched from Discord when you save
                  </small>
                </div>
                <div>
                  <label>Admin Role ID:</label>
                  <input
                    type="text"
                    value={settings.elevatedRoleId}
                    onChange={(e) => setSettings(prev => ({ ...prev, elevatedRoleId: e.target.value }))}
                    placeholder="Admin Role ID"
                    required
                  />
                </div>
                <div>
                  <label>User Role ID:</label>
                  <input
                    type="text"
                    value={settings.userRoleId}
                    onChange={(e) => setSettings(prev => ({ ...prev, userRoleId: e.target.value }))}
                    placeholder="Default User Role ID"
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                    Optional: Role assigned to all authenticated users
                  </small>
                </div>
                <div>
                  <label>Guest Role ID:</label>
                  <input
                    type="text"
                    value={settings.guestRoleId}
                    onChange={(e) => setSettings(prev => ({ ...prev, guestRoleId: e.target.value }))}
                    placeholder="Guest Role ID"
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                    Optional: Role for users with limited permissions
                  </small>
                </div>
              </div>
            </div>

            <div className="server-settings-section">
              <h2>Role Management</h2>
              <p className="section-description">
                These roles will be available for selection when creating rosters and signing up for events.
              </p>
              
              {/* Roles Management */}
              <div className="settings-panel">
                <OptionsList
                  title="Roles"
                  items={settings.roles}
                  onAdd={(newRole) => {
                    if (settings.roles.includes(newRole)) {
                      alert("This role already exists!");
                      return;
                    }
                    setSettings(prev => ({
                      ...prev,
                      roles: [...prev.roles, newRole],
                      weaponsByRole: {
                        ...prev.weaponsByRole,
                        [newRole]: [] // Initialize with empty weapon array
                      }
                    }));
                  }}
                  onRemove={(roleToRemove) => {
                    if (!window.confirm(`Are you sure you want to remove the role "${roleToRemove}" and all its weapons?`)) return;
                    
                    setSettings(prev => {
                      const { [roleToRemove]: _, ...remainingWeaponsByRole } = prev.weaponsByRole;
                      return {
                        ...prev,
                        roles: prev.roles.filter(role => role !== roleToRemove),
                        weaponsByRole: remainingWeaponsByRole
                      };
                    });
                  }}
                />
              </div>

              {/* Weapons by Role */}
              <h3 className="subsection-heading">Weapons by Role</h3>
              <p className="section-description">
                Configure which weapons are available for each role. Each role must have at least one weapon.
              </p>
              
              {settings.roles.length === 0 ? (
                <div className="empty-state">
                  Add roles above to configure their available weapons
                </div>
              ) : (
                <AccordionRoleWeapons 
                  roles={settings.roles} 
                  weaponsByRole={settings.weaponsByRole} 
                  onUpdateWeapons={(role, weapons) => {
                    setSettings(prev => ({
                      ...prev,
                      weaponsByRole: {
                        ...prev.weaponsByRole,
                        [role]: weapons
                      }
                    }));
                  }}
                />
              )}
            </div>

            <div className="server-settings-section">
              <h2>Armor Options</h2>
              <p className="section-description">
                Configure armor options that will be available when creating characters for rosters.
              </p>
              <div className="server-settings-armor">
                {['head', 'chest', 'feet'].map((type) => (
                  <div key={type} className="server-settings-armor-type">
                    <OptionsList
                      title={`${type.charAt(0).toUpperCase() + type.slice(1)} Armor`}
                      items={settings.armorOptions[type] || []}
                      onAdd={(newItem) => {
                        if (settings.armorOptions[type] && settings.armorOptions[type].includes(newItem)) {
                          alert(`This ${type} armor option already exists!`);
                          return;
                        }
                        setSettings(prev => ({
                          ...prev,
                          armorOptions: {
                            ...prev.armorOptions,
                            [type]: [...(prev.armorOptions[type] || []), newItem]
                          }
                        }));
                      }}
                      onRemove={(itemToRemove) => {
                        setSettings(prev => ({
                          ...prev,
                          armorOptions: {
                            ...prev.armorOptions,
                            [type]: (prev.armorOptions[type] || []).filter(item => item !== itemToRemove)
                          }
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="server-settings-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
            {success && <div className="success-msg">Settings saved successfully!</div>}
            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
