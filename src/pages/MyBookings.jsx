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
    const base = {
      padding: "6px 8px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      textTransform: "capitalize",
      minWidth: 88,
      textAlign: "center"
    };
    if (s === "approved") {
      return <div style={{ ...base, background: "rgba(34,197,94,0.12)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.06)" }}>Approved</div>;
    }
    if (s === "rejected") {
      return <div style={{ ...base, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.06)" }}>Rejected</div>;
    }
    // pending
    return <div style={{ ...base, background: "rgba(250,204,21,0.08)", color: "#b45309", border: "1px solid rgba(0,0,0,0.04)" }}>Pending</div>;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>My Bookings</h2>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, minWidth: 260 }}
        />
        <button onClick={loadMyBookings} className="primary" disabled={loading}>
          {loading ? "Loading…" : "Load my bookings"}
        </button>

        <div style={{ marginLeft: "auto", color: "#6b7280", fontSize: 13 }}>
          Tip: approved bookings are confirmed by admin.
        </div>
      </div>

      {!userChecked && <div>Checking sign-in status…</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {bookings.length === 0 && !loading && <div className="text-muted">No bookings found.</div>}

        {bookings.map(b => (
          <div key={b.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{b.roomName || b.roomId}</div>
                <div style={{ fontSize: 13, color: "#333" }}>
                  {b.date} • {String(b.slot).padStart(2,"0")}:00 - {String((b.slot || 0) + (b.duration || 1)).padStart(2,"0")}:00
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <StatusBadge status={b.status} />
                <div style={{ textAlign: "right", fontSize: 13, color: "#475569" }}>
                  <div>{b.email || "—"}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{b.name || "—"}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {b.purpose && <div style={{ marginTop: 6 }}><strong>Purpose:</strong> {b.purpose}</div>}
              <div style={{ color: "#666", marginTop: 6 }}>Created: {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="delete-btn" onClick={() => handleCancel(b.id)}>Cancel booking</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}