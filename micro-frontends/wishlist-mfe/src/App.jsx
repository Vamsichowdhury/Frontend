// Standalone wrapper — used when running on http://localhost:3004 directly.
// Federated mode bypasses this entirely (host imports Wishlist.jsx directly).
import React from 'react';
import Wishlist from './Wishlist.jsx';

function App() {
  return <Wishlist />;
}

export default App;
