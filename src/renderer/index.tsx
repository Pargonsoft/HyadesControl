import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
import { ThemeProvider } from "./components/theme-provider";
import { HashRouter } from "react-router-dom";
import ErrorBoundary from "./errorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <HashRouter>
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </React.StrictMode>
    </HashRouter>
  </ErrorBoundary>
);
