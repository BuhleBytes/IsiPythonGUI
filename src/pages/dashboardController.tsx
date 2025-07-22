"use client";
import { useState } from "react";
import { DashboardLight } from "./Dashboard Light Mode/dashboard-light";
// import { ChallengesLight } from "./challenges-light";
// import { DocumentationLight } from "./documentation_light";
// import { EditorLight } from "./editor-light"; // Import your other components
// import { QuizzesLight } from "./quizzes-light";
import { SidebarLight } from "./Dashboard Light Mode/sidebar-light";

export default function DashboardLightPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
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
        return <DashboardLight sidebarOpen={sidebarOpen} />;
      case "quizzes":
        return <DashboardLight sidebarOpen={sidebarOpen} />;
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
