 // src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpWithEmail } from "../firebase";

export default function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    setLoading(true);
    try {
      // sign up helper (should create firebase auth user)
      await signUpWithEmail(email, password);

      // (Optional) you could write the display name or user record to Firestore here.
      // For now we rely on the auth state listener in App.jsx to redirect the user.

      // navigate to root — App.jsx will auto-redirect based on role/admin check
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Sign up failed:", err);
      setErrorMsg(err?.message || "Sign up failed — check your input and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <div className="subtitle">Sign up and reserve rooms</div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <div className="form-row">
          <label>Full name</label>
          <input
            type="text"
            required
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Choose a password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <div className="auth-actions">
          <button className="primary" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </form>
    </div>
  );
}