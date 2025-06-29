// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SignupPage from './components/SignupPage';
import ViewRosterPage from './components/ViewRosterPage';

function App() {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("discordUser");
    const savedRoles = localStorage.getItem("discordRoles");
    if (savedUser && savedRoles) {
      setUser(JSON.parse(savedUser));
      setRoles(JSON.parse(savedRoles));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage setUser={setUser} setRoles={setRoles} />} />
        <Route path="/signup" element={<SignupPage user={user} />} />
        <Route path="/roster" element={<ViewRosterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
