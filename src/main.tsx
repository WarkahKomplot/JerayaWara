import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register PWA Service Worker
if ('serviceWorker' in navigator && (import.meta.env.PROD || process.env.NODE_ENV === 'production')) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      // `updateViaCache: 'none'` makes the browser revalidate sw.js itself on every
      // update check, replacing the old `?v=N` query string that drifted from the
      // cache version declared in public/sw.js.
      .register(swUrl, { updateViaCache: 'none' })
      .then(reg => {
        reg.update();

        const notifyUpdateReady = () => {
          window.dispatchEvent(new CustomEvent('jerayawara:sw-update-ready'));
        };

        // A worker already waiting means a deploy landed while this tab was open.
        if (reg.waiting && navigator.serviceWorker.controller) {
          notifyUpdateReady();
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdateReady();
            }
          });
        });

        console.log('JerayaWara PWA Service Worker registered:', reg.scope);
      })
      .catch(err => {
        console.warn('JerayaWara Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
