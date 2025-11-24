// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  bookingsCol,
  getDocs,
  deleteDoc,
  doc,
  onAuthChanged,
  setDoc,
  query,
  where,
  collection,
  db
} from "../firebase";

/*
  Admin page (admin-only):
   - Verifies current user is in `admins` collection (uid match)
   - Fetches bookings client-side and sorts them
   - Allows admins to Approve / Reject (sets booking.status)
   - Allows Delete (keeps previous delete behavior)
   - Simple filters: date and email
*/

function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

export default function Admin() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // local filters
  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Auth guard + admin check
  useEffect(() => {
    const unsub = onAuthChanged(async (u) => {
      if (!u) {
        // Not signed in -> send to signin
        nav("/signin");
        setUserChecked(true);
        setIsAdmin(false);
        return;
      }

      try {
        // Query admins collection for this uid
        const q = query(collection(db, "admins"), where("uid", "==", u.uid));

        const snap = await getDocs(q);
        if (snap.empty) {
          // not an admin -> redirect to signin (or home)
          alert("Access denied: you are not an admin.");
          nav("/signin");
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        alert("Admin check failed. See console.");
        nav("/signin");
        setIsAdmin(false);
      } finally {
        setUserChecked(true);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load all bookings (only for admins)
  async function loadAll() {
    setLoading(true);
    try {
      const snap = await getDocs(bookingsCol);
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // sort by date then slot
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

  useEffect(() => {
    // Only load once admin check finished and user is admin
    if (userChecked && isAdmin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userChecked, isAdmin]);

  // apply client-side filters
  useEffect(() => {
    let arr = bookings.slice();
    if (filterDate) arr = arr.filter(b => b.date === filterDate);
    if (filterEmail) arr = arr.filter(b => (b.email || "").toLowerCase().includes(filterEmail.toLowerCase()));
    setFiltered(arr);
  }, [bookings, filterDate, filterEmail]);

  async function handleDelete(bid) {
    if (!confirm("Delete this booking? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(bookingsCol, bid));
      setBookings(bookings.filter(b => b.id !== bid));
      alert("Deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. See console.");
    }
  }

  // Approve or reject — sets status field on document (merge)
  async function setBookingStatus(bid, newStatus) {
    try {
      await setDoc(doc(bookingsCol, bid), { status: newStatus }, { merge: true });
      // update local state
      setBookings(prev => prev.map(b => (b.id === bid ? { ...b, status: newStatus } : b)));
      alert(`Booking ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. See console.");
    }
  }

  function handleExport() {
    const exportRows = (filtered.length ? filtered : bookings).map(b => ({
      id: b.id,
      roomId: b.roomId,
      roomName: b.roomName || "",
      date: b.date,
      slot: b.slot,
      duration: b.duration,
      name: b.name || "",
      email: b.email || "",
      purpose: b.purpose || "",
      status: b.status || "pending",
      createdAt: b.createdAt || ""
    }));
    const csv = toCSV(exportRows);
    if (!csv) return alert("No bookings to export.");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-4">
      <h2>Admin — All Bookings</h2>

      <div className="flex gap-4 items-center mb-4" style={{ flexWrap: "wrap" }}>
        <div className="flex gap-2 items-center">
          <label style={{ marginBottom: 0 }}>Filter date</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 'auto' }} />
        </div>

        <div className="flex gap-2 items-center">
          <input
            placeholder="filter by email..."
            value={filterEmail}
            onChange={e => setFilterEmail(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        <div className="flex gap-2" style={{ marginLeft: "auto" }}>
          <button className="btn-primary" onClick={loadAll} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
          <button className="btn-ghost" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      {loading && <div className="mb-4">Loading…</div>}

      <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
        {(!filtered || filtered.length === 0) && !loading && <div className="text-muted">No bookings found.</div>}

        {(filtered || []).map(b => {
          const start = b.slot;
          const end = (b.slot || 0) + (b.duration || 1);
          const status = b.status || "pending";
          let badgeClass = "badge-warning";
          if (status === "approved") badgeClass = "badge-success";
          if (status === "rejected") badgeClass = "badge-danger";

          return (
            <div key={b.id} className="card">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.roomName || b.roomId}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{b.date} • {String(start).padStart(2, "0")}:00 - {String(end).padStart(2, "0")}:00</div>
                </div>

                <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.9rem', minWidth: 160 }}>
                    <div>{b.email || "—"}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.name || "—"}</div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Status badge */}
                    <div className={`badge ${badgeClass}`}>{status}</div>

                    {/* Approve / Reject only when pending or different */}
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setBookingStatus(b.id, "approved")}>Approve</button>
                    <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setBookingStatus(b.id, "rejected")}>Reject</button>
                    <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                </div>
              </div>

              <div className="mt-4" style={{ fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                {b.purpose && <div className="mb-2"><strong>Purpose:</strong> {b.purpose}</div>}
                <div className="text-muted">Created: {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}