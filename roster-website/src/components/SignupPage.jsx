// LandingPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI;
const OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;

function LandingPage({ setUser, setRoles }) {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("discordUser");
    const storedRoles = localStorage.getItem("discordRoles");

    if (storedUser && storedRoles) {
      setUser(JSON.parse(storedUser));
      setRoles(JSON.parse(storedRoles));
      navigate("/signup");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      window.history.replaceState({}, document.title, '/');

      fetch('/.netlify/functions/discordAuth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.roles) {
            setUser(data.user);
            setRoles(data.roles);
            localStorage.setItem("discordUser", JSON.stringify(data.user));
            localStorage.setItem("discordRoles", JSON.stringify(data.roles));
            navigate("/signup");
          }
        })
        .catch(err => console.error('OAuth callback error:', err));
    }
  }, [setUser, setRoles, navigate]);

  const handleLogin = () => {
    window.location.href = OAUTH_URL;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to the Roster Signup</h1>
      <button
        onClick={handleLogin}
        style={{ fontSize: '18px', padding: '10px 20px' }}
      >
        Login with Discord
      </button>
    </div>
  );
}

export default LandingPage;
