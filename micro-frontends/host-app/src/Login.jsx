import React, { useState } from 'react';

const API_URL = 'http://localhost:4000';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      onLogin(data.user);
    } catch {
      setError('Could not reach the server. Is the API running on port 4000?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <h1 className="login-card__title">Shop</h1>
          <p className="login-card__subtitle">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__field">
            <label className="login-form__label" htmlFor="username">Username</label>
            <input
              id="username"
              className="login-form__input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-form__field">
            <label className="login-form__label" htmlFor="password">Password</label>
            <input
              id="password"
              className="login-form__input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-form__error">{error}</p>}

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading || !username || !password}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          <p className="login-hint__label">Demo credentials</p>
          <div className="login-hint__row">
            <code>admin</code><span>/</span><code>admin123</code>
          </div>
          <div className="login-hint__row">
            <code>user</code><span>/</span><code>user123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
