 // src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmail } from "../firebase";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate("/"); // auto-redirect based on role (handled in App.jsx)
    } catch (err) {
      console.error(err);
      setErrorMsg("Invalid email or password.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-card">
      <h2>Sign In</h2>
      <div className="subtitle">Access your dashboard</div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="yourname@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <div className="auth-actions">
          <button className="primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}