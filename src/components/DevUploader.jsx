import React, { useState } from 'react';
import { createRoster } from '../utils/firestoreEvents';

const DevUploader = () => {
  const [jsonData, setJsonData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    width: '280px',
    maxHeight: '60vh',
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>🛠️ DEV ROSTER UPLOADER</span>
        <button 
          style={toggleButtonStyle}
          onClick={() => setIsExpanded(false)}
        >
          ×
        </button>
      </div>
      
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

      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}
    </div>
  );
};

export default DevUploader;
