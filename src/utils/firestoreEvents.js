// src/utils/firestoreEvents.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// API function to submit roster via Netlify function (backup)
export async function submitRosterAPI(rosterData) {
  try {
    const response = await fetch('/.netlify/functions/submit-roster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rosterData)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.rosterId;
  } catch (error) {
    console.error('API submission failed:', error);
    throw error;
  }
}

// CREATE: Add a new roster
export async function createRoster({ author, eventName, eventDescription, parties, createdBy }) {
  try {
    // Clean up createdBy to remove undefined values
    let cleanCreatedBy = null;
    if (createdBy) {
      cleanCreatedBy = {};
      if (createdBy.discordId) cleanCreatedBy.discordId = createdBy.discordId;
      if (createdBy.id) cleanCreatedBy.id = createdBy.id;
      if (createdBy.username) cleanCreatedBy.username = createdBy.username;
      if (createdBy.displayName) cleanCreatedBy.displayName = createdBy.displayName;
      if (createdBy.nickname) cleanCreatedBy.nickname = createdBy.nickname;
      if (createdBy.nick) cleanCreatedBy.nick = createdBy.nick;
      
      // If no valid properties found, set to null
      if (Object.keys(cleanCreatedBy).length === 0) {
        cleanCreatedBy = null;
      }
    }

    // Try Firebase first
    const docData = {
      author,
      eventName,
      eventDescription,
      parties, // array of party objects with name and positions
      createdBy: cleanCreatedBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "rosters"), docData);
    return docRef.id;
  } catch (firebaseError) {
    console.warn('Firebase save failed, trying API fallback:', firebaseError);
    
    // Fallback to API
    try {
      return await submitRosterAPI({
        author,
        eventName,
        eventDescription,
        parties,
        createdBy
      });
    } catch (apiError) {
      console.error('Both Firebase and API submission failed');
      throw new Error(`Failed to save roster: ${apiError.message}`);
    }
  }
}

// API function to get rosters via Netlify function (backup)
export async function getRostersAPI() {
  try {
    const response = await fetch('/.netlify/functions/get-rosters', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.rosters || [];
  } catch (error) {
    console.error('API get rosters failed:', error);
    throw error;
  }
}

// READ: Get all rosters
export async function getRosters() {
  try {
    // Try Firebase first
    const q = query(collection(db, "rosters"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (firebaseError) {
    console.warn('Firebase get rosters failed, trying API fallback:', firebaseError);
    
    // Fallback to API
    try {
      return await getRostersAPI();
    } catch (apiError) {
      console.error('Both Firebase and API get rosters failed');
      throw new Error(`Failed to retrieve rosters: ${firebaseError.message || apiError.message}`);
    }
  }
}

// UPDATE: Update a roster by ID
export async function updateRoster(rosterId, updatedData) {
  const rosterRef = doc(db, "rosters", rosterId);
  await updateDoc(rosterRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
}

// DELETE: Delete a roster by ID
export async function deleteRoster(rosterId) {
  await deleteDoc(doc(db, "rosters", rosterId));
}

// Legacy event functions (keeping for backwards compatibility)
// CREATE: Add a new event
export async function createEvent({ author, name, description, parties }) {
  const docRef = await addDoc(collection(db, "events"), {
    author,
    createdAt: serverTimestamp(),
    name,
    description,
    parties, // array of party objects
  });
  return docRef.id;
}

// READ: Get all events
export async function getEvents() {
  const querySnapshot = await getDocs(collection(db, "events"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// UPDATE: Update an event by ID
export async function updateEvent(eventId, updatedData) {
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, updatedData);
}

// DELETE: Delete an event by ID
export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, "events", eventId));
}

// LIVE ROSTER MANAGEMENT: Set a roster as live (overwrites existing live roster)
export async function setLiveRoster(rosterData) {
  try {
    // Use a fixed document ID to ensure only one live roster exists
    const liveRosterRef = doc(db, "liverosters", "current");
    
    // Add metadata for live roster
    const liveRosterData = {
      ...rosterData,
      madeAt: serverTimestamp(),
      originalRosterId: rosterData.id // Keep reference to original roster
    };
    
    // Use setDoc to overwrite any existing live roster
    await setDoc(liveRosterRef, liveRosterData);
    return "current"; // Return the document ID
  } catch (error) {
    console.error('Failed to set live roster:', error);
    throw new Error(`Failed to set live roster: ${error.message}`);
  }
}

// Get the current live roster
export async function getLiveRoster() {
  try {
    const liveRosterRef = doc(db, "liverosters", "current");
    const docSnap = await getDocs(collection(db, "liverosters"));
    
    if (!docSnap.empty) {
      const liveRosterDoc = docSnap.docs[0];
      return { id: liveRosterDoc.id, ...liveRosterDoc.data() };
    } else {
      return null; // No live roster exists
    }
  } catch (error) {
    console.error('Failed to get live roster:', error);
    throw new Error(`Failed to get live roster: ${error.message}`);
  }
}

// Check if a live roster currently exists
export async function hasLiveRoster() {
  try {
    const querySnapshot = await getDocs(collection(db, "liverosters"));
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Failed to check for live roster:', error);
    return false;
  }
}
