 // src/components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";

/*
 Minimal & robust ThemeToggle
 - Reads saved theme from localStorage (if available)
 - Falls back to DOM class or system preference
 - Applies theme by adding/removing "dark" on <html>
 - No fancy constructs — keeps try/catch local and correct
*/

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  function applyTheme(t) {
    // apply DOM class safely
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (err) {
      // non-fatal, continue
      // eslint-disable-next-line no-console
      console.warn("ThemeToggle: DOM apply failed", err);
    }

    // persist preference safely
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("theme", t);
      }
    } catch (err) {
      // ignore storage errors
      // eslint-disable-next-line no-console
      console.warn("ThemeToggle: save failed", err);
    }

    setTheme(t);
    // eslint-disable-next-line no-console
    console.log("ThemeToggle.apply ->", t, " html.dark?", !!(document && document.documentElement && document.documentElement.classList.contains("dark")));
  }

  useEffect(() => {
    // 1) try reading saved preference
    let saved = null;
    try {
      if (typeof localStorage !== "undefined") saved = localStorage.getItem("theme");
    } catch (err) {
      saved = null;
    }

    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      return;
    }

    // 2) if no saved, check DOM class (maybe set by other code)
    try {
      const domHasDark = typeof document !== "undefined" && document.documentElement && document.documentElement.classList.contains("dark");
      if (domHasDark) {
        applyTheme("dark");
        return;
      }
    } catch (err) {
      // ignore
    }

    // 3) fallback to system preference
    try {
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    } catch (err) {
      applyTheme("light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTheme() {
    applyTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 12px",
        borderRadius: "10px",
        marginLeft: "12px",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "var(--glass-strong)",
        color: "var(--text-primary)"
      }}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}