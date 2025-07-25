"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Code,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Settings,
  Trophy,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { FileImport } from "../file-import";

const mainItems = [
  { title: "Home", url: "/dashboard-light", icon: Home, key: "home" },
  { title: "Editor", url: "/editor-light", icon: Code, key: "editor" },
  {
    title: "Challenges",
    url: "/challenges-light",
    icon: Trophy,
    key: "challenges",
  },
  {
    title: "Quizzes",
    url: "/quizzes-light",
    icon: GraduationCap,
    key: "quizzes",
  },
];

const exploreItems = [
  {
    title: "Documentation",
    url: "/documentation-light",
    icon: HelpCircle,
    key: "documentation",
  },
];

interface SidebarLightProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: string; // Add this prop
  onViewChange: (view: string) => void; // Add this prop
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: Date;
}

export function SidebarLight({
  isOpen,
  onToggle,
  activeView,
  onViewChange,
}: SidebarLightProps) {
  const [showFileImport, setShowFileImport] = useState(false);

  const isActive = (key: string) => {
    return activeView === key;
  };

  const handleNavClick = (key: string) => {
    onViewChange(key);
  };

  const handleCreateFile = () => {
    onViewChange("editor");
  };

  const handleImportFile = () => {
    setShowFileImport(true);
  };

  const handleFileImported = (file: UploadedFile) => {
    // Pass file data to parent component instead of navigating
    onViewChange("editor", {
      content: file.content,
      filename: file.name,
    });
    console.log(file.content);
    setShowFileImport(false);
  };

  return (
    <>
      <div
        className={`bg-white/90 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 ease-in-out flex flex-col shadow-lg ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200/50 p-4 flex items-center justify-between">
          <div
            className={`flex items-center gap-2 ${
              isOpen ? "opacity-100" : "opacity-0"
            } transition-opacity duration-200`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  IsiPython IDE
                </h1>
                <p className="text-xs text-gray-500">Python Development</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-gray-600 hover:text-cyan-600 hover:bg-gray-100/50"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "" : "rotate-180"
              }`}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
          {/* File Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              onClick={handleCreateFile}
              className={`w-full text-gray-700 hover:text-cyan-600 hover:bg-gray-100/50 ${
                isOpen ? "justify-start px-3" : "justify-center px-0"
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate ml-3">Create File</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={handleImportFile}
              className={`w-full text-gray-700 hover:text-cyan-600 hover:bg-gray-100/50 ${
                isOpen ? "justify-start px-3" : "justify-center px-0"
              }`}
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate ml-3">Import File</span>}
            </Button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            {mainItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => handleNavClick(item.key)}
                className={`w-full text-gray-700 hover:text-cyan-600 hover:bg-gray-100/50 ${
                  isOpen ? "justify-start px-3" : "justify-center px-0"
                } ${
                  isActive(item.key)
                    ? "bg-cyan-100 text-cyan-700 border-r-2 border-cyan-500"
                    : ""
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {isOpen && <span className="truncate ml-3">{item.title}</span>}
              </Button>
            ))}
          </div>

          {/* Explore Section */}
          <div className="space-y-2">
            {isOpen && (
              <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider px-3">
                Explore Python
              </h3>
            )}
            <div className="space-y-1">
              {exploreItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full text-gray-700 hover:text-cyan-600 hover:bg-gray-100/50 ${
                    isOpen ? "justify-start px-3" : "justify-center px-0"
                  } ${
                    isActive(item.key)
                      ? "bg-cyan-100 text-cyan-700 border-r-2 border-cyan-500"
                      : ""
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate ml-3">{item.title}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/50 p-4">
          <Button
            variant="ghost"
            onClick={() => handleNavClick("settings")}
            className={`w-full text-gray-700 hover:text-cyan-600 hover:bg-gray-100/50 ${
              isOpen ? "justify-start px-3" : "justify-center px-0"
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {isOpen && <span className="truncate">Settings</span>}
          </Button>
        </div>
      </div>

      {/* File Import Modal */}
      {showFileImport && (
        <FileImport
          onFileImported={handleFileImported}
          onClose={() => setShowFileImport(false)}
        />
      )}
    </>
  );
}
