// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ViewRosterPage from './components/ViewRosterPage';
import CreateRosterPage from './components/CreateRosterPage';
import backgroundSmoke from './assets/backgroundSmoke.mp4';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    // Remove roles if not used
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Smoke video background, behind everything */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={backgroundSmoke}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2, // behind all content but above literal background
          pointerEvents: 'none',
          background: '#000',
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage setUser={setUser} />} />
          <Route path="/view-roster" element={<ViewRosterPage />} />
          <Route path="/create-roster" element={<CreateRosterPage currentUser={user} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
