import "./App.css";

import { Routes, Route } from "react-router-dom";

import SignupPage from "./pages/userSignup";
import { AuthProvider } from "@/context/AuthContext";
import LoginPage from "./pages/Login";
import Layout from "./pages/Layout";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Layout />} />
      </Routes>
    </AuthProvider>
  );
}
