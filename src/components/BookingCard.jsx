// src/components/BookingCard.jsx
import React from "react";

export default function BookingCard({ booking, onCancel }) {
  const start = booking.slot;
  const end = (booking.slot || 0) + (booking.duration || 1);

  return (
    <div className="booking-card flex justify-between items-center">
      <div>
        <div style={{ fontWeight: 700 }}>{booking.roomName || booking.roomId}</div>
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          {booking.date} • {String(start).padStart(2, "0")}:00 - {String(end).padStart(2, "0")}:00
        </div>
        <div className="text-muted" style={{ marginTop: 6, fontSize: '0.85rem' }}>
          {booking.name || "—"}{booking.email ? ` • ${booking.email}` : ""}
        </div>
      </div>

      {onCancel ? (
        <div style={{ marginLeft: 12 }}>
          <button className="btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={onCancel}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}

