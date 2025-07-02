// netlify/functions/update-server-settings.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
let serviceAccount;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else if (fs.existsSync(path.join(__dirname, '../../serviceAccountKey.json'))) {
  serviceAccount = require('../../serviceAccountKey.json');
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Function to write settings to a local JSON file as fallback
const writeLocalSettings = (settings) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, '../../serverSettings.json'),
      JSON.stringify(settings, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    console.error('Error writing local settings:', error);
    return false;
  }
};

// Update server settings
exports.handler = async function(event, context) {
  try {
    // Check for elevated role (can be implemented with JWT verification or other methods)
    
    // Parse the incoming settings data
    const settings = JSON.parse(event.body);
    
    // Basic validation
    if (!settings.guildId || !settings.elevatedRoleId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Required fields missing: guildId and elevatedRoleId are required'
        })
      };
    }
    
    // Add timestamp
    settings.updatedAt = new Date().toISOString();
    
    // Try to update in Firestore if admin is initialized
    let firestoreSuccess = false;
    if (admin.apps.length) {
      const db = admin.firestore();
      await db.collection('serverSettings').doc('config').set(settings);
      firestoreSuccess = true;
      console.log('Settings updated in Firestore');
    }
    
    // Fallback to local file if Firestore update failed or not available
    let localSuccess = false;
    if (!firestoreSuccess) {
      localSuccess = writeLocalSettings(settings);
      console.log('Settings saved to local file');
    }
    
    if (!firestoreSuccess && !localSuccess) {
      throw new Error('Failed to save settings to any storage');
    }
    
    // Update environment variables for the current session (note: this won't persist across deployments)
    process.env.DISCORD_GUILD_ID = settings.guildId;
    process.env.ELEVATED_ROLE_ID = settings.elevatedRoleId;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: firestoreSuccess ? 'Settings updated in database' : 'Settings saved locally',
        data: { firestoreSuccess, localSuccess }
      })
    };
  } catch (error) {
    console.error('Error updating server settings:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
