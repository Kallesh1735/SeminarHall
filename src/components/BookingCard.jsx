 // src/components/BookingCard.jsx
// Polished booking card to match index.css styles.
// Screenshot reference (optional): /mnt/data/847fcd26-43cd-4c3d-8c39-df94e2bd9caf.png

import React from "react";

export default function BookingCard({ booking, onCancel }) {
  const start = booking.slot;
  const end = (booking.slot || 0) + (booking.duration || 1);

  return (
    <div className="booking-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700 }}>{booking.roomName || booking.roomId}</div>
        <div style={{ fontSize: 13, color: "#334155" }}>
          {booking.date} • {String(start).padStart(2,"0")}:00 - {String(end).padStart(2,"0")}:00
        </div>
        <div style={{ marginTop: 6, fontSize: 13 }}>
          {booking.name || "—"}{booking.email ? ` • ${booking.email}` : ""}
        </div>
      </div>

      {onCancel ? (
        <div style={{ marginLeft: 12 }}>
          <button className="delete-btn" onClick={onCancel}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}
