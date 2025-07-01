import React, { useState, useEffect } from "react";
import { createRoster } from "../utils/firestoreEvents";
import UserProfile from './UserProfile';
import { ROLE_OPTIONS, WEAPON_OPTIONS_BY_ROLE, BUILD_NOTES_PLACEHOLDER } from '../data/rosterOptions';

// Default to 1 roster, each with 20 positions
const defaultPositions = Array.from({ length: 20 }, () => ({ role: '', weapon: '', buildNotes: '' }));
const DEFAULT_ROSTER_COUNT = 1;

// Add Main Caller and Backup Caller to the roles list
const ROLE_OPTIONS_WITH_CALLERS = [
  'Main Caller',
  'Backup Caller',
  ...ROLE_OPTIONS.filter(r => r !== 'Main Caller' && r !== 'Backup Caller')
];

export default function CreateRosterPage({ currentUser }) {
  const [rosters, setRosters] = useState(
    Array.from({ length: DEFAULT_ROSTER_COUNT }, () => ({ name: '', description: '', positions: defaultPositions.map(p => ({ ...p })) }))
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  // Add a new roster (max 5 for sanity)
  const addRoster = () => {
    if (rosters.length >= 5) return;
    setRosters([
      ...rosters,
      { name: '', description: '', positions: defaultPositions.map(p => ({ ...p })) }
    ]);
  };

  // Remove a roster
  const removeRoster = (idx) => {
    if (rosters.length === 1) return;
    const newRosters = rosters.filter((_, i) => i !== idx);
    setRosters(newRosters);
  };

  // Update roster fields
  const updateRosterField = (idx, field, value) => {
    const newRosters = [...rosters];
    newRosters[idx][field] = value;
    setRosters(newRosters);
  };

  // Update a position in the roster
  const updatePosition = (rosterIdx, posIdx, field, value) => {
    const newRosters = [...rosters];
    newRosters[rosterIdx].positions[posIdx][field] = value;
    setRosters(newRosters);
  };

  // Remove a position from a party
  const removePosition = (partyIdx, posIdx) => {
    const newRosters = [...rosters];
    newRosters[0].parties[partyIdx].positions.splice(posIdx, 1);
    setRosters(newRosters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Get event name and description from first roster
      const eventName = rosters[0].eventName || '';
      const eventDescription = rosters[0].description || '';
      
      // Validate required fields
      if (!eventName || eventName.trim() === '') {
        throw new Error('Event name is required');
      }
      
      // Convert rosters to parties format and filter out empty positions
      const parties = rosters.map((roster, idx) => ({
        name: idx === 0 ? 'Main Party' : roster.name,
        description: roster.description || '',
        positions: roster.positions.filter(pos => 
          pos.role && pos.role.trim() !== '' && 
          pos.weapon && pos.weapon.trim() !== ''
        )
      }));

      // Validate that we have at least one position
      const totalPositions = parties.reduce((sum, party) => sum + party.positions.length, 0);
      if (totalPositions === 0) {
        throw new Error('Please add at least one position with role and weapon selected');
      }

      const rosterData = {
        author: currentUser?.discordId || currentUser?.username || currentUser?.id || "admin",
        eventName: eventName,
        eventDescription: eventDescription,
        parties: parties,
        createdBy: currentUser ? {
          discordId: currentUser.discordId,
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          nickname: currentUser.nickname,
          nick: currentUser.nick
        } : null
      };

      const rosterId = await createRoster(rosterData);
      
      setSuccess(true);
      // Reset form
      setRosters([
        { name: '', description: '', positions: defaultPositions.map(p => ({ ...p })) }
      ]);
    } catch (err) {
      setError("Failed to create roster: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="create-roster-page">
      <div className="user-profile-bar">
        <UserProfile />
      </div>
      <div className="create-roster-topbar">
        <div>
          <h1 className="create-roster-heading">Create Roster</h1>
        </div>
      </div>
      <div className="create-roster-card">
        <form onSubmit={handleSubmit} className="create-roster-form">
        <div className="create-roster-form-row">
          <div className="create-roster-author-col">
            <label className="create-roster-author-label">Author:</label>
            <input
              className="create-roster-author-input"
              value={
                (currentUser?.nickname || currentUser?.displayName || currentUser?.username || 'Unknown')
                  .replace(/^(\\w)/, c => c.toUpperCase())
              }
              disabled
              readOnly
            />
          </div>
          <div className="create-roster-event-col">
            <label className="create-roster-label">Event Name:</label>
            <input
              className="create-roster-event-input"
              value={rosters[0].eventName || ''}
              onChange={e => {
                const newRosters = [...rosters];
                newRosters[0].eventName = e.target.value;
                setRosters(newRosters);
              }}
              required
              placeholder="Event Name"
            />
          </div>
          <div className="create-roster-notes-col">
            <textarea
              placeholder="Write your notes here..."
              value={rosters[0].description}
              onChange={e => updateRosterField(0, 'description', e.target.value)}
            />
          </div>
        </div>
        {rosters.map((roster, idx) => (
          <div key={idx} className="create-roster-table-container" style={{ marginBottom: 32, marginTop: idx === 0 ? 8 : 32 }}>
            <div className="create-roster-form-row">
              {idx === 0 ? null : (
                <>
                  <div className="create-roster-event-col">
                    <label className="create-roster-label">Party Name:</label>
                    <input
                      className="create-roster-event-input"
                      value={roster.name}
                      onChange={e => updateRosterField(idx, 'name', e.target.value)}
                      required
                      placeholder="Party Name"
                    />
                  </div>
                  <div className="create-roster-notes-col">
                    <textarea
                      placeholder="Write your notes here..."
                      value={roster.description}
                      onChange={e => updateRosterField(idx, 'description', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <table className="create-roster-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Weapon</th>
                  <th>Build Notes</th>
                </tr>
              </thead>
              <tbody>
                {roster.positions.map((pos, posIdx) => {
                  const weaponOptions = WEAPON_OPTIONS_BY_ROLE[pos.role] || [];
                  let roleClass = 'role-pill';
                  if (["main caller", "battlemount"].includes((pos.role || '').toLowerCase())) {
                    roleClass += ' role-main-caller';
                  }
                  return (
                    <tr key={posIdx}>
                      <td>
                        <select
                          value={pos.role}
                          onChange={e => updatePosition(idx, posIdx, 'role', e.target.value)}
                          className={roleClass}
                        >
                          <option value="">-- Select Role --</option>
                          {ROLE_OPTIONS_WITH_CALLERS.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={pos.weapon || ''}
                          onChange={e => updatePosition(idx, posIdx, 'weapon', e.target.value)}
                        >
                          <option value="">-- Select Weapon --</option>
                          {weaponOptions.map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <textarea
                          placeholder={BUILD_NOTES_PLACEHOLDER}
                          value={pos.buildNotes}
                          onChange={e => updatePosition(idx, posIdx, 'buildNotes', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        <div className="create-roster-actions" style={{ marginTop: 0 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving to Database..." : "Save Roster"}
          </button>
          {rosters.length < 5 && (
            <button
              type="button"
              onClick={addRoster}
              title="Add a Roster"
            >
              <span>+</span>
            </button>
          )}
        </div>
        {success && <div className="success-msg">Roster saved to database successfully!</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
      </div>
    </div>
  );
}
