import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // Use Babel's automatic JSX transform for smaller output
      babel: {
        plugins: [],
      },
    }),
    splitVendorChunkPlugin(),
  ],

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: false, // disable in prod for smaller bundles
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    // Increase inline limit so small assets are inlined (saves requests)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Fine-grained manual chunking – keeps route chunks small
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Core React runtime
            if (
              id.includes("react-dom") ||
              id.includes("react/") ||
              id.includes("react-router")
            ) {
              return "react-core";
            }
            // Animation libraries
            if (id.includes("framer-motion")) {
              return "framer-motion";
            }
            // Map libraries
            if (id.includes("leaflet")) {
              return "leaflet";
            }
            // Icon libraries
            if (id.includes("react-icons")) {
              return "icons";
            }
            // Everything else from node_modules
            return "vendor";
          }
        },
        // Use content-hash file names for long-lived cache headers
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Report bundle size warnings at 500 kB
    chunkSizeWarningLimit: 500,
  },

  // Optimise deps pre-bundling (speeds up cold-start in dev)
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "react-icons/fi",
      "react-icons/hi",
      "react-icons/md",
    ],
  },
});
