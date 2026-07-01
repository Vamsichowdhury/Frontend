/**
 * ORDERS MFE
 *
 * React + Redux Toolkit. Shows the full order history.
 *
 * On mount: fetches existing orders from the API.
 *
 * Real-time update: listens for the 'order-placed' Custom Event fired by
 * cart-mfe (Vue). If the user has the Orders page open when an order is placed,
 * the new order appears instantly via Redux without a page refresh.
 */

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, setOrders, addOrder, removeOrder } from './store.js';
import './Orders.css';

const API_URL = 'http://localhost:4000';

function OrdersContent() {
  const dispatch = useDispatch();
  const orders   = useSelector(state => state.orders.items);

  useEffect(() => {
    // Path 1: fetch existing orders every mount so we never miss orders placed
    // while this page was not open (i.e., the 'order-placed' event was not heard).
    // .slice().reverse() — API returns oldest-first; we want newest at the top.
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => dispatch(setOrders(data.orders.slice().reverse())));

    // Path 2: if the Orders page is already open when an order is placed, prepend
    // the new order instantly via Redux without waiting for a re-fetch.
    // The cleanup is critical — without it every navigation to this page adds
    // another listener, causing duplicate orders after just a few visits.
    function onOrderPlaced(e) {
      dispatch(addOrder(e.detail.order));
    }

    globalThis.addEventListener('order-placed', onOrderPlaced);
    return () => globalThis.removeEventListener('order-placed', onOrderPlaced);
  }, [dispatch]);

  async function deleteOrder(id) {
    await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
    dispatch(removeOrder(id));
  }

  return (
    <div className="orders-page">
      <h2 className="orders-title">Orders</h2>

      {orders.length === 0 ? (
        <p className="orders-empty">No orders yet. Go to Products and place an order!</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card__header">
              <span className="order-card__id">Order #{order.id}</span>
              <div className="order-card__meta">
                <span className="order-card__date">{order.createdAt}</span>
                <button className="btn btn--danger btn--sm" onClick={() => deleteOrder(order.id)}>
                  Delete
                </button>
              </div>
            </div>
            <div className="order-card__items">
              {order.items.map(i => i.quantity > 1 ? `${i.name} \u00d7${i.quantity}` : i.name).join(', ')}
            </div>
            <div className="order-card__footer">
              <span className="order-card__total">Total: ${order.total}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Orders() {
  return (
    <Provider store={store}>
      <OrdersContent />
    </Provider>
  );
}

export default Orders;
