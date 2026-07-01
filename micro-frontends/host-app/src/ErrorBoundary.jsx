import React from 'react';

// Error boundaries MUST be class components.
// React has two lifecycle methods that catch errors — getDerivedStateFromError
// and componentDidCatch — and neither has a function component equivalent.
// You write this once and reuse it everywhere as a plain JSX tag.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  // React calls this when ANY child component throws during render.
  // Whatever you return here gets merged into state.
  // Returning { error } triggers a re-render that shows the fallback UI.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Called after getDerivedStateFromError — the right place to log to an
  // error tracking service (Sentry, Datadog, etc.) in a real app.
  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary: ${this.props.name || 'MFE'}] failed to load:`, error);
  }

  render() {
    if (this.state.error) {
      // Fallback UI — shown when the wrapped MFE crashes or fails to load.
      // The rest of the app (navbar, other MFEs) is completely unaffected.
      return (
        <div className="mfe-error">
          <div className="mfe-error__icon">!</div>
          <p className="mfe-error__title">
            {this.props.name ? `${this.props.name} is unavailable` : 'This section is unavailable'}
          </p>
          <p className="mfe-error__message">
            Failed to load. The rest of the app still works normally.
          </p>
          {/* Retry clears the error — React re-renders the children.
              If the remote MFE server is back up, this will succeed. */}
          <button
            className="mfe-error__retry"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    // No error — render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
