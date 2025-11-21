 Seminar Hall / Auditorium Booking — README

A small, finishable React + Firebase app for booking seminar halls and auditoriums.
This README gives practical, step-by-step instructions to run, test, and deploy the app — aimed at finishing a working MVP quickly.

Quick summary (what this project does)

Let users (students / faculty / staff) view rooms and availability.

Create bookings for a room (date + hourly slot + duration).

Prevents booking conflicts (checks slots).

Users can view / edit / cancel their own bookings.

Admin panel to view all bookings, approve/reject, delete and export CSV.

Firebase (Firestore) used as backend + Firebase Auth for sign-in.

Simple React frontend (Vite / Create React App compatible) with a glassmorphism + colorful UI.

Repo structure (important files)
/src
  /components
    BookingForm.jsx
    ThemeToggle.jsx
    ProtectedRoute.jsx
  /pages
    Home.jsx
    RoomsPage.jsx
    MyBookings.jsx
    Admin.jsx
    SignIn.jsx
    SignUp.jsx
    AdminSignUp.jsx
  firebase.js
  App.jsx
  main.jsx
  index.css
package.json
README.md

Prerequisites

Node.js (v16+ recommended)

npm or yarn

A Firebase project (you’ll need the config values)

(Optional) Vercel / Netlify account for hosting

1 — Run locally (from a fresh clone)

If you already have the project folder, run these commands in the project root:

# install deps
npm install

# start dev server (Vite)
npm run dev
# or, if CRA: npm start


Open http://localhost:5173 (Vite default) or the port printed by your dev server.

2 — Firebase setup (must do before using real backend)

Go to https://console.firebase.google.com/
 and create a new project (e.g. seminar-booking-yourname).

In the Firebase console:

Enable Authentication → Email/Password sign-in.

Enable Firestore Database → Start in Test mode while developing (tighten rules later).

(Optional) Enable Firebase Hosting if you want to deploy directly from Firebase.

Register a Web app and copy the firebase config (apiKey, authDomain, projectId, etc).

Replace the firebaseConfig object in src/firebase.js with your values.

Important: Firestore API may need to be enabled via Google Cloud Console if you see an error about the API being disabled — follow the error link and enable it.

3 — Firestore data model

Keep the data shape small and explicit — current collections:

rooms (collection)

Document example:

{
  "name": "Seminar Hall A",
  "type": "Auditorium",
  "capacity": 120,
  "features": ["projector", "mic", "stage"]
}

bookings (collection)

Document example:

{
  "roomId": "ROOM_DOC_ID",
  "roomName": "Seminar Hall A",
  "date": "2025-11-21",       // YYYY-MM-DD
  "slot": 9,                  // integer hour (start hour)
  "duration": 2,              // hours
  "name": "Alice Kumar",
  "email": "alice@example.com",
  "purpose": "Student seminar",
  "createdAt": "2025-11-21T10:01:00.000Z",
  "status": "pending"         // optional: pending | approved | rejected
}

admins (collection) — optional for admin role mapping

Document example:

{
  "uid": "firebase-auth-uid",
  "email": "admin@example.com",
  "name": "Admin Name",
  "createdAt": "2025-11-21T10:00:00.000Z"
}

4 — Firestore security rules (dev → tighten later)

For a quick demo, you can keep Firestore in test mode. When you want to make it safer, use minimal rules like:

// quick demo rules — replace for production
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{room} {
      allow read: if true;
      allow write: if false; // restrict writes to dev only
    }
    match /bookings/{booking} {
      // Allow reads for everyone (simple demo)
      allow read: if true;

      // Allow create if basic fields exist (demo)
      allow create: if request.auth != null && request.resource.data.keys().hasAll(['roomId','date','slot','duration','name']);
      // Allow delete/update only if admin — simple demo check
      allow update, delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    match /admins/{admin} {
      // allow read/write to project owners from console only; for demo restrict to project
      allow read, write: if false;
    }
  }
}


Notes:

These rules are minimal and intended only for demos. For production, write tight checks (auth, field validation, role checks).

If you rely on client-side admins collection to check admins, ensure you protect writes to the admins collection server-side (or seed admins manually via console).

5 — How conflict prevention works

Bookings use integer slot for the start hour and duration for hours.

When creating a booking the client queries Firestore for bookings with the same roomId and date and slot in [requested slots]. If any results exist, it blocks creation.

This is safe enough for demo. For strong correctness under race conditions, a server-side transaction or Cloud Function would be required. For MVP this client-based check is OK.

6 — Common fixes / troubleshooting

permission-denied / API disabled: Visit the console link in the error message and enable the Firestore API for the project. Wait a few minutes and retry.

Query requires an index: The console error will give a direct link to create the composite index for your query. For development you can avoid orderBy + multiple where combos that require an index.

CORS / blocked by adblock: Brave or ad-blockers may block Firestore streaming endpoints. Test in Chrome or a browser without blocking extensions.

Sign-in redirect not happening: App has an onAuthChanged listener in App.jsx that auto-redirects signed-in users to /rooms or /admin. Ensure SignIn.jsx is using the signInWithEmail helper and that App.jsx has the listener.

7 — Exact npm scripts (typical)

In package.json you should have:

"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "start": "vite"
}


Adjust for CRA if you used Create React App.

8 — Deploy (quick)
Deploy to Vercel (fast)

Push your repo to GitHub.

vercel CLI or Vercel web UI — connect the GitHub repo, select project root, build command npm run build, output dir dist.

Deploy. Vercel will run the build and give you a live URL.

Deploy to Firebase Hosting (optional)

npm i -g firebase-tools

firebase login

firebase init → Hosting (select project), set dist as public (or build depending on bundler).

npm run build

firebase deploy --only hosting

9 — Backup & commit (recommended before big changes)

Use git:

git add .
git commit -m "MVP: booking UI, firebase integration, auth, admin"


Or make a ZIP of the project folder.

10 — UI assets (logo)

If you want to use the local logo file used during development, the project references the uploaded file path:

/mnt/data/95eb0017-c67e-4a88-813a-c2f3a32bb600.png


(You can replace this with a hosted image or commit your image under public/.)

11 — Where to change things (notes for quick edits)

src/firebase.js — update firebaseConfig and exported helpers.

src/pages/RoomsPage.jsx — room listing + load bookings preview.

src/components/BookingForm.jsx — booking create + conflict check.

src/pages/Admin.jsx — admin operations (approve/reject/export).

src/pages/SignIn.jsx & src/pages/SignUp.jsx — authentication flows.

src/index.css — styling (glassmorphism and colors); theme variables at the top.

12 — Next improvements (post-MVP)

Harden Firestore rules and remove test mode.

Use server-side functions or transactions for atomic conflict checks.

Add email notifications on booking creation / approval (Cloud Functions + SendGrid).

Add calendar sync / .ics generation.

Add calendar view UI (visual timeline).

Implement role-based routing & admin management UI (invite-only admin creation).

13 — Quick checklist to demo (what to show)

Start dev server and open app.

On Home page, create a student account (Sign Up) and sign in — show Rooms page and booking flow.

Create a booking and show conflict prevention.

Sign out, sign up as an Admin (use Admin Sign Up with secret), sign in — show Admin panel and approve/reject.

Export bookings CSV from Admin.

Toggle Dark/Light theme.

14 — Contact / notes

If you want, I can:

Produce a production-ready firebase.rules file for your app.

Remove the temporary !important fallbacks from CSS and refactor components to use variables fully.

Add a small test-suite for booking conflict logic.