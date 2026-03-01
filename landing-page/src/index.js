import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ── PWA: Register service worker for offline support ──
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((reg) => {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
