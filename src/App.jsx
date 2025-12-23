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
  getDocs,
  onAuthChanged,
  signOutUser
} from "./firebase";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalBookings, setTotalBookings] = useState(null);

  /* ---------- AUTH STATE ---------- */
  useEffect(() => {
    const unsub = onAuthChanged((u) => {
      if (u) {
        setUser({ uid: u.uid, email: u.email });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  /* ---------- BOOKING COUNT (AUTH ONLY) ---------- */
  useEffect(() => {
    if (!user) {
      setTotalBookings(null);
      return;
    }

    async function loadCount() {
      try {
        const snap = await getDocs(bookingsCol);
        setTotalBookings(snap.size);
      } catch (err) {
        console.error("Booking count fetch failed:", err);
      }
    }

    loadCount();
  }, [user]);

  /* ---------- SIGN OUT ---------- */
  async function logout() {
    try {
      await signOutUser();
    } catch (err) {
      console.warn("Sign out failed:", err);
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header>
        <div className="header-left">
          <h1>Seminar Hall Booking</h1>

          {location.pathname !== "/" && user && (
            <nav className="nav-links">
              <Link to="/rooms">Rooms</Link>
              <Link to="/my">My Bookings</Link>
              <Link to="/admin">Admin</Link>
            </nav>
          )}
        </div>

        <div className="header-right">
          {user && (
            <div className="bookings-badge">
              Bookings: <strong>{totalBookings ?? "..."}</strong>
            </div>
          )}

          <ThemeToggle />

          {user ? (
            <div className="auth-area">
              <span className="user-email">{user.email}</span>
              <button onClick={logout} className="btn-signout">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ minWidth: 80 }} />
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

          {/* Admin page does its own admin verification */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />
        </Routes>
      </main>
    </div>
  );
}
