/**
 * AdminSidebar Component
 *
 * This component renders a collapsible sidebar navigation for an admin panel.
 * It provides navigation between different admin views like dashboard, creating challenges/quizzes,
 * viewing drafts, and published content. The sidebar can be collapsed to save space and maintains
 * active state highlighting for the current view.
 *
 * Features:
 * - Collapsible sidebar with smooth animations
 * - Active state management for navigation items
 * - Responsive design with backdrop blur effects
 * - Icon-based navigation with labels (hidden when collapsed)
 * - Branded header with gradient styling
 * - Footer with version information
 */

"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Code2,
  FileText,
  Globe,
  LayoutDashboard,
  Medal,
  Menu,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Configuration array for sidebar navigation items
// Each item represents a different admin panel view with its display properties
const menuItems = [
  {
    title: "Dashboard",
    key: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Challenge",
    key: "create",
    icon: Plus,
  },
  {
    title: "Create Quiz",
    key: "create-quiz",
    icon: Plus,
  },
  {
    title: "Drafted Challenges",
    key: "drafts",
    icon: FileText,
  },
  {
    title: "Drafted Quizzes",
    key: "draft-quizzes",
    icon: FileText,
  },
  {
    title: "Published Challenges",
    key: "published",
    icon: Globe,
  },
  {
    title: "Published Quizzes",
    key: "published-quizzes",
    icon: Globe,
  },
  {
    title: "Analytics",
    key: "analytics",
    icon: BarChart3,
  },
  {
    title: "Student Leaderboard",
    key: "leaderboard",
    icon: Medal,
  },
];

// TypeScript interface defining the props structure for the AdminSidebar component
interface AdminSidebarProps {
  isCollapsed: boolean; // Controls whether sidebar is collapsed or expanded
  onToggle: () => void; // Callback function to handle collapse/expand toggle
  activeView: string; // Current active view identifier
  onViewChange: (view: string, data?: any) => void; // Callback for when user navigates to different view
}

export function AdminSidebar({
  isCollapsed,
  onToggle,
  activeView,
  onViewChange,
}: AdminSidebarProps) {
  /**
   * Helper function to determine if a navigation item is currently active
   * @param key - The key identifier of the navigation item to check
   * @returns boolean indicating if the item matches the current active view
   */
  const isActive = (key: string) => {
    return activeView === key;
  };

  /**
   * Handler function for navigation item clicks
   * Calls the parent component's view change handler to switch views
   * Maintains SPA (Single Page Application) behavior without page reloads
   * @param key - The identifier of the view to navigate to
   */
  const handleNavClick = (key: string) => {
    // Simple view change - no navigation, keeps SPA behavior
    onViewChange(key);
  };

  const { t } = useTranslation();

  return (
    <div
      className={cn(
        // Base styles: fixed positioning, full height, background with blur effect
        "fixed left-0 top-0 z-40 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 ease-in-out shadow-xl shadow-gray-200/20 flex flex-col",
        // Conditional width based on collapsed state
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header Section - Contains logo, title, and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        {/* Logo and Title Container */}
        <div className="flex items-center gap-3">
          {/* Brand Logo - Gradient background with Code2 icon */}
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Code2 className="w-4 h-4 text-white" />
          </div>

          {/* Title and Subtitle - Only shown when sidebar is not collapsed */}
          {!isCollapsed && (
            <div>
              {/* Main title with gradient text effect and sparkles icon */}
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                Admin Panel
                <Sparkles className="w-3 h-3 text-cyan-500 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-500">{t("Create and Manage")}</p>
            </div>
          )}
        </div>

        {/* Toggle Button - Switches between Menu and X icon based on collapsed state */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-200"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Section - Contains all menu items */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-2">
          {/* Map through all menu items to create navigation buttons */}
          {menuItems.map((item) => {
            // Check if current item is the active one
            const itemIsActive = isActive(item.key);

            return (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => handleNavClick(item.key)}
                className={cn(
                  // Base button styles with hover effects
                  "w-full text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200",
                  // Conditional layout based on collapsed state
                  isCollapsed
                    ? "justify-center px-0 py-3" // Centered icon only when collapsed
                    : "justify-start px-3 py-3", // Left-aligned with padding when expanded
                  // Active state styling - highlighted background and border
                  itemIsActive
                    ? "bg-cyan-100 text-cyan-700 border-r-2 border-cyan-500"
                    : ""
                )}
              >
                {/* Navigation item icon - always visible */}
                <item.icon className="w-4 h-4 flex-shrink-0" />

                {/* Navigation item label - only shown when not collapsed */}
                {!isCollapsed && (
                  <span className="truncate ml-3 font-medium">
                    {t(item.title)}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer Section - Version information, only shown when sidebar is expanded */}
      {!isCollapsed && (
        <div className="border-t border-gray-200/50 p-4">
          {/* Version display card with subtle styling */}
          <div className="text-center text-sm text-gray-500 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-lg py-2 px-3 border border-gray-200/50">
            <div className="flex items-center justify-center gap-2">
              {/* Mini logo for branding consistency */}
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-sm flex items-center justify-center">
                <Code2 className="w-2 h-2 text-white" />
              </div>
              {/* Version text */}
              <span className="font-medium text-gray-600">Admin Dashboard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
