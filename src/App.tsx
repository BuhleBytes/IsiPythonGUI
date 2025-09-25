"use client";
import AdminRoute from "@/components/adminRoute";
import StudentRoute from "@/components/studentRoute";
import { LanguageProvider } from "@/context/LanguageContext";
import DashboardLightPage from "@/pages/dashboardController";
import { HomepageLight } from "@/pages/homepage-light";
import { SignUpLight } from "@/pages/signup-light";
import "@/utils/i18n"; // This ensures i18n is initialized
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboardController from "./admin/adminDashboardController";
import LeaderboardPage from "./admin/Dashboard Light Mode/adminLeaderboard";
import { ChallengeSolverLight } from "./pages/Dashboard Light Mode/challenge-solver-light";
import { CodeEditorLight } from "./pages/Dashboard Light Mode/code-editor-light";
import { QuizReviewLight } from "./pages/Dashboard Light Mode/quiz-review-light";
import { QuizTakerLight } from "./pages/Dashboard Light Mode/quiz-taker-light";
import { LoginLight } from "./pages/login-light";

import "./App.css";
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomepageLight />} />
          <Route path="/signup" element={<SignUpLight />} />
          <Route path="/login" element={<LoginLight />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardController />
              </AdminRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/dash"
            element={
              <StudentRoute>
                <DashboardLightPage />
              </StudentRoute>
            }
          />
          <Route path="/quiz-light/:id" element={<QuizTakerLight />} />
          <Route path="/quiz-review/:id" element={<QuizReviewLight />} />
          <Route path="/challenge/:id" element={<ChallengeSolverLight />} />
          <Route path="/editor" element={<CodeEditorLight />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
