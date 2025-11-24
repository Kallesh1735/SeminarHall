// src/App.jsx
import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import RoomsPage from "./pages/RoomsPage";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AdminSignUp from "./pages/AdminSignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import ThemeToggle from "./components/ThemeToggle";

import {
  bookingsCol,
  getDocs as getDocsFirestore,
  onAuthChanged,
  signOutUser,
  db,
  collection,
  query,
  where
} from "./firebase";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalBookings, setTotalBookings] = useState(null);

  // Listen for auth changes (keeps user state in sync)
  useEffect(() => {
    const unsub = onAuthChanged((u) => {
      if (u) {
        setUser({ email: u.email, uid: u.uid });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Auto-redirect when a signed-in user lands on Home (/)
  useEffect(() => {
    if (!user || location.pathname !== "/") return;

    (async () => {
      try {
        const q = query(collection(db, "admins"), where("uid", "==", user.uid));
        const snap = await getDocsFirestore(q);
        if (!snap.empty) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/rooms", { replace: true });
        }
      } catch (err) {
        console.warn("Auto-redirect admin check failed:", err);
        navigate("/rooms", { replace: true });
      }
    })();
  }, [user, location.pathname, navigate]);

  // fetch total bookings count (for header badge)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocsFirestore(bookingsCol);
        setTotalBookings(snap.size);
      } catch (err) {
        console.error("Failed to fetch booking count", err);
      }
    })();
  }, []);

  // Sign out and return to landing page — robust for both admin & users
  async function logout() {
    try {
      await signOutUser();
    } catch (err) {
      console.warn("Sign out failed (but will still redirect):", err);
    } finally {
      // always navigate back to Home after sign out attempt
      try { navigate("/"); } catch (e) { /* ignore */ }
      alert("Signed out");
    }
  }

  return (
    <div className="app-container">
      {/* SINGLE HEADER */}
      <header>
        <div className="header-left">
          <h1>Seminar Hall Booking</h1>

          {/* Show navigation when NOT on Home (so Home is a clean landing) */}
          {location.pathname !== "/" && (
            <nav className="nav-links">
              <Link to="/rooms">Rooms</Link>
              <Link to="/my">My Bookings</Link>
              <Link to="/admin">Admin</Link>
            </nav>
          )}
        </div>

        <div className="header-right">
          <div className="bookings-badge">
            Bookings: <strong>{totalBookings ?? "..."}</strong>
          </div>

          {/* Theme toggle - might be redundant if we enforce dark mode, but keeping for now */}
          <ThemeToggle />

          {/* If logged in show email + logout; if not logged in show nothing (signin/signup are on Home) */}
          {user ? (
            <div className="auth-area">
              <span className="user-email">{user.email}</span>
              <button onClick={logout} className="btn-signout">Sign Out</button>
            </div>
          ) : (
            <div style={{ minWidth: 80 }} /> /* placeholder to keep header alignment */
          )}
        </div>
      </header>

      {/* ROUTES */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/rooms"
            element={
              <ProtectedRoute user={user}>
                <RoomsPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my"
            element={
              <ProtectedRoute user={user}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<Admin />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />
        </Routes>
      </main>
    </div>
  );
}