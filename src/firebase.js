// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlH7Ofkx4KflgbOJVs5noRTzhQyKWwzmc",
  authDomain: "roster-website.firebaseapp.com",
  projectId: "roster-website",
  storageBucket: "roster-website.firebasestorage.app",
  messagingSenderId: "6357289855",
  appId: "1:6357289855:web:3f1358f8dadad536b9e84a",
  measurementId: "G-W02010499E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
