"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChallengesLight } from "./Dashboard Light Mode/challenges-light";
import { DashboardLight } from "./Dashboard Light Mode/dashboard-light";
import EditorLightPage from "./Dashboard Light Mode/editor-light-page";
import Component from "./Dashboard Light Mode/glossary";
import { QuizzesLight } from "./Dashboard Light Mode/quizzes-light";
import { SidebarLight } from "./Dashboard Light Mode/sidebar-light";

export default function DashboardLightPage() {
  const location = useLocation();
  const activeViewFromState = location.state?.activeView || "home";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState(activeViewFromState);
  const [editorData, setEditorData] = useState(null); // For imported files

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewChange = (view, data = null) => {
    setActiveView(view);
    if (data && view === "editor") {
      setEditorData(data);
    } else if (view === "editor" && !data) {
      setEditorData(null);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "home":
        return (
          <DashboardLight
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
        );
      case "editor":
        return (
          <EditorLightPage
            initialCode={editorData?.content}
            fileName={editorData?.filename}
          />
        );
      case "challenges":
        return <ChallengesLight />;
      case "quizzes":
        return <QuizzesLight />;
      case "documentation":
        return <Component />;
      case "templates":
        return <div className="p-8">Templates Component Coming Soon...</div>;
      case "learn":
        return <div className="p-8">Learn Component Coming Soon...</div>;
      case "settings":
        return <div className="p-8">Settings Component Coming Soon...</div>;
      default:
        return (
          <DashboardLight
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarLight
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
}
