import React, { useEffect, useState, useRef } from 'react';
import UserProfile from './UserProfile';
import SignupModal from './SignupModal';
import { FaTrash, FaArchive, FaUserClock, FaPlus, FaCog } from 'react-icons/fa';
import { GiToolbox } from 'react-icons/gi'; // open toolbox icon

const mockRosterData = [
	{
		role: 'Main Caller',
		weapon: 'Clump Tank',
		player: 'Elijxh',
		build: "Don't fucking die",
		nickname: '[CF] Elijxh',
	},
	{
		role: 'Tank',
		weapon: 'Heavy Mace',
		player: '',
		build: 'Hellion/Judi, Guardian',
		nickname: '[EI] IronShield',
	},
	{
		role: 'Tank',
		weapon: '1H Hammer',
		player: '',
		build: 'Judi/Hellion/Soldier, Duskweaver',
		nickname: '[EX] HammerGuy',
	},
	{
		role: 'Tank',
		weapon: 'GA (OFF)',
		player: '',
		build: 'Judi/Assassin/Hellion, Knight, Stalker/Cleric',
		nickname: '[SVG] AxeLord',
	},
	{
		role: 'Tank',
		weapon: 'Incubus Mace',
		player: '',
		build: 'Guard Rune/Snare Charge - HIT ELIJXH\'S CLUMP',
		nickname: '',
	},
	{
		role: 'Support',
		weapon: 'Lifecurse',
		player: '',
		build: 'Assassin, Demon, Graveguard',
		nickname: '[CF] SupportGuy',
	},
	{
		role: 'Support',
		weapon: 'Oathkeepers(OFF)',
		player: '',
		build: 'Assassin, Demon, Guardian',
		nickname: '',
	},
	{
		role: 'Support',
		weapon: 'Shadowcaller',
		player: '',
		build: 'Assassin, Demon, Stalker/Graveguard',
		nickname: '[SVG] Shadow',
	},
	{
		role: 'Support',
		weapon: 'Locus(DEF)',
		player: '',
		build: 'Assassin, Judi',
		nickname: '',
	},
	{
		role: 'Healer',
		weapon: 'Hallowfall',
		player: '',
		build: 'Merc(Cleanse), Purity, Stalker',
		nickname: '[CF] Healz',
	},
	{
		role: 'Healer',
		weapon: 'Blight',
		player: '',
		build: 'Assassin, Purity, Stalker',
		nickname: '[EI] Blighty',
	},
	{
		role: 'Mdps',
		weapon: 'Spirithunter',
		player: '',
		build: 'Knight, Judi, Stalker/Valor',
		nickname: '[EX] Spear',
	},
	{
		role: 'Mdps',
		weapon: 'Spiked',
		player: '',
		build: 'Q2 | E the CLUMP | Morgana Cape(t7e+) | T9+ Weapon | T10+ Weapon has prio',
		nickname: '',
	},
	{
		role: 'Mdps',
		weapon: 'Realmbreaker',
		player: '',
		build: 'Knight, Hellion, Stalker/Valor',
		nickname: '[SVG] Realm',
	},
	{
		role: 'Rdps',
		weapon: 'Siegebow',
		player: '',
		build: 'Hunter Hood, Mage Robe, Soldier Boots',
		nickname: '[CF] ArrowRain',
	},
	{
		role: 'Rdps',
		weapon: 'Boltcasters',
		player: '',
		build: 'Mage Cowl, Cleric Robe, Scholar Sandals',
		nickname: '[EX] Bolty',
	},
	{
		role: 'Rdps',
		weapon: 'Frost Staff',
		player: '',
		build: 'Scholar Cowl, Scholar Robe, Scholar Sandals',
		nickname: '[SVG] Frosty',
	},
	{
		role: 'Mdps',
		weapon: 'Infernal Scythe',
		player: '',
		build: 'Soldier, Hellion, Stalker/Valor',
		nickname: '',
	},
	{
		role: 'Mdps',
		weapon: 'Hellfire',
		player: '',
		build: 'Soldier, Hellion, Stalker/Valor',
		nickname: '',
	},
];

// Helper to get users who signed up for a weapon, excluding already assigned users
function getUsersForWeapon(weapon, assignedUserIds) {
	return fakeSignups.filter((u) => u.weapons.includes(weapon) && !assignedUserIds.includes(u.id));
}

// Helper to get guild tag from nickname
function getGuildTag(nickname) {
	if (!nickname) return null;
	const match = nickname.match(/\[[^\]]+\]/);
	return match ? match[0] : null;
}

