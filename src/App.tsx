"use client";
import DashboardLightPage from "@/pages/dashboardController";
import { HomepageLight } from "@/pages/homepage-light";
import { SignUpLight } from "@/pages/signup-light";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QuizTakerLight } from "./pages/Dashboard Light Mode/quiz-taker-light";
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
        <Route path="/quiz-light/:id" element={<QuizTakerLight />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
