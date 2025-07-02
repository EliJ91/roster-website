// ===============================
// Roster Signups Retrieval (Netlify Function)
// ===============================

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase if not already initialized
if (!admin.apps.length) {
  try {
    // Get firebase credentials from environment variables or config file
    let serviceAccount;
    
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      // Fallback to local file if environment variable isn't available or isn't valid JSON
      try {
        const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = require(serviceAccountPath);
        } else {
          console.warn('Firebase credentials file not found.');
        }
      } catch (err) {
        console.error('Error loading Firebase credentials:', err);
      }
    }

    // Initialize with credentials if available, otherwise use default
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Initialize without credentials (for development only)
      admin.initializeApp();
      console.warn('Firebase initialized without credentials. This should only happen in development.');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get rosterId from query parameters
    const rosterId = event.queryStringParameters?.rosterId;
    
    if (!rosterId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing rosterId parameter' })
      };
    }
    
    let signupsData;
    
    // Try to fetch from Firestore
    try {
      const db = admin.firestore();
      const signupsRef = db.collection('roster-signups').doc(rosterId);
      const signupsDoc = await signupsRef.get();
      
      if (signupsDoc.exists) {
        signupsData = signupsDoc.data();
      } else {
        // No signups found for this roster
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            rosterId,
            signups: [],
            message: 'No signups found for this roster' 
          })
        };
      }
    } catch (firestoreErr) {
      console.error('Firestore error:', firestoreErr);
      
      // Fallback to local file
      console.log('Falling back to local storage...');
      
      // Try to read from local file as fallback
      const filePath = path.join(__dirname, 'signups-dev.json');
      
      if (fs.existsSync(filePath)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          // Filter to only include signups for this roster
          const rosterSignups = fileData.filter(signup => signup.rosterId === rosterId);
          
          signupsData = {
            rosterId,
            signups: rosterSignups,
            source: 'local'
          };
        } catch (fileErr) {
          console.error('Error reading local file:', fileErr);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve signups data' })
          };
        }
      } else {
        // No local file, return empty array
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            rosterId,
            signups: [],
            message: 'No signups found for this roster',
            source: 'empty' 
          })
        };
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(signupsData)
    };
    
  } catch (err) {
    console.error('Error in get-roster-signups function:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
