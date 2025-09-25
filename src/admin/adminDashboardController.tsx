"use client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadState, saveCurrentRoute, saveCurrentView } from "../utils/storage";
import LeaderboardPage from "./Dashboard Light Mode/adminLeaderboard";
import AnalyticsPage from "./Dashboard Light Mode/analytics";
import CreateChallenge from "./Dashboard Light Mode/createChallenge";
import CreateQuiz from "./Dashboard Light Mode/createQuiz";
import DraftChallenges from "./Dashboard Light Mode/draftChallenges";
import DraftQuizzes from "./Dashboard Light Mode/draftQuizzes";
import EditChallenge from "./Dashboard Light Mode/editChallenge";
import EditQuiz from "./Dashboard Light Mode/editQuiz";
import AdminDashboard from "./Dashboard Light Mode/homeDashboard";
import PublishedChallenges from "./Dashboard Light Mode/publishedChallenges";
import PublishedQuizzes from "./Dashboard Light Mode/publishedQuizzes";
import { AdminSidebar } from "./Dashboard Light Mode/sidebar";
import ViewChallenge from "./Dashboard Light Mode/viewChallenge";
import ViewQuiz from "./Dashboard Light Mode/viewQuiz"; // Added ViewQuiz import

export default function AdminDashboardController() {
  const location = useLocation();

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine initial active view from URL state, saved state, or default
  const [activeView, setActiveView] = useState(() => {
    const urlActiveView = location.state?.activeView;
    if (urlActiveView) return urlActiveView;

    // Check for saved view from previous session (handles browser refresh)
    const savedState = loadState();
    if (savedState.currentView) {
      return savedState.currentView;
    }

    // Default to dashboard home view
    return "dashboard";
  });

  // Track which challenge is being edited
  const [editChallengeId, setEditChallengeId] = useState<string>("");

  // Track which quiz is being edited
  const [editQuizId, setEditQuizId] = useState<string>("");

  // Track which challenge is being viewed
  const [viewChallengeId, setViewChallengeId] = useState<string>("");

  // Track which quiz is being viewed
  const [viewQuizId, setViewQuizId] = useState<string>("");

  // Persist current route for session management
  useEffect(() => {
    saveCurrentRoute(location.pathname);
  }, [location.pathname]);

  // Persist current view for session management
  useEffect(() => {
    saveCurrentView(activeView);
  }, [activeView]);

  // Toggle sidebar open/closed state
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Main view switching logic with data passing
  const handleViewChange = (view: string, data = null) => {
    setActiveView(view);

    // Handle challenge editing - store challenge ID and clear when leaving
    if (view === "edit" && data?.challengeId) {
      setEditChallengeId(data.challengeId);
    } else if (view !== "edit") {
      setEditChallengeId("");
    }

    // Handle quiz editing - store quiz ID and clear when leaving
    if (view === "edit-quiz" && data?.quizId) {
      setEditQuizId(data.quizId);
    } else if (view !== "edit-quiz") {
      setEditQuizId("");
    }

    // Handle challenge viewing - store challenge ID and clear when leaving
    if (view === "view" && data?.challengeId) {
      setViewChallengeId(data.challengeId);
    } else if (view !== "view") {
      setViewChallengeId("");
    }

    // Handle quiz viewing - store quiz ID and clear when leaving
    if (view === "view-quiz" && data?.quizId) {
      setViewQuizId(data.quizId);
    } else if (view !== "view-quiz") {
      setViewQuizId("");
    }
  };

  // Navigation handler: return to draft challenges list
  const handleBackToList = () => {
    handleViewChange("drafts");
  };

  // Navigation handler: return to draft quizzes list
  const handleBackToQuizDrafts = () => {
    handleViewChange("draft-quizzes");
  };

  // Navigation handler: return to published challenges list
  const handleBackToPublishedList = () => {
    handleViewChange("published");
  };

  // Navigation handler: return to published quizzes list
  const handleBackToPublishedQuizzes = () => {
    handleViewChange("published-quizzes");
  };

  // Main content renderer based on active view
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
      case "create-quiz":
        return <CreateQuiz />;
      case "drafts":
        return (
          <DraftChallenges
            onEditChallenge={(challengeId: string) =>
              handleViewChange("edit", { challengeId })
            }
            onCreateNew={() => handleViewChange("create")}
          />
        );
      case "draft-quizzes":
        return (
          <DraftQuizzes
            onEditQuiz={(quizId: string) =>
              handleViewChange("edit-quiz", { quizId })
            }
            onCreateNew={() => handleViewChange("create-quiz")}
          />
        );
      case "edit":
        return (
          <EditChallenge
            challengeId={editChallengeId}
            onBackToList={handleBackToList}
            onSave={(updatedChallenge) => {
              // Return to drafts list after successful save
              handleViewChange("drafts");
            }}
          />
        );
      case "edit-quiz":
        return (
          <EditQuiz
            quizId={editQuizId}
            onBackToList={handleBackToQuizDrafts}
            onSave={(updatedQuiz) => {
              // Return to draft quizzes list after successful save
              handleViewChange("draft-quizzes");
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
      case "published-quizzes":
        return (
          <PublishedQuizzes
            onViewQuiz={(quizId: string) =>
              handleViewChange("view-quiz", { quizId })
            }
            onCreateNew={() => handleViewChange("create-quiz")}
          />
        );
      case "view":
        return (
          <ViewChallenge
            challengeId={viewChallengeId}
            onBackToList={handleBackToPublishedList}
          />
        );
      case "view-quiz": // Added new case for viewing quiz details
        return (
          <ViewQuiz
            quizId={viewQuizId}
            onBackToList={handleBackToPublishedQuizzes}
          />
        );
      case "analytics":
        return <AnalyticsPage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p>Admin Settings component will be implemented here</p>
          </div>
        );

      default:
        // Fallback to dashboard for any unrecognized views
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
      {/* Sidebar navigation */}
      <AdminSidebar
        isCollapsed={!sidebarOpen}
        onToggle={handleToggleSidebar}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Main content area with responsive margin based on sidebar state */}
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
