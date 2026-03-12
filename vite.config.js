import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
  ],

  server: {
    port: 5173,
    open: true,
    strictPort: true,
  },

  preview: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
    target: "esnext",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,

    // inline small assets to reduce requests
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {

            // React core
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-core";
            }

            // animations
            if (id.includes("framer-motion")) {
              return "animations";
            }

            // maps
            if (id.includes("leaflet")) {
              return "maps";
            }

            // icons
            if (id.includes("react-icons")) {
              return "icons";
            }

            // other dependencies
            return "vendor";
          }
        },

        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (!name) return "assets/[name]-[hash].[ext]";

          if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (/\.css$/.test(name)) {
            return "assets/css/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },

    chunkSizeWarningLimit: 800,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "leaflet",
      "react-icons",
    ],
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});