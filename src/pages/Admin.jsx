 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  bookingsCol,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
  collection,
  db,
  onAuthChanged
} from "../firebase";

/*
  Admin page (strict admin-only)
*/

function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => esc(r[h])).join(","))
  ].join("\n");
}

export default function Admin() {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filtered, setFiltered] = useState([]);

  /* ---------- AUTH + ADMIN CHECK ---------- */
  useEffect(() => {
    const unsub = onAuthChanged(async (u) => {
      try {
        if (!u) {
          navigate("/signin", { replace: true });
          return;
        }

        const q = query(
          collection(db, "admins"),
          where("uid", "==", u.uid)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          navigate("/rooms", { replace: true });
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Admin verification failed:", err);
        navigate("/", { replace: true });
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  /* ---------- LOAD BOOKINGS (ADMIN ONLY) ---------- */
  useEffect(() => {
    if (!isAdmin) return;

    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(bookingsCol);
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        arr.sort((a, b) => {
          if (a.date === b.date) return (a.slot || 0) - (b.slot || 0);
          return a.date < b.date ? -1 : 1;
        });

        setBookings(arr);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAdmin]);

  /* ---------- FILTERS ---------- */
  useEffect(() => {
    let arr = bookings.slice();
    if (filterDate) arr = arr.filter(b => b.date === filterDate);
    if (filterEmail) {
      arr = arr.filter(b =>
        (b.email || "").toLowerCase().includes(filterEmail.toLowerCase())
      );
    }
    setFiltered(arr);
  }, [bookings, filterDate, filterEmail]);

  /* ---------- ACTIONS ---------- */
  async function handleDelete(id) {
    if (!confirm("Delete this booking?")) return;
    await deleteDoc(doc(bookingsCol, id));
    setBookings(prev => prev.filter(b => b.id !== id));
  }

  async function setStatus(id, status) {
    await setDoc(doc(bookingsCol, id), { status }, { merge: true });
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
  }

  function exportCSV() {
    const rows = (filtered.length ? filtered : bookings).map(b => ({
      id: b.id,
      roomId: b.roomId,
      date: b.date,
      slot: b.slot,
      duration: b.duration,
      email: b.email,
      name: b.name,
      status: b.status || "pending"
    }));

    const csv = toCSV(rows);
    if (!csv) return;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- GUARDS ---------- */
  if (checking) return <div>Checking admin access…</div>;
  if (!isAdmin) return null;

  /* ---------- UI ---------- */
  return (
    <div className="mt-4">
      <h2>Admin — All Bookings</h2>

      <div className="flex gap-3 mb-3">
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        <input
          placeholder="Filter email"
          value={filterEmail}
          onChange={e => setFilterEmail(e.target.value)}
        />
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      {loading && <div>Loading…</div>}

      {(filtered.length ? filtered : bookings).map(b => (
        <div key={b.id} className="card mb-2">
          <strong>{b.roomName || b.roomId}</strong>
          <div>{b.date} • {b.slot}:00</div>
          <div>{b.email}</div>

          <button onClick={() => setStatus(b.id, "approved")}>Approve</button>
          <button onClick={() => setStatus(b.id, "rejected")}>Reject</button>
          <button onClick={() => handleDelete(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
