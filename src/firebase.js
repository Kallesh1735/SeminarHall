 // src/firebase.js
// Firebase initialization: Firestore + Auth
// NOTE: this file preserves your Firestore exports and adds small Auth helpers.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc
} from "firebase/firestore";

/* ---------- your firebase config (keep these values) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyABbiOx1ZEdRyveJ9-BdY9DnRt2Q277YNw",
  authDomain: "seminar-booking-e7080.firebaseapp.com",
  projectId: "seminar-booking-e7080",
  storageBucket: "seminar-booking-e7080.appspot.com",
  messagingSenderId: "230575593148",
  appId: "1:230575593148:web:62666f43aa0a8b8bf122b9",
  measurementId: "G-TN5288C768"
};
/* -------------------------------------------------------------- */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore collections (same names your app already uses)
const roomsCol = collection(db, "rooms");
const bookingsCol = collection(db, "bookings");

// Auth
const auth = getAuth(app);

/* ---------- small auth helper wrappers used by pages ---------- */
async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function signOutUser() {
  return fbSignOut(auth);
}

function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}
/* -------------------------------------------------------------- */

export {
  app,
  db,
  auth,
  roomsCol,
  bookingsCol,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  // auth helpers
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  onAuthChanged
};