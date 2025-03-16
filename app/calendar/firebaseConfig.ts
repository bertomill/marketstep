// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATZ3k6n9G7-2bGaNyzpNLWK9_3EV2-v24",
  authDomain: "marekt-b3d73.firebaseapp.com",
  projectId: "marekt-b3d73",
  storageBucket: "marekt-b3d73.firebasestorage.app",
  messagingSenderId: "458710617589",
  appId: "1:458710617589:web:d443265de362133df124bc",
  measurementId: "G-X6EKD6NZ0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// Analytics may not work in server components, so we need to check if window is defined
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, db, auth, analytics }; 