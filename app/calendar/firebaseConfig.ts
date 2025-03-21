'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

// Analytics is only available in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  // Dynamically import analytics to avoid SSR issues
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(error => {
    console.error('Analytics failed to load', error);
  });
}

export { app, db, auth, analytics }; 