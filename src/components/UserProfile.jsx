import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';

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
  console.log('👤 UserProfile component rendering');
  
  const [showSignOut, setShowSignOut] = React.useState(false);
  const navigate = useNavigate();
  
  // Track component lifecycle
  React.useEffect(() => {
    console.log('👤 UserProfile mounted');
    return () => {
      console.log('👤 UserProfile unmounted');
    };
  }, []);

  // Track showSignOut state changes
  React.useEffect(() => {
    console.log('👤 UserProfile: showSignOut changed to', showSignOut);
  }, [showSignOut]);
  
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    console.log('👤 UserProfile: User data loaded', user ? { id: user.id, username: user.username } : 'null');
  } catch (e) {
    console.warn('UserProfile: Failed to parse user from localStorage', e);
  }


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
    console.log('👤 UserProfile: Signing out user');
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
      {isElevated && (
        <button
          onClick={() => navigate('/admin')}
          className="user-profile-admin-link"
          title="Admin Dashboard"
        >
          Admin
        </button>
      )}
      <div 
        className="user-profile-pill"
        onMouseEnter={() => setShowSignOut(true)}
        onMouseLeave={() => setShowSignOut(false)}
      >
        <span className="user-profile-display-name">{displayName}</span>
        <img src={avatarUrl} alt="avatar" />
        {showSignOut && (
          <button
            onClick={handleSignOut}
            className="user-profile-signout-btn"
            title="Log Out"
          >
            <MdLogout />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
//# sourceMappingURL=UserProfile.js.map
