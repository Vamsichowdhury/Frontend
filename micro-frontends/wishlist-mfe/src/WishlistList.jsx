import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:4000';

export default function WishlistList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch fresh every time we navigate here — routing naturally
    // re-mounts this component, so the list is always up to date.
    let cancelled = false;
    fetch(`${API}/wishlist`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="wishlist-page"><p className="wishlist-empty">Loading...</p></div>;
  }

  return (
    <div className="wishlist-page">
      <h2 className="wishlist-title">My Wishlist</h2>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          Your wishlist is empty. Click the heart on any product to save it here.
        </div>
      ) : (
        <ul className="wishlist-list">
          {items.map((item) => (
            <li key={item.productId} className="wishlist-item">
              {/*
                <Link> updates the URL WITHOUT a full page reload. Clicking
                this changes the URL to /wishlist/:productId, which the
                <Route path=":productId"> in Wishlist.jsx then matches.
              */}
              <Link to={`/wishlist/${item.productId}`} className="wishlist-item__link">
                <span className="wishlist-item__name">{item.name}</span>
                <span className="wishlist-item__price">${item.price}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
