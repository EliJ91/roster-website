import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
	const navigate = useNavigate();
	const [roster, setRoster] = useState([]);
	const [signupOpen, setSignupOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [selectedPlayers, setSelectedPlayers] = React.useState({});
	const [unassignedModalOpen, setUnassignedModalOpen] = useState(false);
	const [actionsOpen, setActionsOpen] = useState(false);
	const actionsRef = useRef();
	const actionsMenuRef = useRef();

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
			if (
				actionsRef.current && actionsRef.current.contains(e.target)
			) {
				// Clicked the cog, let its onClick handle toggle
				return;
			}
			if (
				actionsMenuRef.current && actionsMenuRef.current.contains(e.target)
			) {
				// Clicked inside the actions menu, do nothing
				return;
			}
			setActionsOpen(false);
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
			<div
				style={{
					width: '100%',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'flex-end',
					alignItems: 'flex-start',
					border: '2px solid #e11d48', // red
				}}
			>
				<UserProfile style={{ border: '2px solid #0ea5e9' }} /> {/* blue */}
			</div>
			<div style={{ height: '2.5rem', border: '2px solid #f59e42' }} /> {/* orange */}
			<div
				className="roster-topbar"
				style={{
					display: 'flex',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					marginBottom: '0.75rem',
					width: '100%',
					maxWidth: 1200,
					gap: 0,
					flexWrap: 'wrap',
					padding: 0,
					border: '2px solid #22c55e', // green
				}}
			>
				<div className="roster-actions-bar" style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'auto', flex: 'none', minWidth: 0, justifyContent: 'flex-start', padding: 0, margin: 0, border: '2px solid #a21caf' }}>
					<button
						className={"signup-btn signup-btn-mobile-left"}
						onClick={() => setSignupOpen(true)}
						style={{ marginRight: 0, marginLeft: 0, border: '2px solid #2563eb', background: '#111' }} // blue
					>
						Sign Up
					</button>
					{isElevated && (
					  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
					    <button
					      title="Show Tools"
					      className="icon-btn cogwheel-btn"
					      style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, padding: '0.5rem', cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', zIndex: 11 }}
					      onClick={e => { e.stopPropagation(); setActionsOpen((open) => !open); }}
					      aria-expanded={actionsOpen}
					      aria-label={actionsOpen ? 'Close tools' : 'Show tools'}
					      ref={actionsRef}
					    >
					      <span className={`gear-icon${actionsOpen ? ' open' : ' closed'}`} style={{ border: '2px solid #10b981', borderRadius: 4 }}>
					        <FaCog />
					      </span>
					    </button>
					    <div
					      className={`actions-collapse${actionsOpen ? ' open' : ''}`}
					      ref={actionsMenuRef}
					      style={{
					        position: 'absolute',
					        left: '100%',
					        top: 0,
					        marginLeft: 8,
					        display: actionsOpen ? 'flex' : 'none',
					        flexDirection: 'row',
					        gap: '0.3rem',
					        background: '#18181b',
					        borderRadius: 8,
					        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
					        padding: '0.3rem 0.7rem',
					        zIndex: 10,
					        alignItems: 'center',
					        minWidth: 0,
					        maxWidth: actionsOpen ? 400 : 0,
					        opacity: 1,
					        pointerEvents: actionsOpen ? 'auto' : 'none',
					        border: '2px solid #6366f1',
					        transition: 'max-width 0.32s cubic-bezier(.7,1.7,.5,1), opacity 0.2s',
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
					        onClick={() => { navigate('/create-roster'); setActionsOpen(false); }}
					      >
					        <FaPlus />
					      </button>
					    </div>
					  </div>
					)}
				</div>
				<div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flex: 0, marginLeft: 'auto', border: '2px solid #7c3aed' }}>
					<h1 className="conflict-army-heading" style={{ margin: 0, display: 'block', border: '2px solid #f472b6', borderRadius: 4 }}>Conflict Army</h1>
				</div>
			</div>
			<SignupModal
				open={signupOpen}
				onClose={() => setSignupOpen(false)}
			/>
			<div style={{ width: '100%', maxWidth: 1200, overflowX: 'auto' }}>
			  <table className="roster-table"
			    style={{ minWidth: 600, width: '100%' }}
			  >
			    <thead>
			      <tr>
			        <th style={{ minWidth: 120 }}>Role</th>
			        <th style={{ minWidth: 120 }}>Weapon</th>
			        <th style={{ minWidth: 120 }}>Player</th>
			        <th style={{ minWidth: 180 }}>Build Notes</th>
			      </tr>
			    </thead>
			    <tbody>
			      {sortedRoster.map((entry, index) => {
			        // Determine role class for pill
			        let roleClass = 'role-pill';
			        let mainCallerStyle = undefined;
			        switch ((entry.role || '').toLowerCase()) {
			          case 'main caller':
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
			          case 'tank':
			            roleClass += ' role-tank';
			            break;
			          case 'support':
			            roleClass += ' role-support';
			            break;
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
			          <tr key={index}>
			            <td style={{ textAlign: 'center' }}>
			              <span className={roleClass} style={mainCallerStyle}>{entry.role}</span>
			            </td>
			            <td style={{ fontWeight: 700, color: '#f59e42', textAlign: 'center', background: '#18181b' }}>{entry.weapon}</td>
			            <td style={{ textAlign: 'center', background: '#18181b' }}>
			              {isElevated ? (
			                <select
			                  className={selectedPlayers[index] && selectedPlayers[index] !== '' ? 'selected' : ''}
			                  style={{
			                    minWidth: 120,
			                    maxWidth: 220,
			                    width: '100%',
			                    textAlign: 'center',
			                    border: (!selectedPlayers[index] || selectedPlayers[index] === '') ? '1.5px solid #dc2626' : undefined,
			                    boxShadow: (!selectedPlayers[index] || selectedPlayers[index] === '') ? '0 0 0 2px #dc262688, 0 2px 16px #dc262655' : undefined,
			                  }}
			                  value={selectedPlayers[index] || ''}
			                  onChange={e => handleSelectPlayer(index, e.target.value)}
			                >
			                  <option value="">-- Select Player --</option>
			                  {selectedPlayers[index]
			                    ? (() => {
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
			            <td style={{ color: '#f3f4f6', fontSize: 14, textAlign: 'center', background: '#18181b' }}>{entry.build}</td>
			          </tr>
			        );
			      })}
			    </tbody>
			  </table>
			</div>
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

// Responsive styles for mobile roster table and select/button
if (typeof document !== 'undefined' && !document.getElementById('roster-responsive-styles')) {
  const style = document.createElement('style');
  style.id = 'roster-responsive-styles';
  style.innerHTML = `
    @media (max-width: 700px) {
      .roster-table th, .roster-table td {
        padding: 0.5rem 0.3rem !important;
        font-size: 0.95rem !important;
      }
      .roster-topbar {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.7rem !important;
      }
      .roster-table {
        min-width: 320px !important;
      }
      .roster-table select {
        min-width: 90px !important;
        max-width: 140px !important;
        font-size: 0.95em !important;
        padding: 0.3em 0.5em !important;
      }
      .signup-btn {
        font-size: 0.98em !important;
        padding: 0.4em 1em !important;
        min-width: 0 !important;
        max-width: 140px !important;
      }
    }
    @media (max-width: 400px) {
      .roster-table th, .roster-table td {
        font-size: 0.85rem !important;
        padding: 0.3rem 0.1rem !important;
      }
      .roster-table select {
        min-width: 70px !important;
        max-width: 100px !important;
        font-size: 0.9em !important;
        padding: 0.2em 0.3em !important;
      }
      .signup-btn {
        font-size: 0.92em !important;
        padding: 0.3em 0.7em !important;
        max-width: 100px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Add responsive CSS for hiding .roster-stats-topbar on mobile
if (typeof document !== 'undefined' && !document.getElementById('roster-stats-mobile-hide')) {
  const style = document.createElement('style');
  style.id = 'roster-stats-mobile-hide';
  style.innerHTML = `
    @media (max-width: 700px) {
      .roster-stats-topbar { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// Responsive CSS for hiding Conflict Army text and adjusting actions bar on mobile
if (typeof document !== 'undefined' && !document.getElementById('roster-topbar-mobile-hide')) {
  const style = document.createElement('style');
  style.id = 'roster-topbar-mobile-hide';
  style.innerHTML = `
    @media (max-width: 700px) {
      .conflict-army-heading { display: none !important; }
      .roster-topbar { flex-direction: column !important; align-items: stretch !important; gap: 0.7rem !important; }
      .roster-actions-bar { flex-direction: row !important; justify-content: flex-end !important; gap: 0.7rem !important; }
    }
  `;
  document.head.appendChild(style);
}

// Responsive CSS for mobile: sign up button to far left, actions bar row, extra spacing
if (typeof document !== 'undefined' && !document.getElementById('roster-topbar-mobile-signup')) {
  const style = document.createElement('style');
  style.id = 'roster-topbar-mobile-signup';
  style.innerHTML = `
    @media (max-width: 700px) {
      .conflict-army-heading { display: none !important; }
      .roster-topbar { flex-direction: column !important; align-items: stretch !important; gap: 0.7rem !important; }
      .roster-actions-bar { flex-direction: row !important; justify-content: flex-start !important; gap: 0.7rem !important; width: 100% !important; position: relative; }
      .signup-cog-row { flex-direction: row !important; justify-content: flex-start !important; gap: 0.5rem !important; width: auto !important; }
      .signup-btn-mobile-left { margin-right: 0 !important; margin-left: 0 !important; }
      .icon-btn { margin-left: 0 !important; }
    }
  `;
  document.head.appendChild(style);
}

// Responsive CSS for UserProfile top right and cog near sign up on mobile
if (typeof document !== 'undefined' && !document.getElementById('roster-topbar-mobile-userprofile')) {
  const style = document.createElement('style');
  style.id = 'roster-topbar-mobile-userprofile';
  style.innerHTML = `
    @media (max-width: 700px) {
      .conflict-army-heading { display: none !important; }
      .roster-topbar { flex-direction: column !important; align-items: stretch !important; gap: 0.7rem !important; }
      .roster-actions-bar { flex-direction: row !important; justify-content: flex-end !important; gap: 0.7rem !important; width: 100% !important; position: relative; }
      .signup-btn-mobile-left { margin-right: 0.5rem !important; }
      .icon-btn { margin-left: 0 !important; }
      /* UserProfile top right */
      .user-profile-top-right { position: absolute !important; top: 1.2rem !important; right: 1.2rem !important; z-index: 100 !important; }
    }
  `;
  document.head.appendChild(style);
}
