<template>
  <div class="cart">
    <div v-if="store.loading" class="cart__loading">Loading cart...</div>

    <template v-else>
      <!-- Cart items -->
      <div
        v-for="item in store.items"
        :key="item.productId"
        class="cart-item"
      >
        <div class="cart-item__info">
          <span class="cart-item__name">{{ item.name }}</span>
          <span v-if="item.quantity > 1" class="cart-item__qty"> &#215;{{ item.quantity }}</span>
        </div>
        <div class="cart-item__right">
          <span class="cart-item__price">${{ item.price * item.quantity }}</span>
          <button class="cart-item__remove" @click="store.removeItem(item.productId)">Remove</button>
        </div>
      </div>

      <p v-if="store.items.length === 0" class="cart__empty">
        Cart is empty
      </p>

      <!-- Total -->
      <div class="cart__total">
        <span>Total</span>
        <span class="cart__total-amount">${{ store.total }}</span>
      </div>

      <!-- Place Order -->
      <button
        class="cart__place-order"
        @click="store.placeOrder()"
        :disabled="store.items.length === 0 || store.placing"
      >
        {{ store.placing ? 'Placing Order...' : 'Place Order' }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useCartStore } from './cartStore.js';

const store = useCartStore();

function onAddToCart(e) {
  store.addItem(e.detail.product);
}

onMounted(async () => {
  // Restore cart from API on every mount — cart persists across page refreshes
  // because the data lives on the server, not in browser memory.
  await store.fetchCart();
  // Register after fetchCart so the cart state is ready before any add-to-cart
  // fires. globalThis is the universal event bus shared across all MFEs.
  globalThis.addEventListener('add-to-cart', onAddToCart);
});

onUnmounted(() => {
  // Cleanup prevents accumulating duplicate listeners if this component ever
  // re-mounts. In practice, products-listing-mfe keeps it alive via display:none
  // so this only fires when the entire shell app is torn down.
  globalThis.removeEventListener('add-to-cart', onAddToCart);
});
</script>

<style scoped>
/* CSS variables cascade from host-app/src/App.css via the shared DOM.
   Fallback values here cover standalone mode (no host CSS loaded). */

.cart {
  display: flex;
  flex-direction: column;
}

.cart__loading {
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
  padding: 16px 0;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border, #e2e8f0);
  gap: 8px;
}

.cart-item__info {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.cart-item__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text, #1e293b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__qty {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  flex-shrink: 0;
}

.cart-item__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cart-item__price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text, #1e293b);
}

.cart-item__remove {
  background: transparent;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  color: var(--text-muted, #64748b);
  font-size: 0.75rem;
  padding: 3px 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  line-height: 1;
  transition: border-color 150ms, color 150ms, background 150ms;
}

.cart-item__remove:hover {
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
  background: transparent;
}

.cart__empty {
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
  text-align: center;
  padding: 24px 0;
}

.cart__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px;
  font-size: 0.875rem;
  color: var(--text-muted, #64748b);
  border-top: 1px solid var(--border, #e2e8f0);
  margin-top: 4px;
}

.cart__total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text, #1e293b);
}

.cart__place-order {
  width: 100%;
  padding: 11px;
  background: var(--primary, #6366f1);
  color: var(--primary-fg, #ffffff);
  border: none;
  border-radius: var(--radius, 8px);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease, opacity 150ms ease;
  margin-top: 4px;
}

.cart__place-order:hover:not(:disabled) {
  background: var(--primary-hover, #4f46e5);
}

.cart__place-order:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
