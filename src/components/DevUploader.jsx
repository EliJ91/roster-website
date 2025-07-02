import React, { useState } from 'react';
import { createRoster, updateServerSettings } from '../utils/firestoreEvents';
import { useNavigate } from 'react-router-dom';

const DevUploader = () => {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [settingsData, setSettingsData] = useState('');
  const [isDragOverSettings, setIsDragOverSettings] = useState(false);
  const [uploadingSettings, setUploadingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('uploader'); // 'uploader', 'nav', or 'settings'

  // Define all your application routes
  const routes = [
    { path: '/', label: '/' },
    { path: '/select-roster', label: '/select-roster' },
    { path: '/create-roster', label: '/create-roster' },
    { path: '/view-roster', label: '/view-roster' },
    { path: '/admin', label: '/admin' }
  ];

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const txtFile = files.find(file => file.name.endsWith('.txt'));

    if (txtFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          // Try to parse as JSON to validate
          JSON.parse(content);
          setJsonData(content);
          setMessage(`📁 File "${txtFile.name}" loaded successfully`);
        } catch (error) {
          setMessage(`❌ Invalid JSON in file "${txtFile.name}": ${error.message}`);
        }
      };
      reader.readAsText(txtFile);
    } else {
      setMessage('❌ Please drop a .txt file containing JSON data');
    }
  };

  const handleTextareaChange = (e) => {
    setJsonData(e.target.value);
    if (message.includes('📁 File')) {
      setMessage(''); // Clear file load message when user starts typing
    }
  };

  const handleUpload = async () => {
    if (!jsonData.trim()) {
      setMessage('Please enter JSON data');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      
      const rosterData = JSON.parse(jsonData);
      
      // Validate that it has the required structure
      if (!rosterData.eventName || !rosterData.parties) {
        throw new Error('Invalid roster format - missing eventName or parties');
      }

      const rosterId = await createRoster({
        author: rosterData.author || 'Dev Upload',
        eventName: rosterData.eventName,
        eventDescription: rosterData.eventDescription || '',
        parties: rosterData.parties,
        createdBy: { username: 'Dev Upload' }
      });

      setMessage(`✅ Roster uploaded successfully! ID: ${rosterId}`);
      setJsonData('');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOverSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSettings(true);
  };

  const handleDragLeaveSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSettings(false);
  };

  const handleDropSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSettings(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.name.endsWith('.json'));

    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          // Attempt to parse the JSON to validate it
          JSON.parse(content);
          setSettingsData(content);
          setMessage(`📁 Settings file "${jsonFile.name}" loaded successfully`);
        } catch (error) {
          setMessage(`❌ Invalid JSON in file "${jsonFile.name}": ${error.message}`);
        }
      };
      reader.readAsText(jsonFile);
    } else {
      setMessage('❌ Please drop a .json file containing server settings');
    }
  };

  const handleSettingsTextareaChange = (e) => {
    setSettingsData(e.target.value);
    if (message.includes('📁 Settings file')) {
      setMessage(''); // Clear file load message when user starts typing
    }
  };

  const handleUploadSettings = async () => {
    if (!settingsData.trim()) {
      setMessage('Please enter server settings data');
      return;
    }

    try {
      setUploadingSettings(true);
      setMessage('');
      
      // Parse the JSON data
      let settingsObject;
      
      try {
        settingsObject = JSON.parse(settingsData);
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      
      // Validate the settings object
      if (!settingsObject || typeof settingsObject !== 'object') {
        throw new Error('Settings must be a valid object');
      }
      
      // Required fields check
      const requiredFields = ['guildId', 'elevatedRoleId', 'roles', 'weaponsByRole', 'armorOptions'];
      for (const field of requiredFields) {
        if (!settingsObject[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Update the server settings
      await updateServerSettings(settingsObject);

      setMessage(`✅ Server settings uploaded successfully!`);
      setSettingsData('');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploadingSettings(false);
    }
  };

  // Minimized state - just the question mark button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          width: '32px',
          height: '32px',
          backgroundColor: '#ffff00',
          color: '#000',
          border: '2px solid #ffcc00',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(255, 255, 0, 0.5)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Open Dev Uploader"
      >
        ?
      </button>
    );
  }

  // Expanded state styles
  const containerStyle = {
    position: 'fixed',
    top: '10px',
    left: '10px',
    width: '320px',
    maxHeight: '70vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    zIndex: 9999,
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '11px',
    overflow: 'auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00ff88'
  };

  const textareaStyle = {
    width: '100%',
    height: '150px',
    backgroundColor: isDragOver ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    border: isDragOver ? '2px dashed #00ff88' : '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    padding: '6px',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '10px',
    resize: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const buttonStyle = {
    backgroundColor: '#00ff88',
    color: 'black',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '6px',
    opacity: uploading ? 0.6 : 1,
    fontSize: '10px'
  };

  const toggleButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '2px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  };

  const messageStyle = {
    marginTop: '8px',
    padding: '6px',
    borderRadius: '4px',
    backgroundColor: message.includes('✅') 
      ? 'rgba(0, 255, 136, 0.2)' 
      : message.includes('📁')
        ? 'rgba(0, 136, 255, 0.2)'
        : message.includes('❌') 
          ? 'rgba(255, 0, 0, 0.2)'
          : 'rgba(255, 255, 255, 0.1)',
    fontSize: '10px',
    wordBreak: 'break-word'
  };

  const tabStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    marginRight: '4px',
    marginBottom: '8px'
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#00ff88',
    color: 'black',
    fontWeight: 'bold'
  };

  const navLinkStyle = {
    display: 'block',
    color: '#00ff88',
    textDecoration: 'none',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    marginBottom: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMessage(`🚀 Navigated to ${path}`);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>🛠️ DEV PANEL</span>
        <button 
          style={toggleButtonStyle}
          onClick={() => setIsExpanded(false)}
        >
          ×
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '12px' }}>
        <button
          style={activeTab === 'nav' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('nav')}
        >
          🧭 Navigation
        </button>
        <button
          style={activeTab === 'uploader' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('uploader')}
        >
          📤 Roster
        </button>
        <button
          style={activeTab === 'settings' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Navigation Tab Content */}
      {activeTab === 'nav' && (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#00ff88', fontWeight: 'bold' }}>
            📋 Page Navigation
          </div>
          {routes.map((route) => (
            <div
              key={route.path}
              style={navLinkStyle}
              onClick={() => handleNavigation(route.path)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
                e.target.style.borderColor = '#00ff88';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {route.label}
            </div>
          ))}
        </div>
      )}

      {/* Uploader Tab Content */}
      {activeTab === 'uploader' && (
        <div>
          <textarea
            style={textareaStyle}
            value={jsonData}
            onChange={handleTextareaChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            placeholder={isDragOver ? "Drop .txt file here..." : "Paste roster JSON data here or drag & drop a .txt file..."}
          />
          
          <div>
            <button
              style={buttonStyle}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Roster'}
            </button>
            
            <button
              style={{ ...toggleButtonStyle, marginLeft: '6px' }}
              onClick={() => setJsonData('')}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#00ff88', fontWeight: 'bold' }}>
            ⚙️ Server Settings Upload
          </div>
          <textarea
            style={{
              ...textareaStyle,
              backgroundColor: isDragOverSettings ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              border: isDragOverSettings ? '2px dashed #00ff88' : '1px solid rgba(255, 255, 255, 0.3)'
            }}
            value={settingsData}
            onChange={handleSettingsTextareaChange}
            onDragOver={handleDragOverSettings}
            onDragLeave={handleDragLeaveSettings}
            onDrop={handleDropSettings}
            placeholder={isDragOverSettings ? "Drop server-settings.json file here..." : "Paste server settings JSON here or drop the server-settings.json file..."}
          />
          
          <div>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: '#00bbff'
              }}
              onClick={handleUploadSettings}
              disabled={uploadingSettings}
            >
              {uploadingSettings ? 'Uploading...' : 'Upload Settings'}
            </button>
            
            <button
              style={{ ...toggleButtonStyle, marginLeft: '6px' }}
              onClick={() => setSettingsData('')}
            >
              Clear
            </button>
          </div>
          
          <div style={{
            marginTop: '8px',
            padding: '6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 187, 255, 0.1)',
            fontSize: '10px'
          }}>
            💡 Paste or drop your server-settings.json file to configure your Discord server, roles, weapons, and armor options
          </div>
        </div>
      )}

      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}
    </div>
  );
};

export default DevUploader;
