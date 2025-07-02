import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getRosters, setLiveRoster, hasLiveRoster, deleteRoster, updateRoster } from '../utils/firestoreEvents';
import { ROLE_OPTIONS, WEAPON_OPTIONS_BY_ROLE } from '../data/rosterOptions';

const ManageRosters = ({ onBack }) => {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', or 'edit'
  const [editingRoster, setEditingRoster] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rosterToMakeLive, setRosterToMakeLive] = useState(null);
  const [proceedButtonEnabled, setProceedButtonEnabled] = useState(false);
  const [makingLive, setMakingLive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  // Delete roster state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rosterToDelete, setRosterToDelete] = useState(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [deleteProceedEnabled, setDeleteProceedEnabled] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [authorFilter, setAuthorFilter] = useState(''); // Author filter state

  // Helper function to safely handle equipment data (both array and string formats)
  const safeGetEquipmentItems = (equipment) => {
    if (!equipment) return [];
    if (Array.isArray(equipment)) return equipment.filter(item => item && item.trim());
    if (typeof equipment === 'string') return equipment.split('/').map(item => item.trim()).filter(item => item);
    return [];
  };

  // Dropdown options for roster editing - alphabetized and from data files
  const roleOptions = useMemo(() => {
    const sortedRoles = [...ROLE_OPTIONS].sort((a, b) => a.localeCompare(b));
    return ['', ...sortedRoles]; // Empty option first, then alphabetized
  }, []);

  // Get available weapons for a specific role, alphabetized
  const getWeaponOptionsForRole = useCallback((role) => {
    if (!role || !WEAPON_OPTIONS_BY_ROLE[role]) {
      // If no role selected or invalid role, return all weapons alphabetized
      const allWeapons = new Set();
      Object.values(WEAPON_OPTIONS_BY_ROLE).forEach(weapons => {
        weapons.forEach(weapon => allWeapons.add(weapon));
      });
      const sortedWeapons = [...allWeapons].sort((a, b) => a.localeCompare(b));
      return ['', ...sortedWeapons];
    }
    const sortedWeapons = [...WEAPON_OPTIONS_BY_ROLE[role]].sort((a, b) => a.localeCompare(b));
    return ['', ...sortedWeapons];
  }, []);

  const headOptions = useMemo(() => {
    const options = [
      'Assassin', 'Cleric', 'Feyscale', 'Hellion', 'Judi', 'Soldier', 'Scholar', 
      'Mercenary', 'Hunter', 'Mage', 'Graveguard', 'Knight', 'Stalker', 'Guardian'
    ].sort((a, b) => a.localeCompare(b));
    return ['', ...options];
  }, []);

  const chestOptions = useMemo(() => {
    const options = [
      'Guardian', 'Duskweaver', 'Knight', 'Demon', 'Judi', 'Scholar', 'Cleric',
      'Mercenary', 'Hunter', 'Mage', 'Graveguard', 'Stalker', 'Assassin', 'Soldier'
    ].sort((a, b) => a.localeCompare(b));
    return ['', ...options];
  }, []);

  const bootsOptions = useMemo(() => {
    const options = [
      'Stalker', 'Cleric', 'Graveguard', 'Guardian', 'Refresh Sprint', 'Scholar',
      'Mercenary', 'Hunter', 'Mage', 'Knight', 'Assassin', 'Soldier', 'idc don\'t die'
    ].sort((a, b) => a.localeCompare(b));
    return ['', ...options];
  }, []);

  // Custom Equipment Dropdown Component
  const EquipmentDropdown = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (option) => {
      // Always create a copy to avoid any potential state mutation
      const currentValues = Array.isArray(value) ? [...value] : [];
      const isSelected = currentValues.includes(option);
      
      let newValues;
      if (isSelected) {
        newValues = currentValues.filter(v => v !== option);
      } else {
        newValues = [...currentValues, option];
      }
      
      onChange(newValues);
      // Don't close the dropdown - let users select multiple items
    };

    const displayText = value && value.length > 0 
      ? value.filter(v => v).join(', ') 
      : placeholder || 'Select items';

    return (
      <div className="equipment-dropdown" ref={dropdownRef}>
        <div 
          className="equipment-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="equipment-dropdown-text">{displayText}</span>
          <span className={`equipment-dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen && (
          <div className="equipment-dropdown-menu">
            {options.map(option => (
              <label 
                key={option} 
                className="equipment-dropdown-option"
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling to avoid closing
              >
                <input
                  type="checkbox"
                  checked={value && value.includes(option)}
                  onChange={() => handleToggleOption(option)}
                />
                <span className="equipment-checkbox-label">
                  {option || 'None'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Memoized Position Row Component to prevent unnecessary re-renders
  const PositionRow = React.memo(({ 
    partyIndex, 
    position, 
    posIndex,
    roleOptions,
    getWeaponOptionsForRole,
    headOptions,
    chestOptions,
    bootsOptions,
    updatePositionField,
    handlePlayerNameDirectChange,
    handleBuildNotesDirectChange,
    safeGetEquipmentItems
  }) => {
    // Get weapon options for the currently selected role
    const currentWeaponOptions = getWeaponOptionsForRole(position.role);
    
    return (
      <tr className={`position-row ${position.signedUpUser ? 'filled' : 'empty'}`}>
        <td className="position-role">
          <select 
            value={position.role || ''}
            onChange={(e) => {
              updatePositionField(partyIndex, posIndex, 'role', e.target.value);
              // Clear weapon selection when role changes to prevent invalid combinations
              if (position.weapon && getWeaponOptionsForRole(e.target.value).indexOf(position.weapon) === -1) {
                updatePositionField(partyIndex, posIndex, 'weapon', '');
              }
            }}
            className="edit-select"
          >
            {roleOptions.map(option => (
              <option key={option} value={option}>{option || 'Select Role'}</option>
            ))}
          </select>
        </td>
        <td className="position-weapon">
          <select 
            value={position.weapon || ''}
            onChange={(e) => updatePositionField(partyIndex, posIndex, 'weapon', e.target.value)}
            className="edit-select"
          >
            {currentWeaponOptions.map(option => (
              <option key={option} value={option}>{option || 'Select Weapon'}</option>
            ))}
          </select>
        </td>
        <td className="position-equipment">
          <EquipmentDropdown
            value={safeGetEquipmentItems(position.head)}
            onChange={(values) => updatePositionField(partyIndex, posIndex, 'head', values)}
            options={headOptions}
            placeholder="Select head gear"
          />
        </td>
        <td className="position-equipment">
          <EquipmentDropdown
            value={safeGetEquipmentItems(position.chest)}
            onChange={(values) => updatePositionField(partyIndex, posIndex, 'chest', values)}
            options={chestOptions}
            placeholder="Select chest gear"
          />
        </td>
        <td className="position-equipment">
          <EquipmentDropdown
            value={safeGetEquipmentItems(position.boots)}
            onChange={(values) => updatePositionField(partyIndex, posIndex, 'boots', values)}
            options={bootsOptions}
            placeholder="Select boots"
          />
        </td>
        <td className="position-player">
          <input
            type="text"
            defaultValue={position.signedUpUser || ''}
            onBlur={(e) => handlePlayerNameDirectChange(partyIndex, posIndex, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.target.blur(); // Trigger onBlur when Enter is pressed
              }
            }}
            className="edit-input player-input-compact"
            placeholder="Player"
            maxLength={30}
          />
        </td>
        <td className="position-build-notes">
          <textarea
            defaultValue={position.buildNotes || ''}
            onBlur={(e) => handleBuildNotesDirectChange(partyIndex, posIndex, e.target.value)}
            className="edit-textarea-compact"
            placeholder="Notes"
            rows={2}
            maxLength={100}
          />
        </td>
      </tr>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    // Check if position fields that matter for rendering have changed
    const prevPos = prevProps.position;
    const nextPos = nextProps.position;
    
    return (
      prevProps.partyIndex === nextProps.partyIndex &&
      prevProps.posIndex === nextProps.posIndex &&
      prevPos.role === nextPos.role &&
      prevPos.weapon === nextPos.weapon &&
      prevPos.signedUpUser === nextPos.signedUpUser &&
      prevPos.buildNotes === nextPos.buildNotes &&
      JSON.stringify(prevPos.head) === JSON.stringify(nextPos.head) &&
      JSON.stringify(prevPos.chest) === JSON.stringify(nextPos.chest) &&
      JSON.stringify(prevPos.boots) === JSON.stringify(nextPos.boots) &&
      prevProps.roleOptions === nextProps.roleOptions &&
      prevProps.getWeaponOptionsForRole === nextProps.getWeaponOptionsForRole &&
      prevProps.headOptions === nextProps.headOptions &&
      prevProps.chestOptions === nextProps.chestOptions &&
      prevProps.bootsOptions === nextProps.bootsOptions &&
      prevProps.updatePositionField === nextProps.updatePositionField &&
      prevProps.handlePlayerNameDirectChange === nextProps.handlePlayerNameDirectChange &&
      prevProps.handleBuildNotesDirectChange === nextProps.handleBuildNotesDirectChange
    );
  });

  PositionRow.displayName = 'PositionRow';

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

  // Auto-dismiss success message after 4 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Get unique authors for filter dropdown
  const uniqueAuthors = [...new Set(rosters.map(roster => roster.author).filter(Boolean))].sort();
  
  // Filter rosters based on selected author
  const filteredRosters = authorFilter ? rosters.filter(roster => roster.author === authorFilter) : rosters;

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
    setSelectedRoster(roster);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedRoster(null);
    setEditingRoster(null);
    setViewMode('list');
  };

  const handleSaveRoster = async () => {
    if (!editingRoster || saving) return;
    
    try {
      setSaving(true);
      // Update the roster in the database
      await updateRoster(editingRoster.id, editingRoster);
      
      // Update local state
      setRosters(prev => prev.map(r => r.id === editingRoster.id ? editingRoster : r));
      
      // Show success and return to list
      setShowSuccessMessage(true);
      handleBackToList();
    } catch (err) {
      console.error('Failed to save roster:', err);
      alert('Failed to save roster: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoster(null);
    setSelectedRoster(null);
    setViewMode('list');
  };

  // Handlers for editing roster data
  const updateRosterField = useCallback((field, value) => {
    setEditingRoster(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updatePositionField = useCallback((partyIndex, positionIndex, field, value) => {
    setEditingRoster(prev => {
      // Check if the value is actually different to avoid unnecessary re-renders
      const currentValue = prev.parties?.[partyIndex]?.positions?.[positionIndex]?.[field];
      if (currentValue === value) {
        return prev;
      }
      
      // Validate indices before proceeding
      if (!prev.parties?.[partyIndex]?.positions?.[positionIndex]) {
        return prev;
      }
      
      // Create immutable update - deep copy the nested structure
      const newRoster = { ...prev };
      newRoster.parties = [...prev.parties];
      newRoster.parties[partyIndex] = { ...prev.parties[partyIndex] };
      newRoster.parties[partyIndex].positions = [...prev.parties[partyIndex].positions];
      newRoster.parties[partyIndex].positions[positionIndex] = {
        ...prev.parties[partyIndex].positions[positionIndex],
        [field]: value
      };
      
      return newRoster;
    });
  }, []);

  // Optimized handlers for direct updates without debouncing in the main component
  const handlePlayerNameDirectChange = useCallback((partyIndex, positionIndex, value) => {
    updatePositionField(partyIndex, positionIndex, 'signedUpUser', value);
  }, [updatePositionField]);

  const handleBuildNotesDirectChange = useCallback((partyIndex, positionIndex, value) => {
    updatePositionField(partyIndex, positionIndex, 'buildNotes', value);
  }, [updatePositionField]);

  const updatePartyField = useCallback((partyIndex, field, value) => {
    setEditingRoster(prev => {
      // Validate index before proceeding
      if (!prev.parties?.[partyIndex]) {
        return prev;
      }

      // Create immutable update
      const newRoster = { ...prev };
      newRoster.parties = [...prev.parties];
      newRoster.parties[partyIndex] = {
        ...prev.parties[partyIndex],
        [field]: value
      };
      
      return newRoster;
    });
  }, []);

  const handleEditClick = (roster, event) => {
    event.stopPropagation(); // Prevent roster card click
    // Deep clone the roster for editing
    const rosterCopy = JSON.parse(JSON.stringify(roster));
    setEditingRoster(rosterCopy);
    setSelectedRoster(rosterCopy);
    setViewMode('edit');
  };

  const handleMakeLiveClick = (roster, event) => {
    event.stopPropagation(); // Prevent roster card click
    setRosterToMakeLive(roster);
    setShowConfirmDialog(true);
    setProceedButtonEnabled(false);
    setCountdown(2);
    
    // Countdown timer: 2, 1, then enable
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setProceedButtonEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmMakeLive = async () => {
    if (!rosterToMakeLive || !proceedButtonEnabled) return;
    
    try {
      setMakingLive(true);
      await setLiveRoster(rosterToMakeLive);
      
      // Close dialog and reset state
      setShowConfirmDialog(false);
      setRosterToMakeLive(null);
      setProceedButtonEnabled(false);
      
      // Show success message
      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Failed to make roster live:', err);
      alert('Failed to make roster live: ' + err.message);
    } finally {
      setMakingLive(false);
    }
  };

  const handleCancelMakeLive = () => {
    setShowConfirmDialog(false);
    setRosterToMakeLive(null);
    setProceedButtonEnabled(false);
    setCountdown(0);
  };

  // Delete roster handlers
  const handleDeleteClick = (roster, event) => {
    event.stopPropagation(); // Prevent roster card click
    setRosterToDelete(roster);
    setShowDeleteDialog(true);
    setDeleteProceedEnabled(false);
    setDeleteCountdown(2);
    
    // Countdown timer: 2, 1, then enable
    const countdownInterval = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setDeleteProceedEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmDelete = async () => {
    if (!rosterToDelete || !deleteProceedEnabled) return;
    
    try {
      setDeleting(true);
      await deleteRoster(rosterToDelete.id);
      
      // Remove roster from local state
      setRosters(prev => prev.filter(r => r.id !== rosterToDelete.id));
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setRosterToDelete(null);
      setDeleteProceedEnabled(false);
      
      // Show success message
      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Failed to delete roster:', err);
      alert('Failed to delete roster: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setRosterToDelete(null);
    setDeleteProceedEnabled(false);
    setDeleteCountdown(0);
  };

  const handleDialogOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      // Clicked on overlay, close the appropriate dialog
      if (showConfirmDialog) {
        handleCancelMakeLive();
      } else if (showDeleteDialog) {
        handleCancelDelete();
      }
    }
  };

  // Confirmation Dialog Component
  const MakeLiveConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    // Calculate roster stats for the confirmation dialog
    const totalPositions = rosterToMakeLive?.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0;
    const totalParties = rosterToMakeLive?.parties?.length || 0;

    return (
      <div className="dialog-overlay" onClick={handleDialogOverlayClick}>
        <div className="confirm-dialog">
          <h3>Make Roster Live</h3>
          <p>
            Are you sure you want to make this roster live? It will erase the current live roster. 
            Ensure the current roster has been archived.
          </p>
          <div className="dialog-roster-info">
            <div className="dialog-info-grid">
              <div className="dialog-info-item">
                <strong>Event:</strong> {rosterToMakeLive?.eventName || 'Untitled Event'}
              </div>
              <div className="dialog-info-item">
                <strong>Author:</strong> {rosterToMakeLive?.author || 'Unknown'}
              </div>
              <div className="dialog-info-item">
                <strong>Parties:</strong> {totalParties}
              </div>
              <div className="dialog-info-item">
                <strong>Positions:</strong> {totalPositions}
              </div>
            </div>
          </div>
          <div className="dialog-buttons">
            <button 
              className="halt-btn" 
              onClick={handleCancelMakeLive}
              disabled={makingLive}
            >
              Halt
            </button>
            <button 
              className={`proceed-btn ${!proceedButtonEnabled ? 'disabled' : ''}`}
              onClick={handleConfirmMakeLive}
              disabled={!proceedButtonEnabled || makingLive}
            >
              {makingLive ? 'Processing...' : (proceedButtonEnabled ? 'Proceed' : `Proceed (${countdown})`)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Dialog Component
  const DeleteConfirmDialog = () => {
    if (!showDeleteDialog) return null;

    return (
      <div className="dialog-overlay" onClick={handleDialogOverlayClick}>
        <div className="confirm-dialog delete-confirm-dialog">
          <h3>Delete Roster</h3>
          <p>
            Are you sure you want to delete this roster? This action cannot be undone.
          </p>
          <div className="dialog-buttons">
            <button 
              className="cancel-btn" 
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              className={`delete-btn ${!deleteProceedEnabled ? 'disabled' : ''}`}
              onClick={handleConfirmDelete}
              disabled={!deleteProceedEnabled || deleting}
            >
              {deleting ? 'Deleting...' : (deleteProceedEnabled ? 'Delete' : `Delete (${deleteCountdown})`)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Roster Confirmation Dialog Component
  const DeleteRosterConfirmDialog = () => {
    if (!showDeleteDialog) return null;

    // Calculate roster stats for the confirmation dialog
    const totalPositions = rosterToDelete?.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0;
    const totalParties = rosterToDelete?.parties?.length || 0;

    return (
      <div className="dialog-overlay" onClick={handleDialogOverlayClick}>
        <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
          <h3>Delete Roster</h3>
          <p>
            Are you sure you want to permanently delete this roster? This action cannot be undone.
          </p>
          <div className="dialog-roster-info">
            <div className="dialog-info-grid">
              <div className="dialog-info-item">
                <strong>Event:</strong> {rosterToDelete?.eventName || 'Untitled Event'}
              </div>
              <div className="dialog-info-item">
                <strong>Author:</strong> {rosterToDelete?.author || 'Unknown'}
              </div>
              <div className="dialog-info-item">
                <strong>Parties:</strong> {totalParties}
              </div>
              <div className="dialog-info-item">
                <strong>Positions:</strong> {totalPositions}
              </div>
            </div>
          </div>
          <div className="dialog-buttons">
            <button 
              className="halt-btn" 
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              className={`proceed-btn ${!deleteProceedEnabled ? 'disabled' : ''}`}
              onClick={handleConfirmDelete}
              disabled={!deleteProceedEnabled || deleting}
            >
              {deleting ? 'Deleting...' : (deleteProceedEnabled ? 'Delete' : `Delete (${deleteCountdown})`)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Roster Detail View Component
  const RosterDetailView = ({ roster }) => {
    const totalPositions = roster.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0;
    const filledPositions = roster.parties?.reduce((total, party) => 
      total + (party.positions?.filter(pos => pos.signedUpUser).length || 0), 0) || 0;

    return (
      <div className="roster-detail-view">
        <div className="roster-detail-header">
          <button onClick={handleBackToList} className="back-button">← Back to Rosters</button>
          <div className="roster-detail-title">
            <h2>{roster.eventName || 'Untitled Event'}</h2>
            <span className="roster-detail-date">{formatDate(roster.createdAt)}</span>
          </div>
        </div>

        <div className="roster-detail-info">
          <div className="roster-info-card">
            <h3>Event Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Author:</strong> {roster.author || 'Unknown'}
              </div>
              <div className="info-item">
                <strong>Created:</strong> {formatDate(roster.createdAt)}
              </div>
              <div className="info-item">
                <strong>Parties:</strong> {roster.parties?.length || 0}
              </div>
              <div className="info-item">
                <strong>Positions:</strong> {filledPositions}/{totalPositions} filled
              </div>
            </div>
            {roster.eventDescription && (
              <div className="info-item description">
                <strong>Description:</strong>
                <p>{roster.eventDescription}</p>
              </div>
            )}
          </div>
        </div>

        <div className="roster-parties-container">
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
                        <td colSpan="7" className="no-positions">No positions defined</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="no-parties">No parties defined for this roster</div>
          )}
        </div>
      </div>
    );
  };

  // Roster Edit View Component
  const RosterEditView = ({ roster }) => {
    const totalPositions = roster.parties?.reduce((total, party) => total + (party.positions?.length || 0), 0) || 0;
    const filledPositions = roster.parties?.reduce((total, party) => 
      total + (party.positions?.filter(pos => pos.signedUpUser).length || 0), 0) || 0;

    return (
      <div className="roster-edit-view">
        <div className="roster-edit-header">
          <button onClick={handleCancelEdit} className="back-button">← Cancel</button>
          <div className="roster-edit-title">
            <h2>Edit Roster</h2>
            <input
              type="text"
              defaultValue={roster.eventName || ''}
              onBlur={(e) => updateRosterField('eventName', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  e.target.blur(); // Trigger onBlur when Enter is pressed
                }
              }}
              className="event-name-input"
              placeholder="Event Name"
            />
          </div>
          <button 
            onClick={handleSaveRoster} 
            className="save-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Roster'}
          </button>
        </div>

        <div className="roster-edit-info">
          <div className="roster-info-card">
            <h3>Event Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Author:</strong> {roster.author || 'Unknown'}
              </div>
              <div className="info-item">
                <strong>Positions:</strong> {filledPositions}/{totalPositions} filled
              </div>
            </div>
          </div>
        </div>

        <div className="roster-parties-container">
          {roster.parties && roster.parties.length > 0 ? (
            roster.parties.map((party, partyIndex) => (
              <div key={partyIndex} className="party-section">
                <div className="party-header">
                  <input
                    type="text"
                    defaultValue={party.partyName || `Party ${partyIndex + 1}`}
                    onBlur={(e) => updatePartyField(partyIndex, 'partyName', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        e.target.blur(); // Trigger onBlur when Enter is pressed
                      }
                    }}
                    className="party-name-input"
                    placeholder={`Party ${partyIndex + 1}`}
                  />
                  <textarea
                    defaultValue={partyIndex === 0 ? (roster.eventDescription || '') : (party.partyNotes || '')}
                    onBlur={(e) => {
                      if (partyIndex === 0) {
                        updateRosterField('eventDescription', e.target.value);
                      } else {
                        updatePartyField(partyIndex, 'partyNotes', e.target.value);
                      }
                    }}
                    className="party-notes-input"
                    placeholder={partyIndex === 0 ? "Event description..." : "Party notes..."}
                    rows={2}
                  />
                </div>
                <table className="view-roster-table edit-table">
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
                        <PositionRow
                          key={`roster-${roster.id || 'new'}-party-${partyIndex}-pos-${posIndex}`}
                          partyIndex={partyIndex}
                          position={position}
                          posIndex={posIndex}
                          roleOptions={roleOptions}
                          getWeaponOptionsForRole={getWeaponOptionsForRole}
                          headOptions={headOptions}
                          chestOptions={chestOptions}
                          bootsOptions={bootsOptions}
                          updatePositionField={updatePositionField}
                          handlePlayerNameDirectChange={handlePlayerNameDirectChange}
                          handleBuildNotesDirectChange={handleBuildNotesDirectChange}
                          safeGetEquipmentItems={safeGetEquipmentItems}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-positions">No positions defined</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="no-parties">No parties defined for this roster</div>
          )}
        </div>

        <div className="save-actions-bottom">
          <button 
            onClick={handleSaveRoster} 
            className="save-btn-large"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Roster'}
          </button>
        </div>
      </div>
    );
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
      {viewMode === 'edit' && editingRoster ? (
        <RosterEditView roster={editingRoster} />
      ) : viewMode === 'detail' && selectedRoster ? (
        <RosterDetailView roster={selectedRoster} />
      ) : (
        <>
          <div className="manage-rosters-header">
            <h2 className="manage-rosters-title">Manage Rosters</h2>
            
            <div className="manage-rosters-actions">
              <button onClick={onBack} className="back-button">← Back to Admin</button>
              
              <div className="header-controls">
                <select 
                  className="author-filter"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                >
                  <option value="">All Authors</option>
                  {uniqueAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
                <p className="roster-count">{filteredRosters.length} roster{filteredRosters.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
          </div>

          <div className="rosters-grid">
            {filteredRosters.length === 0 ? (
              <div className="no-rosters">
                <p>{authorFilter ? `No rosters found for author "${authorFilter}".` : 'No rosters found in the database.'}</p>
              </div>
            ) : (
              filteredRosters.map((roster) => (
                <div
                  key={roster.id}
                  className="roster-card-container"
                >
                  <button
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
                  <div className="roster-buttons">
                    <div className="roster-buttons-left">
                      <button
                        className="delete-roster-btn"
                        onClick={(e) => handleDeleteClick(roster, e)}
                      >
                        Delete
                      </button>
                      <button
                        className="edit-roster-btn"
                        onClick={(e) => handleEditClick(roster, e)}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="roster-buttons-right">
                      <button
                        className="make-live-btn"
                        onClick={(e) => handleMakeLiveClick(roster, e)}
                      >
                        Make Live
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <MakeLiveConfirmDialog />
      <DeleteRosterConfirmDialog />
      {showSuccessMessage && <div className="success-msg">Success!</div>}
    </div>
  );
};

export default ManageRosters;
