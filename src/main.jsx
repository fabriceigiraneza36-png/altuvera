// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { UserAuthProvider } from "./context/UserAuthContext.jsx";
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
            <App />
          </UserAuthProvider>
        </AppProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);