// src/pages/AdminSignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail, addDoc, collection, db } from "../firebase";

/*
  Admin signup page
  - Admins must enter a secret code (change ADMIN_SECRET)
  - Creates Firebase Auth user + writes Firestore record in `admins` collection
*/

const ADMIN_SECRET = "letmein123"; // change this before deploying

export default function AdminSignUp() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Enter your full name.");
      return;
    }

    if (adminCode !== ADMIN_SECRET) {
      setErrorMsg("Invalid admin secret code.");
      return;
    }

    setLoading(true);

    try {
      // Create firebase auth user
      const userCredential = await signUpWithEmail(email, password);

      // Create Firestore admin record (IMPORTANT: correct collection syntax)
      await addDoc(collection(db, "admins"), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: fullName.trim(),
        createdAt: new Date().toISOString()
      });

      alert("Admin account created. Please sign in.");
      nav("/signin");
    } catch (err) {
      console.error("Admin sign up failed:", err);
      setErrorMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Admin Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Admin name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="min 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Admin Secret Code</label>
            <input
              type="text"
              placeholder="Enter admin secret"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div className="text-center mb-4" style={{ color: "var(--danger)" }}>{errorMsg}</div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}