const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const defaultSettings = require('./server-settings');

// Load environment variables
require('dotenv').config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeServerSettings() {
  try {
    // Set the server settings document in Firestore
    await setDoc(doc(db, "serverSettings", "config"), defaultSettings);
    console.log("✅ Server settings initialized successfully!");
    
    // Save a local copy with timestamp for backup
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(__dirname, `server-settings-backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(defaultSettings, null, 2));
    console.log(`✅ Settings backup saved to ${backupPath}`);
    
  } catch (error) {
    console.error("❌ Error initializing server settings:", error);
  }
}

// Run the initialization
initializeServerSettings()
  .then(() => console.log("Done!"))
  .catch((err) => console.error("Fatal error:", err));