// Helper to count guild tags
function getGuildTagCounts(signups) {
	const counts = {};
	signups.forEach((u) => {
		const tag = getGuildTag(u.nickname);
		if (tag) counts[tag] = (counts[tag] || 0) + 1;
	});
	return counts;
}

const ROLE_ORDER = [
  'Main Caller',
  'Tank',
  'Support',
  'Healer',
  'Mdps',
  'Rdps',
];

function getRoleOrder(role) {
  const idx = ROLE_ORDER.findIndex(
    r => r.toLowerCase() === role.toLowerCase()
  );
  return idx === -1 ? 99 : idx;
}

const ViewRosterPage = () => {
	const [roster, setRoster] = useState([]);
	const [signupOpen, setSignupOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [selectedPlayers, setSelectedPlayers] = React.useState({});
	const [unassignedModalOpen, setUnassignedModalOpen] = useState(false);
	const [actionsOpen, setActionsOpen] = useState(false);
	const actionsRef = useRef();

	useEffect(() => {
		try {
			const storedUser = JSON.parse(localStorage.getItem('user'));
			setUser(storedUser);
		} catch (e) {
			setUser(null);
		}
	}, []);

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			setRoster(mockRosterData);
		} else {
			// Fetch live data from backend in production
			fetch('/api/roster')
				.then((res) => res.json())
				.then((data) => setRoster(data))
				.catch((err) => {
					console.error('Failed to fetch live roster:', err);
					setRoster([]);
				});
		}
	}, []);

	// Elevated check
	const ELEVATED_ROLE_ID = process.env.REACT_APP_ELEVATED_ROLE_ID;
	const isElevated =
		user &&
		user.guildRoles &&
		ELEVATED_ROLE_ID &&
		user.guildRoles.includes(ELEVATED_ROLE_ID);

	// Guild tag stats
	const guildTagCounts = {};
	let totalPlayers = 0;
	roster.forEach((entry) => {
		// Assume entry.nickname is available from backend, otherwise fallback to player name
		const tag = getGuildTag(entry.nickname || entry.player);
		if (tag) {
			guildTagCounts[tag] = (guildTagCounts[tag] || 0) + 1;
		}
		totalPlayers++;
	});

	// Live guild tag stats from signups
	const liveGuildTagCounts = getGuildTagCounts(fakeSignups);

	function handleSelectPlayer(rowIdx, userId) {
		setSelectedPlayers((prev) => ({ ...prev, [rowIdx]: userId }));
	}

	// Sort roster by role order before rendering
	const sortedRoster = [...roster].sort((a, b) => {
		const aOrder = getRoleOrder(a.role);
		const bOrder = getRoleOrder(b.role);
		if (aOrder !== bOrder) return aOrder - bOrder;
		// If same role, keep original order or sort by weapon
		return a.weapon.localeCompare(b.weapon);
	});

	// Find users who have signed up but are not assigned to any role
	const assignedUserIds = Object.values(selectedPlayers).filter(Boolean);
	const unassignedSignups = fakeSignups.filter(
		u => !assignedUserIds.includes(u.id)
	);

	// Close menu on outside click
	useEffect(() => {
		if (!actionsOpen) return;
		function handleClick(e) {
			if (actionsRef.current && !actionsRef.current.contains(e.target)) {
				setActionsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [actionsOpen]);

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
			<UserProfile />
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '0.75rem', // was 1.5rem, now half
					width: '80%',
					maxWidth: 1200,
				}}
			>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem' }}>
                    <h1 className="conflict-army-heading" style={{ margin: 0 }}>Conflict Army</h1>
                    {isElevated && (
                        <div
                          className="actions-hamburger-container"
                          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                          ref={actionsRef}
                        >
                          <button
                            title="Show Tools"
                            className="icon-btn"
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, padding: '0.5rem', cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'flex-end' }}
                            onClick={() => setActionsOpen((open) => !open)}
                            aria-expanded={actionsOpen}
                            aria-label={actionsOpen ? 'Close tools' : 'Show tools'}
                          >
                            <span className={`gear-icon${actionsOpen ? ' open' : ' closed'}`}>
                              <FaCog />
                            </span>
                          </button>
                          <div
                            className={`actions-collapse${actionsOpen ? ' open' : ''}`}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              display: actionsOpen ? 'flex' : 'none',
                              flexDirection: 'row',
                              gap: '0.3rem',
                              background: 'none',
                              borderRadius: 8,
                              boxShadow: 'none',
                              padding: '0.3rem 0.7rem',
                              zIndex: 10,
                              alignItems: 'center',
                              minWidth: 0,
                              maxWidth: actionsOpen ? 400 : 0,
                              opacity: 1,
                              pointerEvents: actionsOpen ? 'auto' : 'none',
                              transform: actionsOpen ? 'translateX(48px)' : 'translateX(0)',
                              transition: 'transform 0.32s cubic-bezier(.7,1.7,.5,1), max-width 0.32s cubic-bezier(.7,1.7,.5,1)',
                            }}
                          >
                            <button
                              title="Clear Roster"
                              className="icon-btn"
                              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 22, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
                              onClick={() => setActionsOpen(false)}
                            >
                              <FaTrash />
                            </button>
                            <button
                              title="Archive Roster"
                              className="icon-btn"
                              style={{ background: 'none', border: 'none', color: '#a16207', fontSize: 22, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
                              onClick={() => setActionsOpen(false)}
                            >
                              <FaArchive />
                            </button>
                            <button
                              title="Show Unassigned Players"
                              className="icon-btn"
                              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 22, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
                              onClick={() => { setUnassignedModalOpen(true); setActionsOpen(false); }}
                            >
                              <FaUserClock />
                            </button>
                            <button
                              title="Create New Roster"
                              className="icon-btn"
                              style={{ background: 'none', border: 'none', color: '#059669', fontSize: 22, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
                              onClick={() => { window.location.href = '/create-roster'; setActionsOpen(false); }}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                    )}
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    <button
                        onClick={() => setSignupOpen(true)}
                        className="signup-btn"
                    >
                        Sign Up
                    </button>
                    {isElevated && (
                        <div
                            style={{
                                marginLeft: '2rem',
                                fontWeight: 600,
                            }}
                        >
                            Total Players: {totalPlayers}
                            {Object.keys(liveGuildTagCounts).length > 0 && (
                                <span style={{ marginLeft: '1rem' }}>
                                    {Object.entries(liveGuildTagCounts).map(
                                        ([tag, count]) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    marginRight: '1rem',
                                                }}
                                            >
                                                {tag}: {count}
                                            </span>
                                        )
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
			<SignupModal
				open={signupOpen}
				onClose={() => setSignupOpen(false)}
			/>
			<table className="roster-table"
				style={{ width: '80%', maxWidth: 1200 }}
			>
				<thead>
					<tr>
						<th>Role</th>
						<th>Weapon</th>
						<th>Player</th>
						<th>Build</th>
					</tr>
				</thead>
				<tbody>
					{sortedRoster.map((entry, index) => (
						<tr key={index}>
							<td>
            {entry.role === 'Main Caller' ? (
              <span className="role-pill role-main-caller">{entry.role}</span>
            ) : (
              <span className={`role-pill role-${entry.role.toLowerCase()}`}>{entry.role}</span>
            )}
          </td>
							<td>{entry.weapon}</td>
							<td>
          {isElevated ? (
            <select
              className={selectedPlayers[index] ? 'selected' : ''}
              style={{ minWidth: 220, maxWidth: 340, width: '100%', textAlign: 'center' }}
              value={selectedPlayers[index] || ''}
              onChange={e => handleSelectPlayer(index, e.target.value)}
            >
              <option value="">-- Select Player --</option>
              {selectedPlayers[index]
                ? (() => {
                    // Show the selected user as the first option
                    const selectedUser = fakeSignups.find(u => u.id === selectedPlayers[index]);
                    return selectedUser ? [
                      <option key={selectedUser.id} value={selectedUser.id}>{selectedUser.nickname}</option>,
                      ...getUsersForWeapon(entry.weapon, assignedUserIds).filter(u => u.id !== selectedUser.id).map(u => (
                        <option key={u.id} value={u.id}>{u.nickname}</option>
                      ))
                    ] : getUsersForWeapon(entry.weapon, assignedUserIds).map(u => (
                      <option key={u.id} value={u.id}>{u.nickname}</option>
                    ));
                  })()
                : getUsersForWeapon(entry.weapon, assignedUserIds).map(u => (
                    <option key={u.id} value={u.id}>{u.nickname}</option>
                  ))}
            </select>
          ) : (
            entry.player
          )}
        </td>
							<td style={{ textAlign: 'left' }}>{entry.build}</td>
						</tr>
					))}
				</tbody>
			</table>
			{unassignedModalOpen && (
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
                    zIndex: 2000,
                }}
                onClick={e => { if (e.target === e.currentTarget) setUnassignedModalOpen(false); }}
            >
                <div
                    style={{
                        background: '#23232a',
                        color: '#f3f4f6',
                        borderRadius: '1.2rem',
                        padding: '1.2rem 1.5rem',
                        minWidth: 320,
                        maxWidth: 420,
                        maxHeight: '55vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        position: 'relative',
                    }}
                    className="unassigned-modal"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={() => setUnassignedModalOpen(false)}
                        style={{ position: 'absolute', top: 10, right: 15, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}
                    >
                        ×
                    </button>
                    <h2 style={{ marginTop: 0, fontWeight: 600, color: '#a5b4fc' }}>Unassigned</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {unassignedSignups.length === 0 ? (
                            <li style={{ color: '#aaa', fontStyle: 'italic' }}>All signed up players have been assigned.</li>
                        ) : (
                            unassignedSignups.map(u => (
                                <li key={u.id} style={{ marginBottom: 12, padding: 8, background: '#18181b', borderRadius: 8 }}>
                                    <strong>{u.nickname}</strong>
                                    <div style={{ fontSize: 15, marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {u.weapons.map(w => {
                                            // Determine text color for role
                                            let color = '#f3f4f6';
                                            const lower = w.toLowerCase();
                                            if (lower.includes('tank')) color = '#2563eb';
                                            else if (lower.includes('healer') || lower.includes('blight') || lower.includes('hallowfall')) color = '#059669';
                                            else if (lower.includes('support') || lower.includes('locus') || lower.includes('shadowcaller') || lower.includes('oathkeeper')) color = '#eab308';
                                            else if (lower.includes('bow') || lower.includes('frost') || lower.includes('bolt') || lower.includes('rdps')) color = '#f59e42';
                                            else if (lower.includes('spear') || lower.includes('scythe') || lower.includes('breaker') || lower.includes('mdps') || lower.includes('mace') || lower.includes('hammer') || lower.includes('ga')) color = '#dc2626';
                                            else color = '#a5b4fc';
                                            return (
                                                <span key={w} style={{ color, fontWeight: 700, marginRight: 8 }}>{w}</span>
                                            );
                                        })}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        )}
		</div>
	);
};

// CSS for color fade only (no spin)
const gearSpinStyles = `
.gear-icon {
  font-size: 22px !important;
  transition: color 0.32s, transform 0.18s cubic-bezier(.7,1.7,.5,1);
  display: inline-block;
}
.gear-icon.open {
  color: #eab308 !important;
}
.gear-icon.closed {
  color: #fff !important;
}
.icon-btn:hover .gear-icon, .icon-btn:focus .gear-icon {
  transform: scale(1.22);
  z-index: 2;
}
`;
if (typeof document !== 'undefined' && !document.getElementById('gear-spin-styles')) {
  const style = document.createElement('style');
  style.id = 'gear-spin-styles';
  style.innerHTML = gearSpinStyles;
  document.head.appendChild(style);
}

// Pseudo list of Discord users who have signed up for specific weapons
const fakeSignups = [
  { id: '1', nickname: '[CF] Elijxh', weapons: ['Clump Tank', '1H Hammer', 'Hallowfall'] },
  { id: '2', nickname: '[EI] IronShield', weapons: ['Heavy Mace', 'Incubus Mace'] },
  { id: '3', nickname: '[SVG] AxeLord', weapons: ['GA (OFF)', 'Spirithunter'] },
  { id: '4', nickname: '[EX] HammerGuy', weapons: ['1H Hammer', 'Realmbreaker'] },
  { id: '5', nickname: '[CF] Healz', weapons: ['Hallowfall', 'Lifecurse'] },
  { id: '6', nickname: '[SVG] Shadow', weapons: ['Shadowcaller', 'Locus(DEF)'] },
  { id: '7', nickname: '[EX] Bolty', weapons: ['Boltcasters', 'Siegebow'] },
  { id: '8', nickname: '[EI] Blighty', weapons: ['Blight', 'Lifecurse'] },
  { id: '9', nickname: '[SVG] Frosty', weapons: ['Frost Staff'] },
  { id: '10', nickname: '[CF] SupportGuy', weapons: ['Lifecurse', 'Oathkeepers(OFF)'] },
  { id: '11', nickname: '[SVG] Realm', weapons: ['Realmbreaker'] },
  { id: '12', nickname: '[CF] ArrowRain', weapons: ['Siegebow'] },
  { id: '13', nickname: '[EX] Spear', weapons: ['Spirithunter'] },
  { id: '14', nickname: '[SVG] afatfuckingfailure', weapons: ['Incubus Mace', 'Hellfire'] },
  { id: '15', nickname: '[EI] Tanky', weapons: ['Heavy Mace', 'GA (OFF)'] },
];

export default ViewRosterPage;
