// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SelectRosterPage from './components/SelectRosterPage';
import ViewRosterPage from './components/ViewRosterPage';
import CreateRosterPage from './components/CreateRosterPage';
import AdminPage from './components/AdminPage';
import DevUploader from './components/DevUploader';
import backgroundSmoke from './assets/backgroundSmoke.mp4';
import './styles/app.css';
import './styles/landingpage.css';
import './styles/createrosterpage.css';
import './styles/selectrosterpage.css';
import './styles/viewrosterpage.css';
import './styles/signupmodal.css';
import './styles/signupbutton.css';
import './styles/userprofile.css';
import './styles/roleLabels.css';
import './styles/adminpage.css';
import './styles/managerosters.css';

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
          <Route path="/select-roster" element={<SelectRosterPage />} />
          <Route path="/create-roster" element={<CreateRosterPage currentUser={user} />} />
          <Route path="/view-roster" element={<ViewRosterPage />} />
          <Route path="/admin" element={<AdminPage currentUser={user} />} />
        </Routes>
        <DevUploader />
      </Router>
    </div>
  );
}

export default App;
