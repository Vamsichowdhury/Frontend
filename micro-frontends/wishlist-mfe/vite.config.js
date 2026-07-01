import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "wishlistMFE",
      dts: false,
      filename: "remoteEntry.js",
      exposes: {
        // Only ONE export — a single component that internally renders <Routes>.
        // The host treats this as a black box and lets it own /wishlist/*.
        "./Wishlist": "./src/Wishlist.jsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        // CRITICAL: react-router-dom MUST be a singleton.
        // The host owns the BrowserRouter; this MFE's <Routes> reads the
        // router context via React context. Two copies = two contexts =
        // the MFE's <Routes> would see "no router" and crash.
        "react-router-dom": { singleton: true, requiredVersion: "^6.0.0" },
      },
    }),
  ],
  server: {
    port: 3004,
    origin: "http://localhost:3004",
    cors: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  build: { target: "esnext", minify: false, cssCodeSplit: false },
});
