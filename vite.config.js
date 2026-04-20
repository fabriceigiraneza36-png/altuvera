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
    proxy: {
      "/api": {
        target: "https://backend-jd8f.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
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
    assetsInlineLimit: 8192,

    // Enable compression
    reportCompressedSize: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {

            // React core - keep together for better caching
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-core";
            }

            // animations - lazy load framer-motion
            if (id.includes("framer-motion")) {
              return "animations";
            }

            // maps - lazy load leaflet
            if (id.includes("leaflet")) {
              return "maps";
            }

            // icons - separate chunk
            if (id.includes("react-icons")) {
              return "icons";
            }

            // lucide icons
            if (id.includes("lucide-react")) {
              return "lucide";
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

          return "assets/[name]-[hash].[ext]";
        },
      },
    },

    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "leaflet",
      "react-icons",
      "lucide-react",
    ],
    // Pre-build dependencies for faster dev server startup
    esbuildOptions: {
      target: "esnext",
    },
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable faster HMR
    hmrPartialAccept: true,
  },
});
