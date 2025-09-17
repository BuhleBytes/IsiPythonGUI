"use client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadState, saveCurrentRoute, saveCurrentView } from "../utils/storage";
import CreateChallenge from "./Dashboard Light Mode/createChallenge";
import DraftChallenges from "./Dashboard Light Mode/draftChallenges";
import EditChallenge from "./Dashboard Light Mode/editChallenge";
import AdminDashboard from "./Dashboard Light Mode/homeDashboard";
import PublishedChallenges from "./Dashboard Light Mode/publishedChallenges";
import { AdminSidebar } from "./Dashboard Light Mode/sidebar";
import ViewChallenge from "./Dashboard Light Mode/viewChallenge";
export default function AdminDashboardController() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(() => {
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

  // Add state for storing edit challenge ID
  const [editChallengeId, setEditChallengeId] = useState<string>("");

  // Add state for storing view challenge ID
  const [viewChallengeId, setViewChallengeId] = useState<string>("");

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

    // Handle data passing for edit challenge
    if (view === "edit" && data?.challengeId) {
      setEditChallengeId(data.challengeId);
      console.log("Switching to edit view for challenge:", data.challengeId);
    } else if (view !== "edit") {
      setEditChallengeId(""); // Clear when leaving edit view
    }

    // Handle data passing for view challenge
    if (view === "view" && data?.challengeId) {
      setViewChallengeId(data.challengeId);
      console.log("Switching to view challenge for ID:", data.challengeId);
    } else if (view !== "view") {
      setViewChallengeId(""); // Clear when leaving view
    }

    // Handle any other data passing if needed for future components
    if (data) {
      console.log("View data:", data);
    }
  };

  const handleBackToList = () => {
    // Go back to drafts view when editing is done
    handleViewChange("drafts");
  };

  const handleBackToPublishedList = () => {
    // Go back to published challenges view when viewing is done
    handleViewChange("published");
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
        return <CreateChallenge />;
      case "drafts":
        return (
          <DraftChallenges
            onEditChallenge={(challengeId: string) =>
              handleViewChange("edit", { challengeId })
            }
            onCreateNew={() => handleViewChange("create")}
          />
        );
      case "edit":
        return (
          <EditChallenge
            challengeId={editChallengeId}
            onBackToList={handleBackToList}
            onSave={(updatedChallenge) => {
              console.log("Challenge saved:", updatedChallenge);
              // Optionally go back to drafts after saving
              handleViewChange("drafts");
            }}
          />
        );
      case "published":
        return (
          <PublishedChallenges
            onViewChallenge={(challengeId: string) =>
              handleViewChange("view", { challengeId })
            }
            onCreateNew={() => handleViewChange("create")}
          />
        );
      case "view":
        return (
          <ViewChallenge
            challengeId={viewChallengeId}
            onBackToList={handleBackToPublishedList}
          />
        );
      case "analytics":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p>Analytics component will be implemented here</p>
          </div>
        );
      case "settings":
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
