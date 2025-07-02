// ===============================
// SECTION 8: Roster Signup Handler (Netlify Function)
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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.name || !body.rosterId || !body.roles || !body.weaponsByRole) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    // Prepare signup data
    const signupData = {
      userId: body.userId || Date.now().toString(),
      discordId: body.discordId || null,
      name: body.name,
      guildTag: body.guildTag || '',
      roles: body.roles,
      weaponsByRole: body.weaponsByRole,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rosterId: body.rosterId
    };
    
    // Save to Firestore
    let db;
    
    try {
      db = admin.firestore();
      
      // Add to signups collection with rosterId as document ID
      const signupsRef = db.collection('roster-signups').doc(body.rosterId);
      const signupsDoc = await signupsRef.get();
      
      if (signupsDoc.exists) {
        // Update existing signups document
        const currentSignups = signupsDoc.data().signups || [];
        
        // Check if user already signed up
        const userIndex = currentSignups.findIndex(s => 
          s.userId === signupData.userId || 
          (s.discordId && s.discordId === signupData.discordId)
        );
        
        if (userIndex >= 0) {
          // Update existing signup
          currentSignups[userIndex] = signupData;
          await signupsRef.update({
            signups: currentSignups,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Add new signup
          await signupsRef.update({
            signups: admin.firestore.FieldValue.arrayUnion(signupData),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      } else {
        // Create new signups document
        await signupsRef.set({
          rosterId: body.rosterId,
          signups: [signupData],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Signup submitted successfully' })
      };
    } catch (firestoreErr) {
      console.error('Firestore error:', firestoreErr);
      
      // Fallback to local file storage if Firestore fails
      console.log('Falling back to local storage...');
      
      // Store locally as a backup
      const filePath = path.join(__dirname, 'signups-dev.json');
      let existing = [];
      
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath);
        existing = JSON.parse(raw);
      }

      existing.push(body);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      
      return {
        statusCode: 207,
        body: JSON.stringify({ 
          message: 'Signup saved locally but not to database. The admin will need to manually process your signup.',
          warning: 'Database connection failed'
        })
      };
    }
    
  } catch (err) {
    console.error('Signup processing error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error processing signup' })
    };
  }
};
