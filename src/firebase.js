 import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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

const firebaseConfig = {
  apiKey: "AIzaSyABbiOx1ZEdRyveJ9-BdY9DnRt2Q277YNw",
  authDomain: "seminar-booking-e7080.firebaseapp.com",
  projectId: "seminar-booking-e7080",
  storageBucket: "seminar-booking-e7080.appspot.com",
  messagingSenderId: "230575593148",
  appId: "1:230575593148:web:62666f43aa0a8b8bf122b9",
  measurementId: "G-TN5288C768"
};

const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);
const roomsCol = collection(db, "rooms");
const bookingsCol = collection(db, "bookings");

// Auth helpers
const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

const signOutUser = () => signOut(auth);

const onAuthChanged = (cb) => onAuthStateChanged(auth, cb);

export {
  app,
  auth,
  db,
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
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  onAuthChanged
};
