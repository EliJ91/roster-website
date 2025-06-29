import React, { useEffect, useState } from 'react';

const mockRosterData = [
  {
    role: 'Tank',
    weapon: 'Grovekeeper',
    player: 'IronShield#0420',
    build: 'Heavy Armor, Guardian Helmet, Cleric Robe',
  },
  {
    role: 'DPS',
    weapon: 'Siegebow',
    player: 'ArrowRain#1337',
    build: 'Hunter Hood, Mage Robe, Soldier Boots',
  },
  {
    role: 'Healer',
    weapon: 'Fallen Staff',
    player: 'DivineTouch#2023',
    build: 'Cleric Cowl, Cleric Robe, Scholar Sandals',
  },
  {
    role: 'Support',
    weapon: 'Locus Staff',
    player: 'AuraMaster#5567',
    build: 'Druid Cowl, Royal Robe, Cultist Sandals',
  },
];

const ViewRosterPage = () => {
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    // Replace with live fetch from backend in production
    setRoster(mockRosterData);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Current Live Roster</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Role</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Weapon</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Player</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Build</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((entry, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{entry.role}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{entry.weapon}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{entry.player}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{entry.build}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewRosterPage;
