import React, { useEffect, useRef, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, openSidebar, closeSidebar, showBanner, hideBanner, setProducts, addProduct, removeProduct } from './store.js';
import './ProductsListing.css';

const API_URL = 'http://localhost:4000';

function Banner({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="banner">
      <span>{message}</span>
      <button className="banner__close" onClick={onClose}>&#215;</button>
    </div>
  );
}

// Always rendered (never conditionally unmounted) so the Vue app's
// 'add-to-cart' event listener stays active regardless of sidebar visibility.
function CartSidebar() {
  const containerRef = useRef(null);

  useEffect(() => {
    let unmount;
    // cancelled prevents double-mount in React StrictMode:
    // StrictMode intentionally mounts components twice in development. The cleanup
    // runs between the two mounts, but the async import() resolves after cleanup —
    // so without this flag both callbacks would call mountCart(), creating two Vue
    // apps each with their own 'add-to-cart' listener. One click would then fire
    // two API calls and add the item twice.
    let cancelled = false;

    import('cartMFE/Cart').then(({ mountCart }) => {
      if (!cancelled && containerRef.current) {
        unmount = mountCart(containerRef.current);
      }
    });

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, []);

  return <div ref={containerRef} />;
}

function ProductsListingContent() {
  const dispatch    = useDispatch();
  const sidebarOpen = useSelector(state => state.ui.sidebarOpen);
  const banner      = useSelector(state => state.ui.banner);
  const products    = useSelector(state => state.products.items);

  const [cartCount,   setCartCount]   = useState(0);
  const [showAdd,     setShowAdd]     = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newPrice,    setNewPrice]    = useState('');
  // Set of productIds that are already in the wishlist
  const [savedIds,    setSavedIds]    = useState(() => new Set());

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => dispatch(setProducts(data.products)));

    // Pre-load wishlist so heart buttons show filled state immediately
    fetch(`${API_URL}/wishlist`)
      .then(res => res.json())
      .then(data => setSavedIds(new Set(data.items.map(i => i.productId))));

    // Keep cart count badge in sync when items are added/removed
    function onCartUpdated(e) { setCartCount(e.detail.count); }
    // Show success banner when cart-mfe places an order
    function onOrderPlaced(e) { dispatch(showBanner(e.detail.message)); }

    globalThis.addEventListener('cart-updated',  onCartUpdated);
    globalThis.addEventListener('order-placed',  onOrderPlaced);
    return () => {
      globalThis.removeEventListener('cart-updated',  onCartUpdated);
      globalThis.removeEventListener('order-placed',  onOrderPlaced);
    };
  }, [dispatch]);

  function onAddToCart(product) {
    // cart-mfe is Vue — React can't call its functions directly.
    // A Custom Event crosses the framework boundary: cart-mfe listens on globalThis.
    globalThis.dispatchEvent(new CustomEvent('add-to-cart', { detail: { product } }));
    // openSidebar is a plain Redux dispatch — no event needed because the cart button
    // lives in the same MFE as the Redux store.
    dispatch(openSidebar());
  }

  async function deleteProduct(id) {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    dispatch(removeProduct(id));
  }

  async function addNewProduct() {
    if (!newName.trim() || !newPrice) return;
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), price: Number(newPrice) }),
    });
    const data = await res.json();
    dispatch(addProduct(data.product));
    setNewName('');
    setNewPrice('');
    setShowAdd(false);
  }

  async function saveToWishlist(product) {
    await fetch(`${API_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
      }),
    });
    setSavedIds(prev => new Set([...prev, product.id]));
    dispatch(showBanner(`Saved "${product.name}" to wishlist`));
  }

  return (
    <div className="products-layout">

      {/* ── Main content ──────────────────────────────── */}
      <div className="products-main">

        {banner && (
          <Banner message={banner} onClose={() => dispatch(hideBanner())} />
        )}

        <div className="products-header">
          <h2 className="products-title">Products</h2>
          <div className="products-actions">
            <button
              className="btn"
              onClick={() => { setShowAdd(v => !v); setNewName(''); setNewPrice(''); }}
            >
              {showAdd ? 'Cancel' : '+ Add Product'}
            </button>
            <button className="btn btn--cart" onClick={() => dispatch(openSidebar())}>
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Add product form */}
        {showAdd && (
          <div className="add-product-form">
            <input
              className="input"
              placeholder="Product name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              className="input input--price"
              placeholder="Price"
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
            />
            <button className="btn btn--primary" onClick={addNewProduct}>Save</button>
          </div>
        )}

        {/* Product grid */}
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card__name">{product.name}</div>
              <div className="product-card__price">${product.price}</div>
              <div className="product-card__actions">
                <button className="btn btn--primary btn--sm" onClick={() => onAddToCart(product)}>
                  Add to Cart
                </button>
                <button
                  className={`btn btn--wishlist btn--sm${savedIds.has(product.id) ? ' btn--wishlist--saved' : ''}`}
                  onClick={() => saveToWishlist(product)}
                  title={savedIds.has(product.id) ? 'Already saved' : 'Save to wishlist'}
                  aria-label="Save to wishlist"
                >
                  {savedIds.has(product.id) ? '♥' : '♡'}
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => deleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cart sidebar — always in DOM so Vue app stays alive ── */}
      <div className={`cart-sidebar${sidebarOpen ? ' cart-sidebar--open' : ''}`}>
        <div className="cart-sidebar__header">
          <h3>Cart</h3>
          <button className="btn btn--ghost" onClick={() => dispatch(closeSidebar())}>&#215;</button>
        </div>
        <div className="cart-sidebar__body">
          <CartSidebar />
        </div>
      </div>

    </div>
  );
}

function ProductsListing() {
  return (
    <Provider store={store}>
      <ProductsListingContent />
    </Provider>
  );
}

export default ProductsListing;
