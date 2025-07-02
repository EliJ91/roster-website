import React, { useState } from 'react';
import { weaponOptions, buildDetails } from '../data/weaponOptions';

const SignupModal = ({ open, onClose }) => {
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [showBuild, setShowBuild] = useState(null); // weapon name or null

  const handleWeaponToggle = (weapon) => {
    setSelectedWeapons((prev) =>
      prev.includes(weapon)
        ? prev.filter((w) => w !== weapon)
        : [...prev, weapon]
    );
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
          minWidth: 400,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          fontFamily: 'Segoe UI, Arial, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 15, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>×</button>
        <h2 style={{ marginTop: 0, fontWeight: 600, color: '#3730a3', fontFamily: 'Segoe UI, Arial, sans-serif' }}>Sign Up for Roster</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: 18, color: '#444' }}>Select Weapons:</strong>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem 1.5rem',
              marginTop: 12,
            }}
          >
            {weaponOptions.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, cursor: 'pointer', fontWeight: 500, color: '#373737' }}>
                <input
                  type="checkbox"
                  checked={selectedWeapons.includes(opt.value)}
                  onChange={() => handleWeaponToggle(opt.value)}
                  style={{ accentColor: '#6366f1', width: 16, height: 16 }}
                />
                <span
                  style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                  onClick={() => setShowBuild(opt.value)}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <button
          style={{
            marginTop: 10,
            padding: '0.5rem 1.5rem',
            borderRadius: 8,
            background: selectedWeapons.length === 0 ? '#888' : '#6366f1',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: selectedWeapons.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: 17,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            opacity: selectedWeapons.length === 0 ? 0.6 : 1,
            transition: 'background 0.2s, opacity 0.2s',
          }}
          disabled={selectedWeapons.length === 0}
          onClick={selectedWeapons.length === 0 ? undefined : onClose}
        >
          Sign Up
        </button>
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
