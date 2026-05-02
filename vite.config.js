// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // ── Environment ─────────────────────────────────────────────────────────────
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProd = mode === "production";

  // Strip trailing /api from the backend URL if present
  const backendTarget =
    env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "https://backend-jd8f.onrender.com";

  return {
    // ── Plugins ────────────────────────────────────────────────────────────────
    plugins: [
      react({
        // Faster HMR in dev — no-op in prod
        fastRefresh: isDev,
      }),

      // Tailwind CSS v4 via official Vite plugin
      tailwindcss(),
    ],

    // ── Path Aliases ───────────────────────────────────────────────────────────
    resolve: {
      alias: {
        "@":            path.resolve(__dirname, "./src"),
        "@components":  path.resolve(__dirname, "./src/components"),
        "@pages":       path.resolve(__dirname, "./src/pages"),
        "@hooks":       path.resolve(__dirname, "./src/hooks"),
        "@utils":       path.resolve(__dirname, "./src/utils"),
        "@context":     path.resolve(__dirname, "./src/context"),
        "@services":    path.resolve(__dirname, "./src/services"),
        "@assets":      path.resolve(__dirname, "./src/assets"),
      },
    },

    // ── Dev Server ─────────────────────────────────────────────────────────────
    server: {
      port:       5174,
      strictPort: false,
      open:       true,
      host:       true,
      cors:       true,

      proxy: {
        // Proxy all /api/* requests → backend to avoid CORS in dev
        "/api": {
          target:       backendTarget,
          changeOrigin: true,
          secure:       true,
          rewrite:      (p) => p, // keep path as-is

          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("[Proxy] Error:", err.message);
            });

            proxy.on("proxyReq", (_, req) => {
              if (isDev) {
                console.log(`[Proxy] ▶ ${req.method} ${req.url}`);
              }
            });

            proxy.on("proxyRes", (res, req) => {
              if (isDev && res.statusCode >= 400) {
                console.warn(`[Proxy] ✖ ${res.statusCode} ${req.url}`);
              }
            });
          },
        },
      },
    },

    // ── Preview Server (vite preview) ──────────────────────────────────────────
    preview: {
      port:       4173,
      strictPort: false,
      host:       true,

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
      outDir:               "dist",
      emptyOutDir:          true,
      target:               "es2020",
      sourcemap:            false,        // flip to true for prod debugging
      minify:               "esbuild",
      cssMinify:            true,
      assetsInlineLimit:    8192,         // inline assets < 8 KB as base64
      reportCompressedSize: isProd,       // skip in dev for faster builds
      chunkSizeWarningLimit: 1000,        // warn at 1 MB

      rollupOptions: {
        output: {
          // ── Manual chunk splitting ─────────────────────────────────────────
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // React runtime
            if (
              id.includes("/react/")        ||
              id.includes("/react-dom/")    ||
              id.includes("/react-router")  ||
              id.includes("/scheduler/")
            ) return "react-core";

            // Animation library
            if (id.includes("/framer-motion/")) return "animations";

            // Mapping libraries
            if (
              id.includes("/leaflet/")       ||
              id.includes("/react-leaflet/")
            ) return "maps";

            // Icon libraries
            if (id.includes("/react-icons/"))  return "icons";
            if (id.includes("/lucide-react/")) return "lucide";

            // Auth-related packages
            if (
              id.includes("/@simplewebauthn/") ||
              id.includes("/google-auth")
            ) return "auth";

            // Everything else from node_modules
            return "vendor";
          },

          // ── Output file naming ─────────────────────────────────────────────
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

      // Skip — ships its own ESM bundle
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
        process.env.npm_package_version || "1.0.0"
      ),
    },

    // ── CSS ────────────────────────────────────────────────────────────────────
    css: {
      // Source maps only in dev (faster prod builds)
      devSourcemap: isDev,

      modules: {
        // Enable camelCase access: styles.myClass instead of styles['my-class']
        localsConvention: "camelCase",
      },
    },

    // ── esbuild Transform Options ──────────────────────────────────────────────
    esbuild: {
      // Strip console.* and debugger in production
      drop: isProd ? ["console", "debugger"] : [],

      logOverride: {
        // Silence noisy ESM warning from some CJS-authored packages
        "this-is-undefined-in-esm": "silent",
      },
    },
  };
});