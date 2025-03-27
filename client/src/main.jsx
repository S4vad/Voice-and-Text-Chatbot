import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./darkmode/ThemeProvider.jsx";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext.jsx";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
