import React, { useState } from "react";
import { createEvent } from "../utils/firestoreEvents";
import UserProfile from './UserProfile';
import backgroundSmoke from '../assets/backgroundSmoke.mp4';

const defaultParties = [
  { partyName: "Party 1", positions: [] },
  { partyName: "Party 2", positions: [] },
  { partyName: "Party 3", positions: [] },
  { partyName: "Party 4", positions: [] },
];

export default function CreateRosterPage({ currentUser }) {
  const [rosters, setRosters] = useState([
    { name: '', description: '', parties: defaultParties.map(p => ({ ...p, positions: [] })) }
  ]);
  const [activeRosterIdx, setActiveRosterIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Add a new roster (max 5 for sanity)
  const addRoster = () => {
    if (rosters.length >= 5) return;
    setRosters([...rosters, { name: '', description: '', parties: defaultParties.map(p => ({ ...p, positions: [] })) }]);
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

  // Add a position to a party
  const addPosition = (partyIdx) => {
    const newRosters = [...rosters];
    newRosters[activeRosterIdx].parties[partyIdx].positions.push({ role: '', requiredGear: '', signedUpUser: null });
    setRosters(newRosters);
  };

  // Update a position in a party
  const updatePosition = (partyIdx, posIdx, field, value) => {
    const newRosters = [...rosters];
    newRosters[activeRosterIdx].parties[partyIdx].positions[posIdx][field] = value;
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
        { name: '', description: '', parties: defaultParties.map(p => ({ ...p, positions: [] })) }
      ]);
      setActiveRosterIdx(0);
    } catch (err) {
      setError("Failed to create roster: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Smoke video background, behind everything */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={backgroundSmoke}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2,
          pointerEvents: 'none',
          background: '#000',
        }}
      />
      <div className="create-roster-page">
        <UserProfile />
        <h2>Create New Event Rosters</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {rosters.map((r, idx) => (
            <button
              key={idx}
              type="button"
              className={idx === activeRosterIdx ? 'active' : ''}
              style={{ fontWeight: idx === activeRosterIdx ? 700 : 400 }}
              onClick={() => setActiveRosterIdx(idx)}
            >
              Roster {idx + 1}
              {rosters.length > 1 && (
                <span style={{ marginLeft: 6, color: '#dc2626', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removeRoster(idx); }}>×</span>
              )}
            </button>
          ))}
          {rosters.length < 5 && (
            <button type="button" onClick={addRoster} style={{ color: '#059669', fontWeight: 700 }}>+ Add Roster</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Event Name:
            <input value={rosters[activeRosterIdx].name} onChange={e => updateRosterField(activeRosterIdx, 'name', e.target.value)} required />
          </label>
          <label>
            Description:
            <textarea value={rosters[activeRosterIdx].description} onChange={e => updateRosterField(activeRosterIdx, 'description', e.target.value)} />
          </label>
          <div className="parties-section">
            {rosters[activeRosterIdx].parties.map((party, pIdx) => (
              <div key={party.partyName} className="party-block">
                <h3>{party.partyName}</h3>
                {party.positions.map((pos, posIdx) => (
                  <div key={posIdx} className="position-row">
                    <input
                      placeholder="Role (e.g. Healer)"
                      value={pos.role}
                      onChange={e => updatePosition(pIdx, posIdx, "role", e.target.value)}
                      required
                    />
                    <input
                      placeholder="Required Gear (e.g. Fallenstaff)"
                      value={pos.requiredGear}
                      onChange={e => updatePosition(pIdx, posIdx, "requiredGear", e.target.value)}
                    />
                    <button type="button" onClick={() => removePosition(pIdx, posIdx)}>
                      Remove
                    </button>
                  </div>
                ))}
                {party.positions.length < 5 && (
                  <button type="button" onClick={() => addPosition(pIdx)}>
                    + Add Position
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Rosters"}
          </button>
          {success && <div className="success-msg">Rosters created!</div>}
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  );
}
