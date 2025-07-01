// ===============================
// SECTION: Get Rosters Handler (Netlify Function)
// ===============================

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const filePath = path.join(__dirname, 'rosters-dev.json');

    if (!fs.existsSync(filePath)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          rosters: [],
          message: 'No rosters found'
        })
      };
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const rosters = JSON.parse(raw);

    // Sort by creation date (newest first)
    rosters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        rosters: rosters,
        count: rosters.length
      })
    };

  } catch (error) {
    console.error('Get rosters error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to retrieve rosters',
        details: error.message
      })
    };
  }
};
