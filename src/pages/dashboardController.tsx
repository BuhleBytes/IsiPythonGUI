"use client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadState, saveCurrentRoute, saveCurrentView } from "../utils/storage";
import { ChallengesLight } from "./Dashboard Light Mode/challenges-light";
import { DashboardLight } from "./Dashboard Light Mode/dashboard-light";
import EditorLightPage from "./Dashboard Light Mode/editor-light-page";
import Component from "./Dashboard Light Mode/glossary";
import { QuizzesLight } from "./Dashboard Light Mode/quizzes-light";
import { SidebarLight } from "./Dashboard Light Mode/sidebar-light";

export default function DashboardLightPage() {
  const location = useLocation();

  // Load persisted state on component mount
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState(() => {
    // First check URL state (for programmatic navigation)
    const urlActiveView = location.state?.activeView;
    if (urlActiveView) return urlActiveView;

    // Check if there's a saved view from previous session (for browser refresh)
    const savedState = loadState();
    if (savedState.currentView) {
      return savedState.currentView;
    }

    // Only default to "home" for completely fresh visits
    return "home";
  });

  const [editorData, setEditorData] = useState(() => {
    // Load editor data from localStorage on mount
    const savedState = loadState();
    return savedState.editorState
      ? {
          content: savedState.editorState.code,
          filename: savedState.editorState.fileName,
        }
      : null;
  });

  // Save current route when component mounts or location changes
  useEffect(() => {
    saveCurrentRoute(location.pathname);
  }, [location.pathname]);

  // Save current view whenever it changes
  useEffect(() => {
    saveCurrentView(activeView);
  }, [activeView]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewChange = (view, data = null) => {
    // This stays the same - just change the view, no navigation
    setActiveView(view);

    if (data && view === "editor") {
      setEditorData(data);
    } else if (view === "editor" && !data) {
      // When switching to editor without new data, keep existing editorData
      // The EditorLightPage will handle loading from localStorage
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "home":
        return (
          <DashboardLight
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onViewChange={handleViewChange}
          />
        );
      case "editor":
        return (
          <EditorLightPage
            initialCode={editorData?.content}
            fileName={editorData?.filename}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
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
            onViewChange={handleViewChange}
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
