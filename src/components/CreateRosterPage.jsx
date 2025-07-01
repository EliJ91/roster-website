import React, { useState } from "react";
import { createEvent } from "../utils/firestoreEvents";
import UserProfile from './UserProfile';
import './styles.css';
import { ROLE_OPTIONS, WEAPON_OPTIONS_BY_ROLE, BUILD_NOTES_PLACEHOLDER } from '../data/rosterOptions';

// Default to 3 rosters, each with 20 positions
const defaultPositions = Array.from({ length: 20 }, () => ({ role: '', weapon: '', buildNotes: '' }));
const DEFAULT_ROSTER_COUNT = 3;

export default function CreateRosterPage({ currentUser }) {
  const [rosters, setRosters] = useState(
    Array.from({ length: DEFAULT_ROSTER_COUNT }, () => ({ name: '', description: '', positions: defaultPositions.map(p => ({ ...p })) }))
  );
  const [activeRosterIdx, setActiveRosterIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Add a new roster (max 5 for sanity)
  const addRoster = () => {
    if (rosters.length >= 5) return;
    setRosters([...rosters, { name: '', description: '', positions: defaultPositions }]);
    setActiveRosterIdx(rosters.length);
  };

  // Remove a roster
  const removeRoster = (idx) => {
    if (rosters.length === 1) return;
    const newRosters = rosters.filter((_, i) => i !== idx);
    setRosters(newRosters);
    setActiveRosterIdx(0);
  };

  // Update roster fields
  const updateRosterField = (idx, field, value) => {
    const newRosters = [...rosters];
    newRosters[idx][field] = value;
    setRosters(newRosters);
  };

  // Update a position in the roster
  const updatePosition = (posIdx, field, value) => {
    const newRosters = [...rosters];
    newRosters[activeRosterIdx].positions[posIdx][field] = value;
    setRosters(newRosters);
  };

  // Remove a position from a party
  const removePosition = (partyIdx, posIdx) => {
    const newRosters = [...rosters];
    newRosters[activeRosterIdx].parties[partyIdx].positions.splice(posIdx, 1);
    setRosters(newRosters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      for (const r of rosters) {
        await createEvent({
          author: currentUser?.discordId || "admin",
          name: r.name,
          description: r.description,
          parties: r.parties,
        });
      }
      setSuccess(true);
      setRosters([
        { name: '', description: '', positions: defaultPositions }
      ]);
      setActiveRosterIdx(0);
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
      <div className="roster-topbar">
        <div>
          <h1 className="conflict-army-heading">Create Roster</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="roster-form">
        <div className="roster-form-row">
          <div className="roster-author-col">
            <label className="roster-author-label">Author:</label>
            <input
              className="roster-author-input"
              value={
                (currentUser?.nickname || currentUser?.displayName || currentUser?.username || 'Unknown')
                  .replace(/^(\w)/, c => c.toUpperCase())
              }
              disabled
              readOnly
            />
          </div>
          <div className="roster-event-col">
            <label className="roster-label">Event Name:</label>
            <input
              className="roster-event-input"
              value={rosters[activeRosterIdx].name}
              onChange={e => updateRosterField(activeRosterIdx, 'name', e.target.value)}
              required
            />
          </div>
          <div className="roster-notes-col">
            <textarea
              placeholder="Write your notes here..."
              value={rosters[activeRosterIdx].description}
              onChange={e => updateRosterField(activeRosterIdx, 'description', e.target.value)}
            />
          </div>
        </div>
        <div className="roster-table-container">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Weapon</th>
                <th>Build Notes</th>
              </tr>
            </thead>
            <tbody>
              {rosters[activeRosterIdx].positions.map((pos, posIdx) => {
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
                        onChange={e => updatePosition(posIdx, 'role', e.target.value)}
                        required
                        className={roleClass}
                      >
                        <option value="">-- Select Role --</option>
                        {ROLE_OPTIONS.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={pos.weapon || ''}
                        onChange={e => updatePosition(posIdx, 'weapon', e.target.value)}
                        required
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
                        onChange={e => updatePosition(posIdx, 'buildNotes', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="roster-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
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
        {success && <div className="success-msg">Rosters created!</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
}
