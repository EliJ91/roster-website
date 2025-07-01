import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

// Helper to strip leading guild tag from nickname
function stripGuildTag(nick) {
  if (!nick) return '';
  // Remove leading tags like [CF], ![CF], !![cf], [0-blah], etc.
  return nick.replace(/^!?!?\[[^\]]+\]\s*/i, '').trim();
}

// Capitalize the first letter of a string
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const UserProfile = () => {
  const [showSignOut, setShowSignOut] = React.useState(false);
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.warn('UserProfile: Failed to parse user from localStorage', e);
  }
  console.log('UserProfile: user =', user);

  if (!user) {
    // Optionally redirect to login if not logged in
    // navigate('/');
    return null;
  }

  // Discord CDN avatar URL
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png'; // fallback avatar

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const ELEVATED_ROLE_ID = process.env.REACT_APP_ELEVATED_ROLE_ID;
  const isElevated = user.guildRoles && ELEVATED_ROLE_ID && user.guildRoles.includes(ELEVATED_ROLE_ID); // Replace with your real role ID

  // Prefer nickname (minus guild tag) if available, else username only (no discriminator)
  let displayName;
  if (user.nick && stripGuildTag(user.nick)) {
    displayName = capitalizeFirst(stripGuildTag(user.nick));
  } else {
    displayName = capitalizeFirst(user.username);
  }

  // Debug printout for roles and elevated check
  console.log('--- ELEVATED ROLE DEBUG ---');
  console.log('guildRoles:', user.guildRoles);
  console.log('ELEVATED_ROLE_ID:', ELEVATED_ROLE_ID);
  console.log('isElevated:', isElevated);
  console.log('--------------------------');

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        top: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
        zIndex: 10,
        justifyContent: 'flex-end',
        marginBottom: '2rem',
      }}
    >
      <div
        className="user-profile-pill"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#23232a',
          borderRadius: '2rem',
          padding: '0.5rem 1rem',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.45), 0 1.5px 8px 0 #059669',
          border: '1.5px solid #27272a',
          position: 'relative',
        }}
        onMouseEnter={() => setShowSignOut(true)}
        onMouseLeave={() => setShowSignOut(false)}
      >
        <span style={{ fontWeight: 'bold', color: '#f3f4f6' }}>{displayName}</span>
        <img src={avatarUrl} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #059669', background: '#18181b' }} />
        {showSignOut && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={handleSignOut}
              className="signout-btn"
              style={{
                marginLeft: '0.5rem',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.5,
                transition: 'opacity 0.2s, box-shadow 0.2s',
                fontSize: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = 1;
                e.currentTarget.style.boxShadow = '0 0 8px #059669';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = 0.5;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f3f4f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="signout-tooltip" style={{
                visibility: 'hidden',
                opacity: 0,
                position: 'absolute',
                top: '120%',
                right: 0,
                background: '#23232a',
                color: '#f3f4f6',
                padding: '0.3rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px #0008',
                zIndex: 20,
                transition: 'opacity 0.2s',
              }}>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
//# sourceMappingURL=UserProfile.js.map
