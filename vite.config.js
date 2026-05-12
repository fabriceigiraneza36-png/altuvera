// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // ── Environment ─────────────────────────────────────────────────────────────
  const env    = loadEnv(mode, process.cwd(), "");
  const isDev  = mode === "development";
  const isProd = mode === "production";

  // Strip trailing /api from backend URL if present
  const backendTarget =
    env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "https://backend-jd8f.onrender.com";

  // ── Shared response headers ─────────────────────────────────────────────────
  // CRITICAL: "same-origin-allow-popups" (NOT "same-origin") allows Google
  // OAuth popup windows to communicate back via postMessage / window.opener
  // "same-origin" would block ALL cross-origin popup communication
  const sharedHeaders = {
    "Cross-Origin-Opener-Policy":   "same-origin-allow-popups",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    // Allow Google GSI script & OAuth endpoints
    "Cross-Origin-Resource-Policy": "cross-origin",
    // Basic security headers safe for SPA
    "X-Content-Type-Options":       "nosniff",
    "X-Frame-Options":              "SAMEORIGIN",
    "Referrer-Policy":              "strict-origin-when-cross-origin",
    // Permissions policy — allow Google sign-in identity API
    "Permissions-Policy":           "identity-credentials-get=*",
  };

  return {
    // ── Plugins ────────────────────────────────────────────────────────────────
    plugins: [
      react({
        fastRefresh: isDev,
      }),
      tailwindcss(),
    ],

    // ── Path Aliases ───────────────────────────────────────────────────────────
    resolve: {
      alias: {
        "@":           path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages":      path.resolve(__dirname, "./src/pages"),
        "@hooks":      path.resolve(__dirname, "./src/hooks"),
        "@utils":      path.resolve(__dirname, "./src/utils"),
        "@context":    path.resolve(__dirname, "./src/context"),
        "@services":   path.resolve(__dirname, "./src/services"),
        "@assets":     path.resolve(__dirname, "./src/assets"),
      },
    },

    // ── Dev Server ─────────────────────────────────────────────────────────────
    server: {
      port:       5174,
      strictPort: false,
      open:       true,
      host:       true,
      cors:       true,

      // ✅ COOP + security headers for dev server
      // Without these, Google OAuth popup cannot communicate back to the app
      headers: sharedHeaders,

      proxy: {
        // Proxy /api/* → backend to avoid CORS in dev
        "/api": {
          target:       backendTarget,
          changeOrigin: true,
          secure:       true,
          rewrite:      (p) => p,

          configure: (proxy) => {
            proxy.on("error", (err, req) => {
              console.error(`[Proxy] ✖ Error on ${req?.url}:`, err.message);
            });
            proxy.on("proxyReq", (_, req) => {
              if (isDev) console.log(`[Proxy] ▶ ${req.method} ${req.url}`);
            });
            proxy.on("proxyRes", (res, req) => {
              if (isDev && res.statusCode >= 400) {
                console.warn(`[Proxy] ✖ ${res.statusCode} ${req.url}`);
              }
            });
          },
        },

        // Proxy Google OAuth callback in dev so the popup lands on our origin
        "/auth/google": {
          target:       `http://localhost:5174`,
          changeOrigin: false,
          // The actual /auth/google/callback is a React route — no rewrite needed
        },
      },
    },

    // ── Preview Server (vite preview) ──────────────────────────────────────────
    preview: {
      port:       4173,
      strictPort: false,
      host:       true,

      // ✅ Same COOP headers for preview builds
      headers: sharedHeaders,

      proxy: {
        "/api": {
          target:       backendTarget,
          changeOrigin: true,
          secure:       true,
        },
      },
    },

    // ── Build ──────────────────────────────────────────────────────────────────
    build: {
      outDir:                "dist",
      emptyOutDir:           true,
      target:                "es2020",
      sourcemap:             false,
      minify:                "esbuild",
      cssMinify:             true,
      assetsInlineLimit:     8192,
      reportCompressedSize:  isProd,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (
              id.includes("/react/")       ||
              id.includes("/react-dom/")   ||
              id.includes("/react-router") ||
              id.includes("/scheduler/")
            ) return "react-core";

            if (id.includes("/framer-motion/"))  return "animations";

            if (
              id.includes("/leaflet/")      ||
              id.includes("/react-leaflet/")
            ) return "maps";

            if (id.includes("/react-icons/"))  return "icons";
            if (id.includes("/lucide-react/")) return "lucide";

            if (
              id.includes("/@simplewebauthn/") ||
              id.includes("/google-auth")
            ) return "auth";

            return "vendor";
          },

          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",

          assetFileNames: ({ name = "" }) => {
            if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(name))
              return "assets/images/[name]-[hash][extname]";
            if (/\.css$/i.test(name))
              return "assets/css/[name]-[hash][extname]";
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name))
              return "assets/fonts/[name]-[hash][extname]";
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },

    // ── Dependency Pre-bundling ────────────────────────────────────────────────
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

    // ── Global Compile-time Constants ─────────────────────────────────────────
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__:                isDev,
      __PROD__:               isProd,
      __APP_VERSION__:        JSON.stringify(
        process.env.npm_package_version || "1.0.0",
      ),
    },

    // ── CSS ────────────────────────────────────────────────────────────────────
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: "camelCase",
      },
    },

    // ── esbuild ───────────────────────────────────────────────────────────────
    esbuild: {
      drop: isProd ? ["console", "debugger"] : [],
      logOverride: {
        "this-is-undefined-in-esm": "silent",
      },
    },
  };
});