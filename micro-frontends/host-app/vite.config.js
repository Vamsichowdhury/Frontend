import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      dts: false,
      remotes: {
        productsList: {
          type: "module",
          name: "productsList",
          entry: "http://localhost:3001/remoteEntry.js",
          entryGlobalName: "productsList",
          shareScope: "default",
        },
        ordersMFE: {
          type: "module",
          name: "ordersMFE",
          entry: "http://localhost:3003/remoteEntry.js",
          entryGlobalName: "ordersMFE",
          shareScope: "default",
        },
        wishlistMFE: {
          type: "module",
          name: "wishlistMFE",
          entry: "http://localhost:3004/remoteEntry.js",
          entryGlobalName: "wishlistMFE",
          shareScope: "default",
        },
        // cartMFE is loaded by products-listing-mfe, not directly by host
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        // Singleton router: host owns the BrowserRouter; MFEs reuse the
        // same instance so their <Routes> resolve against the host's URL.
        "react-router-dom": { singleton: true, requiredVersion: "^6.0.0" },
      },
    }),
  ],
  server: {
    port: 3000,
    cors: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  build: { target: "esnext" },
});
