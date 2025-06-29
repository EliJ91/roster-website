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
    const redirectUri = encodeURIComponent(window.location.origin);
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    window.location.href = discordUrl;
  };

  return (
    <div>
      <h1>Welcome to the Roster Site</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login with Discord'}
      </button>
    </div>
  );
};

export default LandingPage;
