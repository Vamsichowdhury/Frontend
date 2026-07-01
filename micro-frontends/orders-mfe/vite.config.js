import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'ordersMFE',
      dts: false,
      filename: 'remoteEntry.js',
      exposes: {
        './Orders': './src/Orders.jsx',
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
    port: 3003,
    origin: 'http://localhost:3003',
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: { target: 'esnext', minify: false, cssCodeSplit: false },
});
