"use client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadState, saveCurrentRoute, saveCurrentView } from "../utils/storage";
import CreateChallenge from "./Dashboard Light Mode/createChallenge";
import DraftChallenges from "./Dashboard Light Mode/draftChallenges";
import AdminDashboard from "./Dashboard Light Mode/homeDashboard";
import { AdminSidebar } from "./Dashboard Light Mode/sidebar";
// import AdminDashboard from "./adminDashboard-home";
// Import other admin components as they're created
// import DraftChallenges from "./draft-challenges";
// import PublishedChallenges from "./published-challenges";
// import AdminAnalytics from "./admin-analytics";
// import AdminSettings from "./admin-settings";

export default function AdminDashboardController() {
  const location = useLocation();

  // Load persisted state on component mount
  const [sidebarOpen, setSidebarOpen] = useState(false); // Admin sidebar starts collapsed
  const [activeView, setActiveView] = useState(() => {
    // First check URL state (for programmatic navigation)
    const urlActiveView = location.state?.activeView;
    if (urlActiveView) return urlActiveView;

    // Check if there's a saved view from previous session (for browser refresh)
    const savedState = loadState();
    if (savedState.currentView) {
      return savedState.currentView;
    }

    // Default to "dashboard" for admin (home view)
    return "dashboard";
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

  const handleViewChange = (view: string, data = null) => {
    // Change the view without navigation
    setActiveView(view);

    // Handle any data passing if needed for future components
    if (data) {
      // Store data in state or localStorage as needed
      console.log("View data:", data);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <AdminDashboard
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onViewChange={handleViewChange}
          />
        );
      case "create":
        // Placeholder for create challenge component
        return <CreateChallenge />;
      case "drafts":
        // Placeholder for draft challenges component
        return <DraftChallenges />;
      case "published":
        // Placeholder for published challenges component
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Published Challenges</h1>
            <p>Published Challenges component will be implemented here</p>
          </div>
        );
      case "analytics":
        // Placeholder for analytics component
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p>Analytics component will be implemented here</p>
          </div>
        );
      case "settings":
        // Placeholder for admin settings component
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p>Admin Settings component will be implemented here</p>
          </div>
        );
      default:
        return (
          <AdminDashboard
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onViewChange={handleViewChange}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        isCollapsed={!sidebarOpen}
        onToggle={handleToggleSidebar}
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {renderMainContent()}
      </div>
    </div>
  );
}
