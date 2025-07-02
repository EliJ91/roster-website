// netlify/functions/get-server-settings.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

// Function to fetch Discord guild info
async function fetchGuildInfo(guildId) {
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!BOT_TOKEN) {
      throw new Error('Discord bot token is not configured');
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      guildName: data.name,
      guildIcon: data.icon
    };
  } catch (error) {
    console.error('Error fetching guild info:', error);
    return null;
  }
}

// Default server settings
const defaultSettings = {
  guildId: process.env.DISCORD_GUILD_ID || '',
  elevatedRoleId: process.env.ELEVATED_ROLE_ID || '',
  guildName: 'Conflict',
  roles: [
    'Main Caller',
    'Backup Caller',
    'Tank',
    'Healer',
    'DPS',
    'Support',
    'Battlemount',
  ],
  weaponsByRole: {
    'Main Caller': ['Quarterstaff', 'Arcane Staff'],
    'Backup Caller': ['Quarterstaff', 'Arcane Staff'],
    'Tank': ['Mace', 'Hammer', 'Morning Star'],
    'Healer': ['Holy Staff', 'Divine Staff', 'Nature Staff'],
    'DPS': ['Fire Staff', 'Frost Staff', 'Bow', 'Spear'],
    'Support': ['Cursed Staff', 'Arcane Staff'],
    'Battlemount': ['Quarterstaff', 'Heavy Mace']
  },
  armorOptions: {
    head: ['Scholar Cowl', 'Cleric Cowl', 'Mage Cowl'],
    chest: ['Scholar Robe', 'Cleric Robe', 'Mage Robe'],
    feet: ['Scholar Sandals', 'Cleric Sandals', 'Mage Sandals']
  }
};

// Function to get settings from a local JSON file as fallback
const getLocalSettings = () => {
  try {
    if (fs.existsSync(path.join(__dirname, '../../serverSettings.json'))) {
      const data = fs.readFileSync(path.join(__dirname, '../../serverSettings.json'), 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading local settings:', error);
    return null;
  }
};

// Get server settings from Firestore
exports.handler = async function(event, context) {
  try {
    // Check if this is a POST request with a guild ID to fetch guild info
    if (event.httpMethod === 'POST') {
      let requestBody;
      try {
        requestBody = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: 'Invalid JSON' })
        };
      }

      if (requestBody.guildId) {
        // Fetch guild info from Discord API
        const guildInfo = await fetchGuildInfo(requestBody.guildId);
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            guildName: guildInfo ? guildInfo.guildName : null,
            guildIcon: guildInfo ? guildInfo.guildIcon : null
          })
        };
      }
    }

    // For GET requests, return server settings
    let settings;
    
    // Try to get from Firestore if admin is initialized
    if (admin.apps.length) {
      const db = admin.firestore();
      const settingsDoc = await db.collection('serverSettings').doc('config').get();
      
      if (settingsDoc.exists) {
        settings = settingsDoc.data();
        console.log('Settings fetched from Firestore');
      }
    }
    
    // If not found in Firestore, try local file
    if (!settings) {
      settings = getLocalSettings();
      console.log('Settings fetched from local file');
    }
    
    // If still no settings, use defaults
    if (!settings) {
      settings = defaultSettings;
      console.log('Using default settings');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: settings
      })
    };
  } catch (error) {
    console.error('Error getting server settings:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
