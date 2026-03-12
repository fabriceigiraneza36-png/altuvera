// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { UserAuthProvider } from "./context/UserAuthContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { initScrollObserver } from "./utils/scrollObserver.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <HelmetProvider>
        <AppProvider>
          <UserAuthProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </UserAuthProvider>
        </AppProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Activate global CSS scroll animation system
initScrollObserver();
