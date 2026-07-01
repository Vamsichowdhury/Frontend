import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'productsList',
      dts: false,
      filename: 'remoteEntry.js',
      exposes: {
        './ProductsListing': './src/ProductsListing.jsx',
      },
      // Load the Vue cart MFE inside this React MFE
      remotes: {
        cartMFE: {
          type: 'module',
          name: 'cartMFE',
          entry: 'http://localhost:3002/remoteEntry.js',
          entryGlobalName: 'cartMFE',
          shareScope: 'default',
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-redux': { singleton: true },
        '@reduxjs/toolkit': { singleton: true },
      },
    }),
  ],
  server: {
    port: 3001,
    origin: 'http://localhost:3001',
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: { target: 'esnext', minify: false, cssCodeSplit: false },
});
