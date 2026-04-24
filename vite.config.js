// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProd = mode === "production";

  const backendTarget =
    env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "https://backend-jd8f.onrender.com";

  return {
    // ── Plugins ──────────────────────────────────────────────────────────────
    plugins: [
      react({
        babel: {
          plugins: [],
        },
        // Faster HMR in dev
        fastRefresh: isDev,
      }),
    ],

    // ── Path Aliases ──────────────────────────────────────────────────────────
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },

    // ── Dev Server ────────────────────────────────────────────────────────────
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      host: true,
      cors: true,
      proxy: {
        // ✅ Proxy /api → backend (eliminates CORS issues in dev)
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("[Proxy] Error:", err.message);
            });
            proxy.on("proxyReq", (_, req) => {
              if (isDev) {
                console.log(`[Proxy] ${req.method} ${req.url}`);
              }
            });
            proxy.on("proxyRes", (res, req) => {
              if (isDev && res.statusCode >= 400) {
                console.warn(`[Proxy] ${res.statusCode} ${req.url}`);
              }
            });
          },
        },
      },
    },

    // ── Preview Server ────────────────────────────────────────────────────────
    preview: {
      port: 4173,
      strictPort: false,
      host: true,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },

    // ── Build ─────────────────────────────────────────────────────────────────
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "es2020",
      sourcemap: false,
      minify: "esbuild",
      cssMinify: true,
      assetsInlineLimit: 8192, // Inline assets < 8KB
      reportCompressedSize: isProd,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          // ── Manual Chunks ─────────────────────────────────────────────────
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // React core — keep together for optimal caching
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router") ||
              id.includes("/scheduler/")
            ) {
              return "react-core";
            }

            // Framer Motion — heavy, lazy load separately
            if (id.includes("/framer-motion/")) return "animations";

            // Leaflet / Maps
            if (id.includes("/leaflet/") || id.includes("/react-leaflet/")) {
              return "maps";
            }

            // Icons
            if (id.includes("/react-icons/")) return "icons";
            if (id.includes("/lucide-react/")) return "lucide";

            // Auth libraries
            if (
              id.includes("/@simplewebauthn/") ||
              id.includes("/google-auth")
            ) {
              return "auth";
            }

            // Everything else → vendor
            return "vendor";
          },

          // ── File Naming ────────────────────────────────────────────────────
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: ({ name = "" }) => {
            if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(name)) {
              return "assets/images/[name]-[hash][extname]";
            }
            if (/\.css$/i.test(name)) {
              return "assets/css/[name]-[hash][extname]";
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return "assets/fonts/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },

    // ── Dependency Optimization ───────────────────────────────────────────────
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "framer-motion",
        "leaflet",
        "react-leaflet",
        "react-icons",
        "lucide-react",
        "react-helmet-async",
      ],
      exclude: ["@simplewebauthn/browser"],
      esbuildOptions: {
        target: "es2020",
      },
    },

    // ── Global Defines ────────────────────────────────────────────────────────
    define: {
      // ✅ Fixes "Cannot use import.meta outside a module" for CJS deps
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__: isDev,
      __PROD__: isProd,
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "1.0.0"
      ),
    },

    // ── CSS ───────────────────────────────────────────────────────────────────
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: "camelCase",
      },
    },

    // ── esbuild ───────────────────────────────────────────────────────────────
    esbuild: {
      // Drop console/debugger in production
      drop: isProd ? ["console", "debugger"] : [],
      logOverride: {
        "this-is-undefined-in-esm": "silent",
      },
    },
  };
});