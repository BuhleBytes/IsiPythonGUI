"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Code2,
  FileText,
  Globe,
  LayoutDashboard,
  Menu,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string, data?: any) => void;
}

export function AdminSidebar({
  isCollapsed,
  onToggle,
  activeView,
  onViewChange,
}: AdminSidebarProps) {
  const isActive = (key: string) => {
    return activeView === key;
  };

  const handleNavClick = (key: string) => {
    // Simple view change - no navigation, keeps SPA behavior
    onViewChange(key);
  };
  
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 ease-in-out shadow-xl shadow-gray-200/20 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                Admin Panel
                <Sparkles className="w-3 h-3 text-cyan-500 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-500">{t("Create and Manage")}</p>
            </div>
          )}
        </div>
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

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const itemIsActive = isActive(item.key);
            return (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => handleNavClick(item.key)}
                className={cn(
                  "w-full text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200",
                  isCollapsed
                    ? "justify-center px-0 py-3"
                    : "justify-start px-3 py-3",
                  itemIsActive
                    ? "bg-cyan-100 text-cyan-700 border-r-2 border-cyan-500"
                    : ""
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
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

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-200/50 p-4">
          <div className="text-center text-sm text-gray-500 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-lg py-2 px-3 border border-gray-200/50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-sm flex items-center justify-center">
                <Code2 className="w-2 h-2 text-white" />
              </div>
              <span className="font-medium text-gray-600">
                Admin Dashboard
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
