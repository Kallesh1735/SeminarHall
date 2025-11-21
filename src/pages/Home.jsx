 // src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 18 }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/mnt/data/95eb0017-c67e-4a88-813a-c2f3a32bb600.png" alt="logo" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8 }} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>Seminar Hall Booking</h2>
            <p className="small" style={{ marginTop: 6, color: "var(--muted)" }}>
              Reserve seminar halls & auditoriums quickly — admins approve requests.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/signin"><button style={{ padding: "8px 12px", borderRadius: 8 }}>Sign In</button></Link>
            <Link to="/signup"><button className="primary" style={{ padding: "8px 12px", borderRadius: 8 }}>Sign Up</button></Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
          <div className="card" style={{ padding: 16 }}>
            <h3>Admin</h3>
            <p className="small">Review and manage bookings</p>
            <ul>
              <li>Approve / Reject requests</li>
              <li>Export booking CSV</li>
              <li>Delete or edit bookings</li>
            </ul>
            <div style={{ marginTop: 12 }}>
              <Link to="/admin-signup"><button className="primary">Admin Sign Up</button></Link>
              <Link to="/signin" style={{ marginLeft: 8 }}><button>Admin Sign In</button></Link>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h3>Student / Faculty / Staff</h3>
            <p className="small">Book rooms for classes, seminars, and events</p>
            <ul>
              <li>See room availability</li>
              <li>Create, edit, cancel bookings</li>
              <li>View booking status (pending/approved/rejected)</li>
            </ul>
            <div style={{ marginTop: 12 }}>
              <Link to="/signup"><button className="primary">Sign Up</button></Link>
              <Link to="/signin" style={{ marginLeft: 8 }}><button>Sign In</button></Link>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 18, padding: 16 }}>
          <h3>How it works (quick)</h3>
          <ol>
            <li>Choose your role: Admin or Student/Faculty/Staff.</li>
            <li>Sign up / sign in, then view rooms.</li>
            <li>Create a booking — admin later approves or rejects it.</li>
            <li>Track status from My Bookings.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}