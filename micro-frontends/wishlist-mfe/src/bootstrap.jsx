import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Standalone bootstrap — only used when this MFE runs alone at :3004.
// In federated mode (loaded by host-app), main.jsx is NOT executed —
// the host imports './Wishlist' directly and provides its own BrowserRouter.
//
// The <BrowserRouter> here exists ONLY so that <Routes> inside Wishlist.jsx
// has a router context to attach to when developing this MFE in isolation.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
