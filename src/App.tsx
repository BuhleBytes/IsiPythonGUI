"use client";
import { HomepageLight } from "@/pages/homepage-light";
import { SignUpLight } from "@/pages/signup-light";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomepageLight />} />
        <Route path="/signup" element={<SignUpLight />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
