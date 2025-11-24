// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="card mb-4">
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          {/* Logo placeholder if needed, or just remove */}
          {/* <div className="logo-placeholder"></div> */}

          <div style={{ flex: 1 }}>
            <h2>Seminar Hall Booking</h2>
            <p>
              Reserve seminar halls & auditoriums quickly — admins approve requests.
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/signin"><button className="btn-ghost">Sign In</button></Link>
            <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
          </div>
        </div>
      </div>

      <div className="room-grid mb-4">
        <div className="card">
          <h3>Admin</h3>
          <p className="mb-4">Review and manage bookings</p>
          <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Approve / Reject requests</li>
            <li>Export booking CSV</li>
            <li>Delete or edit bookings</li>
          </ul>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/admin-signup"><button className="btn-primary">Admin Sign Up</button></Link>
            <Link to="/signin"><button className="btn-ghost">Admin Sign In</button></Link>
          </div>
        </div>

        <div className="card">
          <h3>Student / Faculty / Staff</h3>
          <p className="mb-4">Book rooms for classes, seminars, and events</p>
          <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>See room availability</li>
            <li>Create, edit, cancel bookings</li>
            <li>View booking status</li>
          </ul>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
            <Link to="/signin"><button className="btn-ghost">Sign In</button></Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>How it works (quick)</h3>
        <ol style={{ paddingLeft: 20 }}>
          <li>Choose your role: Admin or Student/Faculty/Staff.</li>
          <li>Sign up / sign in, then view rooms.</li>
          <li>Create a booking — admin later approves or rejects it.</li>
          <li>Track status from My Bookings.</li>
        </ol>
      </div>
    </div>
  );
}