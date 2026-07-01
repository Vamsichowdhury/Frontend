/**
 * CART MFE - Vue 3 + Pinia
 *
 * This MFE exposes a mountCart() function (not a Vue component directly).
 * React can't render Vue components — but any framework can call a JS function.
 * mountCart(container) creates a Vue app and mounts it into any DOM element.
 *
 * WHY A MOUNT FUNCTION INSTEAD OF A COMPONENT?
 * When frameworks differ (React loads Vue here), you need a framework-agnostic
 * API. A plain JS function works universally. The caller just provides a div.
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'cartMFE',
      dts: false,
      filename: 'remoteEntry.js',
      exposes: {
        './Cart': './src/mount.js',
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.0.0' },
      },
    }),
  ],
  server: {
    port: 3002,
    origin: 'http://localhost:3002',
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: { target: 'esnext', minify: false, cssCodeSplit: false },
});
