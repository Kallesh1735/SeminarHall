// src/pages/RoomsPage.jsx
import React, { useEffect, useState } from "react";
import { roomsCol, bookingsCol, getDocs, query, where } from "../firebase";
import BookingForm from "../components/BookingForm";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dateForPreview, setDateForPreview] = useState("");
  const [roomBookings, setRoomBookings] = useState({}); // { roomId: [bookings] }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(roomsCol);
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRooms(arr);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch rooms. Check console.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadBookingsForDate(date) {
    if (!date) return setRoomBookings({});
    const map = {};
    for (const r of rooms) {
      try {
        const q = query(bookingsCol, where("roomId", "==", r.id), where("date", "==", date));
        const snap = await getDocs(q);
        map[r.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.error("Failed bookings", err);
        map[r.id] = [];
      }
    }
    setRoomBookings(map);
  }

  return (
    <div className="mt-4">
      <h2>Rooms</h2>

      <div className="flex gap-4 items-center mb-4">
        <label className="mb-0">Preview date:</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateForPreview}
            onChange={e => setDateForPreview(e.target.value)}
            style={{ width: 'auto' }}
          />
          <button className="btn-ghost" onClick={() => loadBookingsForDate(dateForPreview)}>
            Load bookings
          </button>
        </div>
      </div>

      {loading ? <div>Loading rooms…</div> : null}

      <div className="room-grid">
        {rooms.map(r => (
          <div key={r.id} className="room-card">
            <h3>{r.name}</h3>
            <div className="text-muted mb-4">{r.type} • capacity: {r.capacity}</div>

            <div className="mb-4" style={{ fontSize: '0.9rem' }}>
              <strong>Features:</strong> {(r.features || []).join(", ")}
            </div>

            <div className="flex gap-2 mb-4">
              <button className="btn-primary" onClick={() => setSelectedRoom(r)}>Book / View</button>
              <button
                className="btn-ghost"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setSelectedRoom(r);
                  setDateForPreview(today);
                  loadBookingsForDate(today);
                }}
              >
                Quick today
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <strong style={{ fontSize: '0.9rem' }}>Bookings on {dateForPreview || "(select a date)"}</strong>
              <ul className="mt-4" style={{ paddingLeft: 0 }}>
                {(roomBookings[r.id] || []).length === 0 ? (
                  <li className="text-muted" style={{ fontSize: '0.85rem' }}>No bookings</li>
                ) : (
                  (roomBookings[r.id] || []).map(b => (
                    <li key={b.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      {String(b.slot).padStart(2, "0")}:00 - {String(b.slot + (b.duration || 1)).padStart(2, "0")}:00 — {b.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div style={{ marginTop: 18 }}>
          <BookingForm
            room={selectedRoom}
            onClose={() => {
              setSelectedRoom(null);
              loadBookingsForDate(dateForPreview);
            }}
          />
        </div>
      )}
    </div>
  );
}