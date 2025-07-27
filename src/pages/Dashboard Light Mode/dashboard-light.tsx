"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Coffee,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Menu,
  Play,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "../../useUser";

interface DashboardLightProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardLight({
  sidebarOpen,
  onToggleSidebar,
}: DashboardLightProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { firstName } = useUser();
  const recentFiles = [
    {
      name: "data_analysis.py",
      icon: BarChart3,
      time: "2 hours ago",
      size: "2.4 KB",
      language: "Python",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      name: "web_scraper.py",
      icon: Globe,
      time: "1 day ago",
      size: "5.1 KB",
      language: "Python",
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      name: "machine_learning.py",
      icon: Coffee,
      time: "3 days ago",
      size: "8.7 KB",
      language: "Python",
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      name: "api_client.py",
      icon: Zap,
      time: "1 week ago",
      size: "3.2 KB",
      language: "Python",
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
  ];

  const quickActions = [
    {
      title: "Create New File",
      description: "Start a new Python project",
      icon: FileText,
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      hoverGradient: "from-cyan-600 via-blue-600 to-indigo-700",
      action: () => window.locatio,
    },
    {
      title: "Start Challenge",
      description: "Practice with coding challenges",
      icon: Trophy,
      gradient: "from-purple-500 via-pink-500 to-rose-600",
      hoverGradient: "from-purple-600 via-pink-600 to-rose-700",
      action: () => (window.location.href = "/challenges"),
    },
    {
      title: "Take Quiz",
      description: "Test your Python knowledge",
      icon: GraduationCap,
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      hoverGradient: "from-green-600 via-emerald-600 to-teal-700",
      action: () => (window.location.href = "/quizzes"),
    },
  ];

  const learningPath = [
    {
      title: "Python Basics",
      status: "Complete",
      progress: 100,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-100 to-emerald-100",
      borderColor: "border-green-300",
    },
    {
      title: "Data Structures",
      status: "In Progress",
      progress: 65,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-gradient-to-r from-cyan-100 to-blue-100",
      borderColor: "border-cyan-300",
    },
    {
      title: "Algorithms",
      status: "Locked",
      progress: 0,
      icon: AlertCircle,
      color: "text-gray-500",
      bgColor: "bg-gradient-to-r from-gray-100 to-slate-100",
      borderColor: "border-gray-300",
    },
  ];

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-white/70 border-gray-300/50 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 flex items-center gap-2 px-3 py-1 shadow-md">
              <Activity className="w-3 h-3 animate-pulse" />
              ACTIVE
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Proper scrollable container */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent flex items-center gap-3">
            Welcome back, {firstName}
            <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Continue your Python journey with IsiPython IDE
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                Challenges Completed
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                47
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full shadow-sm animate-pulse"
                    style={{ width: "78%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    +3 this week
                  </p>
                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
                    78%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                Quizzes Attempted
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                23
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full shadow-sm animate-pulse"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Average: 87%
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    65%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                Overall Progress
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                92%
              </div>
              <div className="space-y-3 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full shadow-sm animate-pulse"
                    style={{ width: "92%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-500" />
                    Excellent!
                  </p>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    92%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Files */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Recent Files
            </CardTitle>
            <Button
              variant="ghost"
              className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-medium"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentFiles.map((file, index) => (
                <Card
                  key={index}
                  className={`bg-gradient-to-br ${file.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${file.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <file.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <p className="text-xs text-gray-600">{file.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-700 mb-4">
                      <Badge className="bg-white/80 text-gray-700 border-gray-300">
                        {file.language}
                      </Badge>
                      <span className="font-medium">{file.size}</span>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${file.gradient} hover:shadow-md text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Quick Actions
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

          {/* Learning Path */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningPath.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl ${item.bgColor} border ${item.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-white/80 rounded-lg shadow-sm`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-600">{item.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.progress > 0 && (
                      <div className="w-24">
                        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === "Complete"
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
                        item.status === "Complete"
                          ? "bg-green-500 text-white border-0 shadow-sm"
                          : item.status === "In Progress"
                          ? "bg-cyan-500 text-white border-0 shadow-sm"
                          : "bg-gray-400 text-white border-0 shadow-sm"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
