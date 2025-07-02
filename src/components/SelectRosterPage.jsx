import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRosterData } from '../test-data/mockRosterData';
import '../styles/selectrosterpage.css';

// Helper to get users who signed up for a weapon, excluding already assigned users
function getUsersForWeapon(weapon, assignedUserIds, signups) {
	return signups.filter((u) => u.weapons.includes(weapon) && !assignedUserIds.includes(u.id));
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

const SelectRosterPage = (props) => {
	const navigate = useNavigate();
	const [roster, setRoster] = useState(null);
	const [flatRoster, setFlatRoster] = useState([]); // For backward compatibility
	const [signups, setSignups] = useState([]);
	const [user, setUser] = useState(null);
	const [selectedPlayers, setSelectedPlayers] = React.useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	
	// Helper function to safely handle equipment data (both array and string formats)
	const safeGetEquipmentItems = (equipment) => {
		if (!equipment) return [];
		if (Array.isArray(equipment)) return equipment.filter(item => item && item.trim());
		if (typeof equipment === 'string') return equipment.split('/').map(item => item.trim()).filter(item => item);
		return [];
	};

	// Helper function to flatten mock data structure
	const flattenMockData = () => {
		const flattenedRoster = [];
		mockRosterData.parties?.forEach(party => {
			party.positions?.forEach(position => {
				flattenedRoster.push({
					role: position.role,
					weapon: position.weapon,
					player: position.player || position.signedUpUser || '',
					build: position.buildNotes || '',
					nickname: position.signedUpUser || position.player || ''
				});
			});
		});
		return flattenedRoster;
	};

	useEffect(() => {
		try {
			const storedUser = JSON.parse(localStorage.getItem('user'));
			setUser(storedUser);
		} catch (e) {
			setUser(null);
		}
	}, []);

	useEffect(() => {
		// Fetch live data from backend
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Try to fetch from your Netlify function first
				const rosterRes = await fetch('/.netlify/functions/get-rosters');
				
				if (rosterRes.ok) {
					const data = await rosterRes.json();
					if (data.rosters && data.rosters.length > 0) {
						// Get the most recent roster
						const latestRoster = data.rosters[0];
						setRoster(latestRoster);
						
						// Also create a flattened version for backward compatibility
						const flattenedRoster = [];
						latestRoster.parties?.forEach(party => {
							party.positions?.forEach(position => {
								flattenedRoster.push({
									role: position.role,
									weapon: position.weapon,
									head: position.head,
									chest: position.chest,
									boots: position.boots,
									player: position.player || position.signedUpUser || '',
									build: position.buildNotes || '',
									nickname: position.signedUpUser || position.player || ''
								});
							});
						});
						
						setFlatRoster(flattenedRoster);
					} else {
						// Fallback to mock data if no rosters found
						console.log('No rosters found, using mock data');
						// Create a mock roster with party structure
						const mockRosterWithParties = {
							eventName: "Mock Event",
							parties: [{
								partyName: "Main Party",
								positions: mockRosterData.parties[0].positions
							}]
						};
						setRoster(mockRosterWithParties);
						setFlatRoster(flattenMockData());
					}
				} else {
					// Fallback to mock data if API call fails
					console.log('API call failed, using mock data');
					// Create a mock roster with party structure
					const mockRosterWithParties = {
						eventName: "Mock Event",
						parties: [{
							partyName: "Main Party",
							positions: mockRosterData.parties[0].positions
						}]
					};
					setRoster(mockRosterWithParties);
					setFlatRoster(flattenMockData());
				}
				
				// For signups, we'll use empty array for now since there's no signup endpoint
				setSignups([]);
				
			} catch (err) {
				console.error('Failed to fetch live data:', err);
				console.log('Error occurred, using mock data');
				// Fallback to mock data
				const mockRosterWithParties = {
					eventName: "Mock Event",
					parties: [{
						partyName: "Main Party",
						positions: mockRosterData.parties[0].positions
					}]
				};
				setRoster(mockRosterWithParties);
				setFlatRoster(flattenMockData());
				setSignups([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
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
	
	// Calculate guild tag stats from the flattened roster for backward compatibility
	flatRoster.forEach((entry) => {
		// Assume entry.nickname is available from backend, otherwise fallback to player name
		const tag = getGuildTag(entry.nickname || entry.player);
		if (tag) {
			guildTagCounts[tag] = (guildTagCounts[tag] || 0) + 1;
		}
		totalPlayers++;
	});

	// Live guild tag stats from signups
	const liveGuildTagCounts = getGuildTagCounts(signups);

	function handleSelectPlayer(positionId, userId) {
		setSelectedPlayers((prev) => ({ ...prev, [positionId]: userId }));
	}

	// Find users who have signed up but are not assigned to any role
	const assignedUserIds = Object.values(selectedPlayers).filter(Boolean);

	// Function to manually refresh data
	const refreshData = async () => {
		try {
			setLoading(true);
			setError(null);
			
			// Try to fetch from your Netlify function first
			const rosterRes = await fetch('/.netlify/functions/get-rosters');
			
			if (rosterRes.ok) {
				const data = await rosterRes.json();
				if (data.rosters && data.rosters.length > 0) {
					// Get the most recent roster
					const latestRoster = data.rosters[0];
					setRoster(latestRoster);
					
					// Also create a flattened version for backward compatibility
					const flattenedRoster = [];
					latestRoster.parties?.forEach(party => {
						party.positions?.forEach(position => {
							flattenedRoster.push({
								role: position.role,
								weapon: position.weapon,
								head: position.head,
								chest: position.chest,
								boots: position.boots,
								player: position.player || position.signedUpUser || '',
								build: position.buildNotes || '',
								nickname: position.signedUpUser || position.player || ''
							});
						});
					});
					
					setFlatRoster(flattenedRoster);
				} else {
					// Fallback to mock data if no rosters found
					const mockRosterWithParties = {
						eventName: "Mock Event",
						parties: [{
							partyName: "Main Party",
							positions: mockRosterData.parties[0].positions
						}]
					};
					setRoster(mockRosterWithParties);
					setFlatRoster(flattenMockData());
				}
			} else {
				// Fallback to mock data if API call fails
				const mockRosterWithParties = {
					eventName: "Mock Event",
					parties: [{
						partyName: "Main Party",
						positions: mockRosterData.parties[0].positions
					}]
				};
				setRoster(mockRosterWithParties);
				setFlatRoster(flattenMockData());
			}
			
			// For signups, we'll use empty array for now
			setSignups([]);
			
		} catch (err) {
			console.error('Failed to refresh live data:', err);
			setError(err.message);
			// Fallback to mock data
			const mockRosterWithParties = {
				eventName: "Mock Event",
				parties: [{
					partyName: "Main Party",
					positions: mockRosterData.parties[0].positions
				}]
			};
			setRoster(mockRosterWithParties);
			setFlatRoster(flattenMockData());
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="select-roster-page">
			<div className="select-roster-content">
				{/* Header with back button */}
				<div className="select-roster-header">
					<h1 className="select-roster-heading">
						Select Players
					</h1>
					
					{roster?.description && (
						<p className="roster-description">{roster.description}</p>
					)}
					
					<div className="select-roster-actions">
						<button 
							className="back-to-admin-btn"
							onClick={props.onBack || (() => navigate('/admin'))}
						>
							← Back to Admin
						</button>
						
						<button 
							className="refresh-btn"
							onClick={refreshData}
							disabled={loading}
						>
							{loading ? 'Refreshing...' : '🔄 Refresh Data'}
						</button>
					</div>
				</div>
				
				<div className="roster-container">
					{loading && (
						<div style={{ 
							textAlign: 'center', 
							padding: '2rem', 
							color: '#6b7280',
							fontSize: '1.1rem'
						}}>
							Loading live roster data...
						</div>
					)}
					
					{error && (
						<div style={{ 
							textAlign: 'center', 
							padding: '2rem', 
							color: '#dc2626',
							fontSize: '1.1rem',
							backgroundColor: 'rgba(220, 38, 38, 0.1)',
							borderRadius: '0.5rem',
							margin: '1rem 0'
						}}>
							Error loading roster: {error}
						</div>
					)}
					
					{!loading && !error && roster && (
						<div className="select-roster-table-container">
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
													party.positions.map((position, posIndex) => {
														// Get position ID for selection mapping
														const positionId = `${partyIndex}-${posIndex}`;
														const isPositionFilled = position.player || position.signedUpUser;
														
														return (
															<tr key={positionId} className={`position-row ${isPositionFilled ? 'filled' : 'empty'}`}>
																<td className="position-role">{position.role || ''}</td>
																<td className="position-weapon">{position.weapon || ''}</td>
																
																{/* Head equipment */}
																<td className="position-equipment">
																	{safeGetEquipmentItems(position.head).length > 0 ? (
																		<div className="equipment-items">
																			{safeGetEquipmentItems(position.head).map((item, index) => (
																				<div key={index} className="equipment-item">{item}</div>
																			))}
																		</div>
																	) : ''}
																</td>
																
																{/* Chest equipment */}
																<td className="position-equipment">
																	{safeGetEquipmentItems(position.chest).length > 0 ? (
																		<div className="equipment-items">
																			{safeGetEquipmentItems(position.chest).map((item, index) => (
																				<div key={index} className="equipment-item">{item}</div>
																			))}
																		</div>
																	) : ''}
																</td>
																
																{/* Boots equipment */}
																<td className="position-equipment">
																	{safeGetEquipmentItems(position.boots).length > 0 ? (
																		<div className="equipment-items">
																			{safeGetEquipmentItems(position.boots).map((item, index) => (
																				<div key={index} className="equipment-item">{item}</div>
																			))}
																		</div>
																	) : ''}
																</td>
																
																{/* Player column */}
																<td className="position-player">
																	{isElevated ? (
																		<select
																			className={selectedPlayers[positionId] && selectedPlayers[positionId] !== '' ? 'selected' : ''}
																			style={{
																				minWidth: 120,
																				maxWidth: 220,
																				width: '100%',
																				textAlign: 'center',
																				backgroundColor: '#18181b',
																				color: isPositionFilled ? '#22c55e' : '#ef4444',
																				border: '1px solid rgba(255, 255, 255, 0.2)',
																				borderRadius: '4px',
																				padding: '0.5rem',
																				fontSize: '1rem',
																				fontWeight: '600',
																				boxShadow: (!selectedPlayers[positionId] || selectedPlayers[positionId] === '') ? '0 0 0 2px #dc262688, 0 2px 16px #dc262655' : undefined,
																			}}
																			value={selectedPlayers[positionId] || ''}
																			onChange={e => handleSelectPlayer(positionId, e.target.value)}
																		>
																			<option value="">-- Select Player --</option>
																			{selectedPlayers[positionId]
																				? (() => {
																						const selectedUser = signups.find(u => u.id === selectedPlayers[positionId]);
																						return selectedUser ? [
																							<option key={selectedUser.id} value={selectedUser.id}>{selectedUser.nickname}</option>,
																							...getUsersForWeapon(position.weapon, assignedUserIds, signups).filter(u => u.id !== selectedUser.id).map(u => (
																								<option key={u.id} value={u.id}>{u.nickname}</option>
																							))
																						] : getUsersForWeapon(position.weapon, assignedUserIds, signups).map(u => (
																							<option key={u.id} value={u.id}>{u.nickname}</option>
																						));
																					})()
																				: getUsersForWeapon(position.weapon, assignedUserIds, signups).map(u => (
																						<option key={u.id} value={u.id}>{u.nickname}</option>
																					))}
																		</select>
																	) : isPositionFilled ? (
																		<span className="player-name">{position.signedUpUser || position.player}</span>
																	) : (
																		<span className="empty-slot">Available</span>
																	)}
																</td>
																
																{/* Build notes */}
																<td className="position-build-notes">{position.buildNotes || ''}</td>
															</tr>
														);
													})
												) : (
													<tr>
														<td colSpan="7" className="no-positions">No positions defined for this party</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								))
							) : (
								<div className="no-data-message">No roster data available</div>
							)}
						</div>
					)}
			</div>
		</div>
	</div>
	);
};

export default SelectRosterPage;