/**
 * PINIA STORE — cart state for cart-mfe
 *
 * Items are stored on the backend API.
 * Adding/removing items makes API calls.
 * Cart data is fetched from API when cart is opened.
 *
 * On placeOrder():
 *   1. Flattens items and POSTs to /orders
 *   2. CLEARs cart via DELETE /cart
 *   3. Fires an 'order-placed' Custom Event on globalThis
 *
 * Cart count is broadcast via 'cart-updated' custom event for navbar display.
 */

import { defineStore } from 'pinia';

const API_URL = 'http://localhost:4000';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],    // [{ productId, name, price, quantity }]
    placing: false,
    loading: false,
  }),

  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    async fetchCart() {
      this.loading = true;
      try {
        const res = await fetch(`${API_URL}/cart`);
        const data = await res.json();
        this.items = data.items;
        this.broadcastCount();
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async addItem(product) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, name: product.name, price: product.price }),
        });
        const data = await res.json();
        this.items = data.items;
        this.broadcastCount();
      } catch (err) {
        console.error('Failed to add item:', err);
      }
    },

    async removeItem(productId) {
      try {
        const res = await fetch(`${API_URL}/cart/${productId}`, { method: 'DELETE' });
        const data = await res.json();
        this.items = data.items;
        this.broadcastCount();
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    },

    broadcastCount() {
      // Fires 'cart-updated' so products-listing-mfe (React) can update the
      // count badge on the cart button without polling or shared state.
      const count = this.items.reduce((sum, i) => sum + i.quantity, 0);
      globalThis.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
    },

    async placeOrder() {
      if (this.items.length === 0) return;
      this.placing = true;

      // Remap productId → id because the orders API expects { id, name, price, quantity }
      const orderItems = this.items.map(i => ({
        id:       i.productId,
        name:     i.name,
        price:    i.price,
        quantity: i.quantity,
      }));

      try {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: orderItems }),
        });
        const data = await res.json();

        const names = this.items
          .map(i => i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name)
          .join(', ');

        globalThis.dispatchEvent(new CustomEvent('order-placed', {
          detail: {
            order: data.order,
            message: `Your order for "${names}" has been placed successfully!`,
          },
        }));

        // Clear cart on backend
        await fetch(`${API_URL}/cart`, { method: 'DELETE' });
        this.items = [];
        this.broadcastCount();
      } catch (err) {
        console.error('Failed to place order:', err);
      } finally {
        this.placing = false;
      }
    },
  },
});
