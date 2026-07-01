/**
 * MOUNT FUNCTION — the module exposed via Module Federation
 *
 * products-listing-mfe (React) calls this:
 *   import('cartMFE/Cart').then(({ mountCart }) => {
 *     mountCart(divElement)
 *   })
 *
 * We create a fresh Vue app + Pinia instance each time mountCart() is called.
 * Returns an unmount function — React calls this when CartSidebar unmounts.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Cart from './Cart.vue';

export function mountCart(container) {
  const pinia = createPinia();
  const app = createApp(Cart);
  app.use(pinia);
  app.mount(container);
  return () => app.unmount();
}
