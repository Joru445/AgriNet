import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import "remixicon/fonts/remixicon.css";

import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
