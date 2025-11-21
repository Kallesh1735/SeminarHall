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
    <div style={{ marginTop: 20 }}>
      <h2>Rooms</h2>

      <div style={{ marginTop: 8 }}>
        <label>
          Preview date:{" "}
          <input
            value={dateForPreview}
            onChange={e => setDateForPreview(e.target.value)}
            placeholder="2025-11-21"
          />
        </label>
        <button style={{ marginLeft: 8 }} onClick={() => loadBookingsForDate(dateForPreview)}>
          Load bookings
        </button>
      </div>

      {loading ? <div>Loading rooms…</div> : null}

      {/* room grid uses CSS class from index.css */}
      <div className="room-grid">
        {rooms.map(r => (
          <div key={r.id} className="card">
            <h3>{r.name}</h3>
            <div className="muted">{r.type} • capacity: {r.capacity}</div>

            <div className="features" style={{ marginTop: 8 }}>
              <strong>Features:</strong> {(r.features || []).join(", ")}
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="primary" onClick={() => setSelectedRoom(r)}>Book / View</button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setSelectedRoom(r);
                  setDateForPreview(today);
                  loadBookingsForDate(today);
                }}
                style={{ marginLeft: 8 }}
              >
                Quick today
              </button>
            </div>

            <div className="booking-list">
              <strong>Bookings on {dateForPreview || "(select a date)"}</strong>
              <ul style={{ paddingLeft: 0 }}>
                {(roomBookings[r.id] || []).length === 0 ? (
                  <li className="text-muted">No bookings</li>
                ) : (
                  (roomBookings[r.id] || []).map(b => (
                    <li key={b.id} className="booking-card">
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