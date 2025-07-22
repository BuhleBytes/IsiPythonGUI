"use client";
import DashboardLightPage from "@/pages/dashboardController";
import { HomepageLight } from "@/pages/homepage-light";
import { SignUpLight } from "@/pages/signup-light";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginLight } from "./pages/login-light";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomepageLight />} />
        <Route path="/signup" element={<SignUpLight />} />
        <Route path="/login" element={<LoginLight />} />
        <Route path="/dash" element={<DashboardLightPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
