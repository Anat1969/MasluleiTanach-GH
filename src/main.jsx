import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App.jsx';

// ב-Vercel הבסיס הוא '/', ובקישור raw.githack (תיקיית app/) הבסיס יחסי: שם ניתוב hash.
const ROOTED = import.meta.env.BASE_URL === '/';
const Router = ROOTED ? BrowserRouter : HashRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD && ROOTED) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
