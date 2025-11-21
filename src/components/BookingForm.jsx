 // src/components/BookingForm.jsx
import React, { useEffect, useState } from "react";
import { bookingsCol, addDoc, getDocs, query, where } from "../firebase";

const SLOT_START = 8;
const SLOT_END = 20;

const slotLabel = (h) =>
  `${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`;

export default function BookingForm({
  room,
  onClose,
  initialBooking = null,
  onCreated = null
}) {
  const [date, setDate] = useState(initialBooking?.date || "");
  const [slot, setSlot] = useState(initialBooking?.slot ?? SLOT_START);
  const [duration, setDuration] = useState(initialBooking?.duration ?? 1);
  const [name, setName] = useState(initialBooking?.name || "");
  const [email, setEmail] = useState(initialBooking?.email || "");
  const [purpose, setPurpose] = useState(initialBooking?.purpose || "");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState([]);

  useEffect(() => {
    if (!date) {
      setExisting([]);
      return;
    }
    (async () => {
      try {
        const q = query(
          bookingsCol,
          where("roomId", "==", room.id),
          where("date", "==", date)
        );
        const snap = await getDocs(q);
        setExisting(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to fetch existing bookings:", err);
        setExisting([]);
      }
    })();
  }, [room, date]);

  const maxDuration = Math.max(1, SLOT_END - Number(slot));

  function getRequestedSlots(startSlot, dur) {
    const arr = [];
    for (let i = 0; i < dur; i++) arr.push(Number(startSlot) + i);
    return arr;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date) return alert("Please choose a date.");
    if (!name) return alert("Please enter your name.");

    const requested = getRequestedSlots(slot, duration);
    setLoading(true);

    try {
      const q = query(
        bookingsCol,
        where("roomId", "==", room.id),
        where("date", "==", date),
        where("slot", "in", requested)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("Conflict: one or more of the requested slots are already booked.");
        setLoading(false);
        return;
      }

      const payload = {
        roomId: room.id,
        roomName: room.name || "",
        date,
        slot: Number(slot),
        duration: Number(duration),
        name,
        email,
        purpose,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(bookingsCol, payload);
      alert("Booking created.");
      if (onCreated) onCreated(docRef.id);
      if (onClose) onClose(true);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed. See console.");
    } finally {
      setLoading(false);
    }
  }

  const slots = [];
  for (let h = SLOT_START; h < SLOT_END; h++) slots.push(h);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(3px)",
          zIndex: 1000
        }}
        onClick={() => onClose && onClose(false)}
      />

      {/* Centered modal */}
      <div
        className="card"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: 500,
          zIndex: 1001,
          padding: 20
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {initialBooking ? "Edit booking" : "Book"}: {room.name}
        </h3>

        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          <div className="row">
            <label style={{ minWidth: 90 }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="row">
            <label style={{ minWidth: 90 }}>Start</label>
            <select value={slot} onChange={(e) => setSlot(Number(e.target.value))}>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {slotLabel(s)}
                </option>
              ))}
            </select>

            <label style={{ marginLeft: 8 }}>Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {Array.from({ length: maxDuration }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d} hour{d > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label style={{ minWidth: 90 }}>Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="row">
            <label style={{ minWidth: 90 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="row">
            <label style={{ minWidth: 90 }}>Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Purpose of booking (meeting, seminar, event...)"
              style={{ width: "100%", height: 60 }}
            />
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <button type="submit" className="primary" disabled={loading}>
              {loading
                ? "Working…"
                : initialBooking
                ? "Create & replace"
                : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={() => onClose && onClose(false)}
              className="ghost"
              style={{ marginLeft: 8 }}
            >
              Close
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Existing bookings for {date || "(choose a date)"}:</strong>
            <ul style={{ paddingLeft: 0 }} className="booking-list">
              {existing.length === 0 && (
                <li className="text-muted">No bookings</li>
              )}
              {existing.map((b) => (
                <li key={b.id} className="booking-card">
                  {String(b.slot).padStart(2, "0")}:00 -{" "}
                  {String((b.slot || 0) + (b.duration || 1)).padStart(
                    2,
                    "0"
                  )}
                  :00 — {b.name || b.email || "booked"}
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>
    </>
  );
}