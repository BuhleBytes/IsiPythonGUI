import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Eye,
  FileText,
  Globe,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useDashboardData } from "../useDashboardData";

interface AdminDashboardProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onViewChange?: (view: string, data?: any) => void;
}

export default function AdminDashboard({
  sidebarOpen,
  onToggleSidebar,
  onViewChange,
}: AdminDashboardProps) {
  const { data, loading, error, refetch } = useDashboardData();
  const [activeTab, setActiveTab] = useState<"challenges" | "quizzes">(
    "challenges"
  );

  const handleCreateChallenge = () => {
    if (onViewChange) {
      onViewChange("create");
    }
  };

  const handleViewDrafts = () => {
    if (onViewChange) {
      onViewChange("drafts");
    }
  };

  const handleViewPublished = () => {
    if (onViewChange) {
      onViewChange("published");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Loading Dashboard...
          </div>
          <div className="text-sm text-gray-500">Fetching your latest data</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Failed to Load Dashboard
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Map API data to stats format
  const stats = [
    {
      title: "Total Students",
      value: data.overview.total_students.count.toLocaleString(),
      icon: Users,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-500/10 to-blue-600/10",
      change: `${
        data.overview.total_students.growth_percentage > 0 ? "+" : ""
      }${data.overview.total_students.growth_percentage}%`,
      changeColor:
        data.overview.total_students.growth_percentage >= 0
          ? "text-emerald-600"
          : "text-red-600",
      thisWeek: `+${data.overview.total_students.new_this_week} this week`,
    },
    {
      title: "Active Challenges",
      value: data.overview.active_challenges.count.toString(),
      icon: Trophy,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
      change: `${
        data.overview.active_challenges.growth_percentage > 0 ? "+" : ""
      }${data.overview.active_challenges.growth_percentage}%`,
      changeColor:
        data.overview.active_challenges.growth_percentage >= 0
          ? "text-emerald-600"
          : "text-red-600",
      thisWeek: `+${data.overview.active_challenges.new_this_week} this week`,
    },
    {
      title: "Active Quizzes",
      value: data.overview.active_quizzes.count.toString(),
      icon: BookOpen,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-600/10",
      change: `${
        data.overview.active_quizzes.growth_percentage > 0 ? "+" : ""
      }${data.overview.active_quizzes.growth_percentage}%`,
      changeColor:
        data.overview.active_quizzes.growth_percentage >= 0
          ? "text-emerald-600"
          : "text-red-600",
      thisWeek: `+${data.overview.active_quizzes.new_this_week} this week`,
    },
    {
      title: "Total Submissions",
      value: data.overview.total_submissions.count.toLocaleString(),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-600/10",
      change: `${
        data.overview.total_submissions.growth_percentage > 0 ? "+" : ""
      }${data.overview.total_submissions.growth_percentage}%`,
      changeColor:
        data.overview.total_submissions.growth_percentage >= 0
          ? "text-emerald-600"
          : "text-red-600",
      thisWeek: `+${data.overview.total_submissions.new_this_week} this week`,
    },
  ];

  // Get challenge icon based on difficulty
  const getChallengeIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return Star;
      case "medium":
        return Target;
      case "hard":
        return Zap;
      default:
        return Target;
    }
  };

  // Get challenge gradient based on difficulty
  const getChallengeGradient = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return {
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-50/50 to-emerald-50/50",
          borderColor: "border-green-200/50",
        };
      case "medium":
        return {
          gradient: "from-orange-500 to-yellow-600",
          bgGradient: "from-orange-50/50 to-yellow-50/50",
          borderColor: "border-orange-200/50",
        };
      case "hard":
        return {
          gradient: "from-red-500 to-pink-600",
          bgGradient: "from-red-50/50 to-pink-50/50",
          borderColor: "border-red-200/50",
        };
      default:
        return {
          gradient: "from-cyan-500 to-blue-600",
          bgGradient: "from-cyan-50/50 to-blue-50/50",
          borderColor: "border-cyan-200/50",
        };
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Header Section with sparkles and gradient text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            Admin Dashboard
            <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Manage your coding challenges and track student progress with style
          </p>
        </div>

        {/* Create Challenge Button - Featured with subtle hover */}
        <Card
          className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu hover:scale-[1.01] cursor-pointer group overflow-hidden"
          onClick={handleCreateChallenge}
        >
          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create New Challenge
                  </h2>
                  <p className="text-white/80 text-base">
                    Design and publish coding challenges for students
                  </p>
                </div>
              </div>
              <div className="text-right group-hover:translate-x-2 transition-transform duration-300">
                <div className="text-4xl font-bold mb-1">+</div>
                <div className="text-sm opacity-80">Click to start</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Refined animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}
                >
                  {stat.value}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-500" />
                    {stat.thisWeek}
                  </p>
                  <Badge
                    className={cn(
                      "font-semibold",
                      stat.changeColor,
                      stat.changeColor.includes("emerald")
                        ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 border-red-200 hover:bg-red-100",
                      "transition-colors duration-200 cursor-pointer"
                    )}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Challenges and Quizzes - Enhanced styling with tabs */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  {activeTab === "challenges" ? (
                    <Trophy className="w-6 h-6 text-white" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div>
                    Recent{" "}
                    {activeTab === "challenges" ? "Challenges" : "Quizzes"}
                  </div>
                  <div className="text-sm font-normal text-gray-600">
                    Manage your latest{" "}
                    {activeTab === "challenges"
                      ? "coding challenges"
                      : "quizzes"}
                  </div>
                </div>
              </CardTitle>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDrafts}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Drafts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewPublished}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  View Published
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === "challenges" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("challenges")}
                className={`rounded-lg font-medium transition-all duration-300 ${
                  activeTab === "challenges"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Challenges ({data.recent_challenges.length})
              </Button>
              <Button
                variant={activeTab === "quizzes" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("quizzes")}
                className={`rounded-lg font-medium transition-all duration-300 ${
                  activeTab === "quizzes"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Quizzes ({data.recent_quizzes.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {activeTab === "challenges" &&
                data.recent_challenges.map((challenge, index) => {
                  const challengeStyle = getChallengeGradient(
                    challenge.difficulty
                  );
                  const ChallengeIcon = getChallengeIcon(challenge.difficulty);

                  return (
                    <Card
                      key={challenge.id}
                      className={`bg-gradient-to-r ${challengeStyle.bgGradient} border ${challengeStyle.borderColor} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 bg-gradient-to-r ${challengeStyle.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                            >
                              <ChallengeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-cyan-700 transition-colors duration-200 mb-1">
                                {challenge.title}
                              </h3>
                              <div className="flex items-center gap-3">
                                <Badge
                                  className={`font-medium text-xs transition-colors ${
                                    challenge.difficulty === "easy"
                                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:text-emerald-800"
                                      : challenge.difficulty === "medium"
                                      ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 hover:text-orange-800"
                                      : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:text-red-800"
                                  }`}
                                >
                                  {challenge.difficulty
                                    .charAt(0)
                                    .toUpperCase() +
                                    challenge.difficulty.slice(1)}
                                </Badge>
                                <Badge
                                  className={`font-medium text-xs transition-colors ${
                                    challenge.status === "published"
                                      ? "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200 hover:text-cyan-800"
                                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800"
                                  }`}
                                >
                                  {challenge.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {challenge.status === "draft" && (
                              <Button
                                size="sm"
                                className={`bg-gradient-to-r ${challengeStyle.gradient} hover:shadow-lg text-white rounded-lg hover:scale-105 transition-all duration-300`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {activeTab === "quizzes" &&
                data.recent_quizzes.map((quiz, index) => (
                  <Card
                    key={quiz.id}
                    className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors duration-200 mb-1">
                              {quiz.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <Badge className="font-medium text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                                {quiz.total_questions} Questions
                              </Badge>
                              <Badge
                                className={`font-medium text-xs ${
                                  quiz.status === "published"
                                    ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {quiz.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quiz.status === "draft" && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg text-white rounded-lg hover:scale-105 transition-all duration-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
