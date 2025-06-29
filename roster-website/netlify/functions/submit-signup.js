// ===============================
// SECTION 8: Local Signup Save (Netlify Function Version)
// ===============================

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const body = JSON.parse(event.body);
  const filePath = path.join(__dirname, 'signups-dev.json');

  try {
    let existing = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath);
      existing = JSON.parse(raw);
    }

    existing.push(body);

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Signup saved locally.' })
    };
  } catch (err) {
    console.error('Local save error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not save signup locally.' })
    };
  }
};
