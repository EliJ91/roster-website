// ===============================
// SECTION: Roster Submission Handler (Netlify Function)
// ===============================

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { author, eventName, eventDescription, parties, createdBy } = body;

    // Validate required fields
    if (!author || !eventName || !parties || !Array.isArray(parties)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: author, eventName, parties' })
      };
    }

    // Validate that the first party is named "Main Party"
    if (parties.length > 0 && parties[0].name !== 'Main Party') {
      parties[0].name = 'Main Party';
    }

    const rosterData = {
      author,
      eventName,
      eventDescription: eventDescription || '',
      parties,
      createdBy: createdBy || { username: author },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
    };

    // Save to local file for development/backup
    const filePath = path.join(__dirname, 'rosters-dev.json');

    let existing = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        existing = JSON.parse(raw);
      } catch (parseError) {
        console.error('Error parsing existing rosters file:', parseError);
        existing = [];
      }
    }

    existing.push(rosterData);

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Roster saved successfully',
        rosterId: rosterData.id,
        savedAt: rosterData.createdAt
      })
    };

  } catch (error) {
    console.error('Roster submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save roster',
        details: error.message
      })
    };
  }
};
