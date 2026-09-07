import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import "remixicon/fonts/remixicon.css";

import App from "./App";
import AuthHandlerPage from "./pages/auth/AuthHandlerPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              {/* Dedicated provider authentication tabs. Rendered OUTSIDE the
                  main App so opening them never redirects or refreshes the
                  registration tab. */}
              <Route
                path="/auth/google"
                element={<AuthHandlerPage method="google" />}
              />
              <Route
                path="/auth/facebook"
                element={<AuthHandlerPage method="facebook" />}
              />
              <Route path="/*" element={<App />} />
            </Routes>

          <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
            />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
