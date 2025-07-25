import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !loading) {
      // Clear the code from URL immediately to prevent reuse
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setLoading(true);
      fetch('/.netlify/functions/discordAuth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('OAuth response:', data);
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user); // Update the App.js user state
            
            // Check if user is elevated/admin
            const ELEVATED_ROLE_ID = process.env.REACT_APP_ELEVATED_ROLE_ID;
            const isElevated = data.user?.guildRoles && ELEVATED_ROLE_ID && data.user.guildRoles.includes(ELEVATED_ROLE_ID);
            
            // Redirect based on user role
            if (isElevated) {
              navigate('/admin');
            } else {
              navigate('/select-roster');
            }
          } else {
            console.error('Login failed:', data);
          }
        })
        .catch((err) => {
          console.error('OAuth callback error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [navigate, loading, setUser]);

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_DISCORD_REDIRECT_URI);
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    window.location.href = discordUrl;
  };

  return (
    <div className="landing-theme dragon-bg" style={{
      minHeight: '100vh',
      color: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      fontFamily: "'UnifrakturCook', 'Cinzel', serif",
      letterSpacing: '0.04em',
      padding: '0 1.5rem',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      <div className="landing-content"
        style={{
          marginBottom: '6.5rem',
          marginTop: '8vh',
          width: '100%',
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: 1,
          gap: '2.2rem',
        }}
      >
        <h1 className="conflict-landing-heading"
          style={{
            fontFamily: "'UnifrakturCook', 'Cinzel', serif",
            fontSize: 'clamp(2.2rem, 8vw, 5.2rem)',
            color: '#fff',
            textShadow: '0 4px 24px #000a, 0 0 8px #fff, 2px 2px 0 #23232a',
            marginBottom: 0,
            letterSpacing: '0.18em',
            textAlign: 'center',
            filter: 'drop-shadow(0 2px 8px #000a)',
            lineHeight: 1.1,
            wordBreak: 'break-word',
            padding: '0 0.2em',
          }}
        >
          Conflict
        </h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-btn"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </div>
      <div className="quote" style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '3.5rem',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.9rem, 3vw, 1.25rem)',
          color: '#fff',
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
          textShadow: '0 2px 12px #000a, 0 1px 4px #fff',
          letterSpacing: '0.18em',
          fontStyle: 'italic',
        }}>
          “All roads lead to Conflict”
        </h2>
      </div>
    </div>
  );
};

export default LandingPage;
