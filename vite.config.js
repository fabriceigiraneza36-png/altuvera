// vite.config.js
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env    = loadEnv(mode, process.cwd(), "");
  const isDev  = mode === "development";
  const isProd = mode === "production";

  const backendTarget =
    env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "https://backend-jd8f.onrender.com";

  const sharedHeaders = {
    "Cross-Origin-Opener-Policy":   "same-origin-allow-popups",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options":       "nosniff",
    "X-Frame-Options":              "SAMEORIGIN",
    "Referrer-Policy":              "strict-origin-when-cross-origin",
    "Permissions-Policy":           "identity-credentials-get=*",
  };

  return {
    plugins: [
      tailwindcss(), // ✅ MUST be first
      react({ fastRefresh: isDev }),
    ],

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

    server: {
      port:       5174,
      strictPort: false,
      open:       true,
      host:       true,
      cors:       true,
      headers:    sharedHeaders,

      proxy: {
        "/api": {
          target:       backendTarget,
          changeOrigin: true,
          secure:       true,
          rewrite:      (p) => p,
          configure: (proxy) => {
            proxy.on("error",    (err, req) => console.error(`[Proxy] ✖ ${req?.url}:`, err.message));
            proxy.on("proxyReq", (_, req)   => { if (isDev) console.log(`[Proxy] ▶ ${req.method} ${req.url}`); });
            proxy.on("proxyRes", (res, req) => { if (isDev && res.statusCode >= 400) console.warn(`[Proxy] ✖ ${res.statusCode} ${req.url}`); });
          },
        },
        "/auth/google": {
          target:       "http://localhost:5174",
          changeOrigin: false,
        },
      },
    },

    preview: {
      port:       4173,
      strictPort: false,
      host:       true,
      headers:    sharedHeaders,
      proxy: {
        "/api": {
          target:       backendTarget,
          changeOrigin: true,
          secure:       true,
        },
      },
    },

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
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: ({ name = "" }) => {
            if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(name)) return "assets/images/[name]-[hash][extname]";
            if (/\.css$/i.test(name))                                 return "assets/css/[name]-[hash][extname]";
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name))               return "assets/fonts/[name]-[hash][extname]";
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },

    optimizeDeps: {
      include: [
        "react", "react-dom", "react-router-dom",
        "framer-motion", "leaflet", "react-leaflet",
        "react-icons", "lucide-react", "react-helmet-async",
      ],
      exclude: ["@simplewebauthn/browser"],
      // ✅ FIXED: Vite 8 uses rolldownOptions, not esbuildOptions
      rolldownOptions: {
        output: {
          target: "es2020",
        },
      },
    },

    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__:                isDev,
      __PROD__:               isProd,
      __APP_VERSION__:        JSON.stringify(process.env.npm_package_version || "1.0.0"),
    },

    css: {
      devSourcemap: isDev,
      modules: { localsConvention: "camelCase" },
    },

    // ✅ FIXED: Vite 8 uses top-level esbuild (for transforms only, not deps)
    esbuild: {
      drop: isProd ? ["console", "debugger"] : [],
    },
  };
});