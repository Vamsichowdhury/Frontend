import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API = 'http://localhost:4000';

export default function WishlistDetail() {
  // useParams reads the :productId from the URL.
  // This hook works the SAME inside an MFE as in the host — it just
  // talks to the shared react-router-dom singleton.
  const { productId } = useParams();

  // useNavigate gives us programmatic navigation (no <Link> click needed).
  // We use it after "Remove" to send the user back to the list.
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/wishlist`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const found = data.items.find((i) => i.productId === Number(productId));
        setItem(found || null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [productId]);

  function handleRemove() {
    fetch(`${API}/wishlist/${productId}`, { method: 'DELETE' })
      .then(() => navigate('/wishlist'));
  }

  function handleMoveToCart() {
    // Cross-MFE communication still works inside a routed sub-page.
    // The cart-mfe listens for this Custom Event on globalThis.
    globalThis.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: { productId: item.productId, name: item.name, price: item.price },
    }));
    // Also remove from wishlist (moved, not copied)
    fetch(`${API}/wishlist/${productId}`, { method: 'DELETE' })
      .then(() => navigate('/wishlist'));
  }

  if (loading) {
    return <div className="wishlist-page"><p className="wishlist-empty">Loading...</p></div>;
  }

  if (!item) {
    return (
      <div className="wishlist-page">
        <h2 className="wishlist-title">Item not found</h2>
        <p className="wishlist-empty">This item is no longer on your wishlist.</p>
        <Link to="/wishlist" className="wishlist-link">&larr; Back to wishlist</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Link to="/wishlist" className="wishlist-link">&larr; Back to wishlist</Link>

      <div className="wishlist-detail">
        <h2 className="wishlist-detail__name">{item.name}</h2>
        <p className="wishlist-detail__price">${item.price}</p>
        <p className="wishlist-detail__meta">Product ID: {item.productId}</p>

        <div className="wishlist-detail__actions">
          <button className="btn btn--primary" onClick={handleMoveToCart}>
            Move to Cart
          </button>
          <button className="btn btn--danger" onClick={handleRemove}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
