"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import {
  AlertCircle,
  BarChart3,
  Clock,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Menu,
  Play,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStats } from "../../useDashboardStats.js"; // Import the new hook
import { useLearningPath } from "../../useLearningPath";
import { useUser } from "../../useUser";
import { useUserFiles } from "../../useUserFiles";

interface DashboardLightProps {
  sidebarOpen?: boolean;
  fileId?: string | null;
  onToggleSidebar?: () => void;
  onViewChange?: (view: string, data?: any) => void;
}

export function DashboardLight({
  sidebarOpen,
  onToggleSidebar,
  onViewChange,
}: DashboardLightProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAllFiles, setViewAllFiles] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("All");

  const { currentLanguage, changeLanguage } = useLanguage();

  const { firstName } = useUser();
  const { t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "IsiXhosa" ? "English" : "IsiXhosa";
    changeLanguage(newLanguage);
  };

  // Use the custom hooks
  const {
    files,
    loading: filesLoading,
    deletingFiles,
    fetchFiles,
    deleteFile,
    refreshFiles,
    getFilteredFiles,
  } = useUserFiles();

  // Use the dashboard stats hook
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refreshStats,
  } = useDashboardStats();

  // Use the learning path hook
  const {
    learningPath,
    loading: learningPathLoading,
    error: learningPathError,
    refreshLearningPath,
  } = useLearningPath();

  const fileTypes = [t("All"), "IsiPython"];
  const timePeriods = [
    t("All"),
    t("Today"),
    t("This Week"),
    t("This Month"),
    t("Older"),
  ];

  // Updated quickActions with proper handleCreateFile function
  const handleCreateFile = () => {
    if (onViewChange) {
      onViewChange("editor", {
        content: t("# Write code for your new file"),
        filename: "untitled.isi",
        isNewFile: true,
      });
    }
  };

  const quickActions = [
    {
      title: t("Create New File"),
      description: t("Start your coding journey"),
      icon: FileText,
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      hoverGradient: "from-cyan-600 via-blue-600 to-indigo-700",
      action: handleCreateFile,
    },
    {
      title: t("Start Challenge"),
      description: t("Practice with coding challenges"),
      icon: Trophy,
      gradient: "from-purple-500 via-pink-500 to-rose-600",
      hoverGradient: "from-purple-600 via-pink-600 to-rose-700",
      action: () => onViewChange && onViewChange("challenges"),
    },
    {
      title: t("Take Quiz"),
      description: t("Test your python knowledge"),
      icon: GraduationCap,
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      hoverGradient: "from-green-600 via-emerald-600 to-teal-700",
      action: () => onViewChange && onViewChange("quizzes"),
    },
  ];

  // File card component with delete functionality
  const FileCard = ({ file, index }: { file: SavedFile; index: number }) => {
    const isDeleting = deletingFiles.has(file.id);

    return (
      <Card
        key={index}
        className={`bg-gradient-to-br ${
          file.bgGradient
        } border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden ${
          isDeleting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Delete button - positioned in top right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/80 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            deleteFile(file.id);
          }}
          disabled={isDeleting}
          title="Delete file"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>

        <CardContent className="p-5 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${file.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              <file.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-semibold text-gray-900 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-gray-600">
                {file.time === "Just now"
                  ? t(file.time)
                  : (() => {
                      const spaceIndex = file.time.indexOf(" ");
                      if (spaceIndex === -1) return file.time; // No space found, return as-is
                      const number = file.time.slice(0, spaceIndex);
                      const unit = file.time.slice(spaceIndex + 1);
                      return `${number} ${t(unit)}`;
                    })()}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-700 mb-4">
            <Badge className="bg-white/80 text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-colors">
              {file.language}
            </Badge>
            <span className="font-medium">{file.size}</span>
          </div>
          <Button
            size="sm"
            className={`w-full bg-gradient-to-r ${file.gradient} hover:shadow-md text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleting && onViewChange) {
                onViewChange("editor", {
                  content: file.code,
                  filename: file.name,
                  fileId: file.id,
                });
              }
            }}
            disabled={isDeleting}
          >
            <Play className="w-4 h-4 mr-2" />
            {t("Open")}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements - Lower z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header - Fixed positioning with proper z-index */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 p-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 lg:hidden transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Language Toggle Button - Positioned to the right */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300 hover:scale-105 border border-gray-200/50 bg-white/50 backdrop-blur-sm shadow-sm"
              title={`Switch to ${
                currentLanguage === "English" ? "IsiXhosa" : "English"
              }`}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline-block font-medium">
                {currentLanguage === "English" ? "EN" : "XH"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Proper scrollable container */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent flex items-center gap-3">
            {t("Welcome back")}, {firstName}
            <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            {t("Continue your Python journey with IsiPython IDE")}
          </p>
        </div>

        {/* Stats Cards - Maintaining original design with API integration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                {t("Challenges Completed")}
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                {statsLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  stats.challenges.completed
                )}
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full shadow-sm transition-all duration-700"
                    style={{ width: `${stats.challenges.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-500" />+
                    {stats.challenges.this_week} {t("This Week")}
                  </p>
                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200 hover:text-cyan-800 hover:border-cyan-400 transition-colors duration-200 cursor-pointer">
                    {Math.round(stats.challenges.progress)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                {t("Quizzes Attempted")}
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                {statsLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  stats.quizzes.attempted
                )}
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full shadow-sm transition-all duration-700"
                    style={{
                      width: `${
                        (stats.quizzes.attempted / stats.quizzes.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-500" />+
                    {stats.quizzes.this_week} {t("This Week")}
                  </p>

                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 hover:text-purple-800 hover:border-purple-400 transition-colors duration-200 cursor-pointer">
                    {Math.round(
                      (stats.quizzes.attempted / stats.quizzes.total) * 100
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                {t("Overall Progress")}
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {statsLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  `${Math.round(stats.overall.progress)}%`
                )}
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full shadow-sm transition-all duration-700"
                    style={{ width: `${stats.overall.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-500" />
                    {t(stats.overall.message)}
                  </p>
                  <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:text-green-800 hover:border-green-400 transition-colors duration-200 cursor-pointer">
                    {Math.round(stats.overall.progress)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of the component remains the same... */}
        {/* Recent Files Section */}
        {!viewAllFiles ? (
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {t("Recent Files")}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={refreshFiles}
                  className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-medium transition-all duration-300 hover:scale-105"
                  disabled={filesLoading}
                >
                  {filesLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("Refresh")}
                </Button>
                {files.length > 4 && (
                  <Button
                    variant="ghost"
                    onClick={() => setViewAllFiles(true)}
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-medium transition-all duration-300 hover:scale-105"
                  >
                    {t("View all")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="ml-3 text-gray-600">
                    {t("Loading your files...")}
                  </span>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("There's currently no files")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("Create your first IsiPython file to get started")}
                  </p>
                  <Button
                    onClick={handleCreateFile}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t("Create New File")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {files.slice(0, 4).map((file, index) => (
                    <FileCard key={file.id} file={file} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Expanded Files View */
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-cyan-500" />
                    {t("All files")}
                  </CardTitle>
                  <p className="text-gray-600">
                    {t("Look and manage your Python files")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={refreshFiles}
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-medium transition-all duration-300 hover:scale-105"
                    disabled={filesLoading}
                  >
                    {filesLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {t("Refresh")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setViewAllFiles(false)}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 font-medium transition-all duration-300 hover:scale-105"
                  >
                    {t("Go back to Dashboard")}
                  </Button>
                </div>
              </div>

              {/* File Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                          {files.length}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("All files")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                          {fileTypes.length - 1}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("File Types")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                          {
                            files.filter(
                              (f) =>
                                f.time.includes(t("hour")) ||
                                f.time.includes(t("day")) ||
                                f.time.includes(t("minute")) ||
                                f.time.includes(t("Just now"))
                            ).length
                          }
                        </p>
                        <p className="text-xs text-gray-600">{t("Recent")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                          {Math.round(
                            files.reduce(
                              (sum, f) =>
                                sum + parseFloat(f.size.replace(" KB", "")),
                              0
                            ) * 10
                          ) / 10}
                          KB
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("Total Size")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder={t("Search files...")}
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <Select
                  value={selectedFileType}
                  onValueChange={setSelectedFileType}
                >
                  <SelectTrigger className="w-48 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    {fileTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-gray-900 hover:bg-cyan-50"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTimePeriod}
                  onValueChange={setSelectedTimePeriod}
                >
                  <SelectTrigger className="w-36 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    {timePeriods.map((period) => (
                      <SelectItem
                        key={period}
                        value={period}
                        className="text-gray-900 hover:bg-cyan-50"
                      >
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {filesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="ml-3 text-gray-600">
                    {t("Loading your files...")}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFilteredFiles(
                    fileSearchQuery,
                    selectedFileType,
                    selectedTimePeriod
                  ).map((file, index) => (
                    <FileCard key={file.id} file={file} index={index} />
                  ))}
                </div>
              )}

              {!filesLoading &&
                getFilteredFiles(
                  fileSearchQuery,
                  selectedFileType,
                  selectedTimePeriod
                ).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Search className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Azifumanekanga iifayile
                    </h3>
                    <p className="text-gray-600">
                      {files.length === 0
                        ? t("Create your first IsiPython file to get started")
                        : t("Try adjusting your search or filter criteria")}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Bottom Section - Hidden when viewing all files */}
        {!viewAllFiles && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {t("Quick Actions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={action.action}
                    className={`w-full justify-start p-6 h-auto bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white text-lg">
                        {action.title}
                      </div>
                      <div className="text-white/80">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {t("Progress Overview")}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshLearningPath}
                  disabled={learningPathLoading}
                  className="text-gray-500 hover:text-cyan-600 transition-colors duration-200"
                >
                  {learningPathLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningPathLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                    <span className="ml-3 text-gray-600">
                      {t("Loading progress...")}
                    </span>
                  </div>
                ) : learningPathError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {t("Unable to load progress data")}
                    </p>
                    <Button
                      onClick={refreshLearningPath}
                      variant="outline"
                      size="sm"
                      className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                    >
                      {t("Try Again")}
                    </Button>
                  </div>
                ) : learningPath.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Trophy className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("No learning activities yet")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        "Start with a challenge or quiz to begin your journey"
                      )}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() =>
                          onViewChange && onViewChange("challenges")
                        }
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {t("Start Challenge")}
                      </Button>
                      <Button
                        onClick={() => onViewChange && onViewChange("quizzes")}
                        size="sm"
                        variant="outline"
                        className="border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {t("Take Quiz")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  learningPath.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`flex items-center justify-between p-4 rounded-xl ${item.bgColor} border ${item.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102 cursor-pointer group`}
                      onClick={() => {
                        // Navigate to appropriate section based on type
                        if (item.type === "challenge") {
                          onViewChange && onViewChange("challenges");
                        } else if (item.type === "quiz") {
                          onViewChange && onViewChange("quizzes");
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 bg-white/80 rounded-lg shadow-sm`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            {t(item.status)}
                            {item.type && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-white/60"
                              >
                                {item.type === "challenge"
                                  ? t("Challenge")
                                  : t("Quiz")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.progress > 0 && (
                          <div className="w-24">
                            <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  item.status === "In progress"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                    : "bg-gradient-to-r from-cyan-500 to-blue-600"
                                }`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <Badge
                          className={
                            item.status === "Completed"
                              ? "bg-green-500 text-white border-0 shadow-sm"
                              : item.status === "In progress"
                              ? "bg-cyan-500 text-white border-0 shadow-sm"
                              : "bg-gray-400 text-white border-0 shadow-sm"
                          }
                        >
                          {item.status === "Not started"
                            ? t("Start")
                            : t(item.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
