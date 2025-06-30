import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
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
            navigate('/view-roster'); // Redirect after login
          } else {
            console.error('Login failed:', data);
          }
        })
        .catch((err) => {
          console.error('OAuth callback error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [navigate]);

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
      justifyContent: 'flex-start',
      fontFamily: "'UnifrakturCook', 'Cinzel', serif",
      letterSpacing: '0.04em',
      padding: '0 1.5rem',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{ marginTop: '30rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h1 style={{
          fontFamily: "'UnifrakturCook', 'Cinzel', serif",
          fontSize: '5.2rem',
          color: '#fff',
          textShadow: '0 4px 24px #000a, 0 0 8px #fff, 2px 2px 0 #23232a',
          marginBottom: '0.7rem',
          letterSpacing: '0.18em',
          textAlign: 'center',
          filter: 'drop-shadow(0 2px 8px #000a)',
        }}>
          Conflict
        </h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="signup-btn"
          style={{
            fontSize: '1.22rem',
            padding: '0.8rem 2.6rem',
            fontWeight: 400, // thinner text
            borderRadius: '1.2rem',
            background: '#18181b', // solid black
            color: '#f3f4f6', // soft off-white
            border: '2.5px solid #fff', // white outline
            boxShadow: '0 0 16px 2px #fff8, 0 2px 16px #000a', // white glow + subtle dark shadow
            marginTop: '1.2rem',
            marginBottom: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
            textAlign: 'center',
            display: 'block',
            opacity: 0.97,
            letterSpacing: '0.04em',
            textShadow: '0 1px 0 #fff, 0 0 2px #fff', // subtle white text edge
          }}
        >
          {loading ? 'Logging in...' : 'Login with Discord'}
        </button>
      </div>
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '2.5rem',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '1.25rem', // Reduced size
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
