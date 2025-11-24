// src/pages/MyBookings.jsx
import React, { useEffect, useState } from "react";
import { bookingsCol, getDocs, query, where, deleteDoc, doc, onAuthChanged } from "../firebase";

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  // Try to auto-fill from signed-in user
  useEffect(() => {
    const unsub = onAuthChanged((u) => {
      if (u && u.email) setEmail(u.email);
      setUserChecked(true);
    });
    return () => unsub();
  }, []);

  async function loadMyBookings() {
    if (!email) return alert("Enter an email to load bookings.");
    setLoading(true);
    try {
      const q = query(bookingsCol, where("email", "==", email));
      const snap = await getDocs(q);
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // sort by date+slot
      arr.sort((a, b) => {
        if (a.date === b.date) return (a.slot || 0) - (b.slot || 0);
        return a.date < b.date ? -1 : 1;
      });
      setBookings(arr);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      alert("Failed to load bookings. See console.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bid) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await deleteDoc(doc(bookingsCol, bid));
      setBookings(bookings.filter(b => b.id !== bid));
      alert("Canceled.");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Failed to cancel. See console.");
    }
  }

  // status -> badge style
  function StatusBadge({ status }) {
    const s = (status || "pending").toLowerCase();
    let badgeClass = "badge-warning";
    if (s === "approved") badgeClass = "badge-success";
    if (s === "rejected") badgeClass = "badge-danger";

    return <div className={`badge ${badgeClass}`}>{s}</div>;
  }

  return (
    <div className="mt-4">
      <h2>My Bookings</h2>

      <div className="flex gap-4 items-center mb-4" style={{ flexWrap: "wrap" }}>
        <input
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: 'auto', minWidth: 260 }}
        />
        <button onClick={loadMyBookings} className="btn-primary" disabled={loading}>
          {loading ? "Loading…" : "Load my bookings"}
        </button>

        <div className="text-muted" style={{ marginLeft: "auto", fontSize: '0.85rem' }}>
          Tip: approved bookings are confirmed by admin.
        </div>
      </div>

      {!userChecked && <div>Checking sign-in status…</div>}

      <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
        {bookings.length === 0 && !loading && <div className="text-muted">No bookings found.</div>}

        {bookings.map(b => (
          <div key={b.id} className="card">
            <div className="flex justify-between items-center gap-4" style={{ flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.roomName || b.roomId}</div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {b.date} • {String(b.slot).padStart(2, "0")}:00 - {String((b.slot || 0) + (b.duration || 1)).padStart(2, "0")}:00
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <StatusBadge status={b.status} />
                <div style={{ textAlign: "right", fontSize: '0.9rem' }}>
                  <div>{b.email || "—"}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.name || "—"}</div>
                </div>
              </div>
            </div>

            <div className="mt-4" style={{ fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              {b.purpose && <div className="mb-2"><strong>Purpose:</strong> {b.purpose}</div>}
              <div className="text-muted">Created: {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</div>

              <div className="mt-4 flex gap-2">
                <button className="btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleCancel(b.id)}>Cancel booking</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}