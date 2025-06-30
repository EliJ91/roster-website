import React, { useState } from "react";
import { createEvent } from "../utils/firestoreEvents";
import UserProfile from './UserProfile';
import backgroundSmoke from '../assets/backgroundSmoke.mp4';
import { ROLE_OPTIONS, WEAPON_OPTIONS_BY_ROLE, BUILD_NOTES_PLACEHOLDER } from '../data/rosterOptions';

// Remove defaultParties and use a single roster with 20 positions
const defaultPositions = Array.from({ length: 20 }, () => ({ role: '', weapon: '', buildNotes: '' }));

export default function CreateRosterPage({ currentUser }) {
  const [rosters, setRosters] = useState([
    { name: '', description: '', positions: defaultPositions }
  ]);
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
    <div
      style={{
        padding: '2rem',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          border: '2px solid #e11d48',
        }}
      >
        <UserProfile style={{ border: '2px solid #0ea5e9' }} />
      </div>
      <div style={{ height: '2.5rem', border: '2px solid #f59e42' }} />
      <div
        className="roster-topbar"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          marginBottom: '0.75rem',
          width: '100%',
          maxWidth: 1200,
          gap: 0,
          flexWrap: 'wrap',
          padding: 0,
          border: '2px solid #22c55e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flex: 0, marginLeft: 'auto', border: '2px solid #7c3aed' }}>
          <h1 className="conflict-army-heading" style={{ margin: 0, display: 'block', border: '2px solid #f472b6', borderRadius: 4, textAlign: 'center', width: '100%' }}>Create Roster</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18, gap: 16 }}>
          <label style={{ fontWeight: 700, color: '#a5b4fc', fontSize: 18, marginRight: 8, minWidth: 90, textAlign: 'right' }}>Event:</label>
          <input
            value={rosters[activeRosterIdx].name}
            onChange={e => updateRosterField(activeRosterIdx, 'name', e.target.value)}
            required
            style={{
              flex: 1,
              fontSize: 18,
              borderRadius: 8,
              border: '2px solid #6366f1',
              padding: '0.5em 1em',
              background: '#23232a',
              color: '#f3f4f6',
              fontWeight: 600,
              boxShadow: '0 2px 8px #0002',
              outline: 'none',
              minWidth: 220,
              maxWidth: 420,
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, color: '#a5b4fc', fontSize: 16, marginBottom: 4, display: 'block' }}>Description:</label>
          <textarea
            value={rosters[activeRosterIdx].description}
            onChange={e => updateRosterField(activeRosterIdx, 'description', e.target.value)}
            style={{
              width: '100%',
              minHeight: 48,
              fontSize: 15,
              borderRadius: 8,
              border: '2px solid #6366f1',
              padding: '0.5em 1em',
              background: '#23232a',
              color: '#f3f4f6',
              fontWeight: 500,
              boxShadow: '0 2px 8px #0002',
              outline: 'none',
              resize: 'vertical',
              maxWidth: 600,
            }}
          />
        </div>
        <div style={{ width: '100%', maxWidth: 1200, overflowX: 'auto' }}>
          <table className="roster-table" style={{ minWidth: 600, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Role</th>
                <th style={{ minWidth: 120 }}>Weapon</th>
                <th style={{ minWidth: 180 }}>Build Notes</th>
              </tr>
            </thead>
            <tbody>
              {rosters[activeRosterIdx].positions.map((pos, posIdx) => {
                const weaponOptions = WEAPON_OPTIONS_BY_ROLE[pos.role] || [];
                let roleClass = 'role-pill';
                let mainCallerStyle = undefined;
                switch ((pos.role || '').toLowerCase()) {
                  case 'main caller':
                  case 'battlemount':
                    roleClass += ' role-main-caller';
                    mainCallerStyle = {
                      color: '#fffbe6',
                      textShadow: '0 0 6px #fbbf24, 0 0 2px #fff',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      fontSize: '1.04em',
                      border: '1.5px solid #fbbf24',
                      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)',
                      boxShadow: '0 0 6px #fbbf24cc',
                      padding: '0.22em 0.5em',
                      minWidth: 110,
                      filter: 'brightness(1.08)',
                      textTransform: 'none',
                      borderRadius: '1.2em',
                    };
                    break;
                  case 'tanks':
                  case 'tank':
                    roleClass += ' role-tank';
                    break;
                  case 'support':
                    roleClass += ' role-support';
                    break;
                  case 'healers':
                  case 'healer':
                    roleClass += ' role-healer';
                    break;
                  case 'mdps':
                    roleClass += ' role-mdps';
                    break;
                  case 'rdps':
                    roleClass += ' role-rdps';
                    break;
                  default:
                    break;
                }
                return (
                  <tr key={posIdx}>
                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={pos.role}
                        onChange={e => updatePosition(posIdx, 'role', e.target.value)}
                        required
                        className={roleClass}
                        style={mainCallerStyle}
                      >
                        <option value="">-- Select Role --</option>
                        {ROLE_OPTIONS.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontWeight: 700, color: '#f59e42', textAlign: 'center', background: '#18181b' }}>
                      <select
                        value={pos.weapon || ''}
                        onChange={e => updatePosition(posIdx, 'weapon', e.target.value)}
                        required
                        style={{ minWidth: 120, maxWidth: 220, width: '100%', textAlign: 'center', fontWeight: 700, borderRadius: '1.2em', background: '#23232a', color: '#f59e42', border: 'none', boxShadow: '0 1px 4px #0002' }}
                      >
                        <option value="">-- Select Weapon --</option>
                        {weaponOptions.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ color: '#f3f4f6', fontSize: 14, textAlign: 'center', background: '#18181b' }}>
                      <textarea
                        placeholder={BUILD_NOTES_PLACEHOLDER}
                        value={pos.buildNotes || ''}
                        onChange={e => updatePosition(posIdx, 'buildNotes', e.target.value)}
                        style={{
                          width: 'calc(100% - 8px)',
                          minWidth: 0,
                          maxWidth: '100%',
                          fontSize: 14,
                          borderRadius: 8,
                          padding: '0.5em 0.7em',
                          background: '#23232a',
                          color: '#f3f4f6',
                          border: '1.5px solid #6366f1',
                          resize: 'vertical',
                          margin: 4,
                        }}
                        rows={2}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Creating..." : "Create Roster"}
        </button>
        {success && <div className="success-msg">Rosters created!</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
}
