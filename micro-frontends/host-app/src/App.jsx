import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// Module Federation: these import() calls fetch remote JS chunks at runtime from
// separate dev servers (ports 3001, 3003, 3004). Nothing is bundled locally.
// lazy() + Suspense shows a fallback while the first remote chunk downloads.
const ProductsListing = lazy(() => import('productsList/ProductsListing'));
const Orders          = lazy(() => import('ordersMFE/Orders'));
const Wishlist        = lazy(() => import('wishlistMFE/Wishlist'));

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
      <span className={`theme-toggle__track${isDark ? ' theme-toggle__track--on' : ''}`}>
        <span className={`theme-toggle__thumb${isDark ? ' theme-toggle__thumb--on' : ''}`} />
      </span>
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

// Shell — the authenticated layout (navbar + routed MFE area).
// Lives inside <BrowserRouter> so NavLink/Routes have a router context.
function AuthedShell({ auth, themeToggle, onLogout }) {
  const linkClass = ({ isActive }) =>
    `navbar__nav-btn${isActive ? ' navbar__nav-btn--active' : ''}`;

  return (
    <div>
      <nav className="navbar">
        <NavLink to="/products" className="navbar__brand-link">
          <span className="navbar__brand">Shop</span>
        </NavLink>
        <NavLink to="/products" className={linkClass}>Products</NavLink>
        <NavLink to="/orders"   className={linkClass}>Orders</NavLink>
        <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>
        <span className="navbar__spacer" />
        <span className="navbar__username">{auth.username}</span>
        {themeToggle}
        <button className="navbar__logout" onClick={onLogout}>
          Sign out
        </button>
      </nav>

      {/*
        Routes — the URL is the source of truth now. Browser back/forward
        and direct URL paste both work. Each MFE is wrapped in its own
        ErrorBoundary+Suspense so failures stay isolated.

        Note the /* on /wishlist: that's the splat pattern. It tells the
        host "any URL under /wishlist belongs to the wishlist MFE." The
        MFE's internal <Routes> then matches the sub-path (e.g. :productId).
      */}
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />

        <Route path="/products" element={
          <ErrorBoundary name="Products">
            <Suspense fallback={<div className="page-loading">Loading...</div>}>
              <ProductsListing />
            </Suspense>
          </ErrorBoundary>
        } />

        <Route path="/orders" element={
          <ErrorBoundary name="Orders">
            <Suspense fallback={<div className="page-loading">Loading...</div>}>
              <Orders />
            </Suspense>
          </ErrorBoundary>
        } />

        <Route path="/wishlist/*" element={
          <ErrorBoundary name="Wishlist">
            <Suspense fallback={<div className="page-loading">Loading...</div>}>
              <Wishlist />
            </Suspense>
          </ErrorBoundary>
        } />

        {/* Fallback for any unmatched URL */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const dark = localStorage.getItem('theme') === 'dark';
    // Set immediately in the initializer to avoid a flash on load
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    return dark;
  });

  // Auth state — persisted in localStorage so session survives page refresh
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function handleLogin(user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuth(user);
  }

  function handleLogout() {
    localStorage.removeItem('auth_user');
    setAuth(null);
  }

  // Theme toggle is shown on the login page too — render it before the auth gate
  const themeToggle = (
    <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
  );

  if (!auth) {
    // Login screen doesn't need a router — no routes, just a form.
    return (
      <div>
        <div className="login-theme-toggle">{themeToggle}</div>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // BrowserRouter wraps the entire authed app exactly once. Every MFE
  // loaded under here shares this single router instance (because
  // react-router-dom is declared as a shared singleton in vite.config.js).
  return (
    <BrowserRouter>
      <AuthedShell auth={auth} themeToggle={themeToggle} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
