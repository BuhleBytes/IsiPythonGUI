"use client";
import { useState } from "react";
import { ChallengesLight } from "./Dashboard Light Mode/challenges-light";
import { DashboardLight } from "./Dashboard Light Mode/dashboard-light";
// import { DocumentationLight } from "./documentation_light";
// import { EditorLight } from "./editor-light"; // Import your other components
import { useLocation } from "react-router-dom";
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
          <DashboardLight sidebarOpen={sidebarOpen} importedData={editorData} />
        );
      case "challenges":
        return <ChallengesLight />;
      case "quizzes":
        return <QuizzesLight />;
      case "documentation":
        return <DashboardLight sidebarOpen={sidebarOpen} />;
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
