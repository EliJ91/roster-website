// src/utils/firestoreEvents.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

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
