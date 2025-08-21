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
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuizzes } from "../../useQuizzes"; // Import the new hook

export function QuizzesLight() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const navigate = useNavigate();

  // Use the new custom hook
  const {
    quizzes,
    stats,
    loading,
    statsLoading,
    error,
    refreshQuizzes,
    getFilteredQuizzes,
    getAvailableCategories,
  } = useQuizzes();

  // Get available categories dynamically
  const categories = getAvailableCategories();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-400/30";
      case "Medium":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg shadow-yellow-400/30";
      case "High":
        return "bg-gradient-to-r from-red-400 to-pink-500 text-white border-0 shadow-lg shadow-red-400/30";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg shadow-gray-400/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-400/30";
      case "available":
        return "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 shadow-lg shadow-cyan-400/30";
      case "overdue":
        return "bg-gradient-to-r from-red-400 to-pink-500 text-white border-0 shadow-lg shadow-red-400/30";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg shadow-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "available":
        return <Timer className="w-3 h-3" />;
      case "overdue":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get filtered quizzes using the hook
  const filteredQuizzes = getFilteredQuizzes(
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy
  );

  const handleQuizNavigation = (quizId: string, status: string) => {
    // All published quizzes should be accessible
    navigate(`/quiz-light/${quizId}`);
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Quizzes
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={refreshQuizzes}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-3000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/20 backdrop-blur-xl bg-white/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              {t("IsiPython Quizzes")}
            </h1>
            <p className="text-gray-600">
              {t("Test your isiPython knowledge with interactive quizzes")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">{t("QUIZ MODE")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshQuizzes}
              disabled={loading}
              className="text-white hover:bg-white/20 transition-colors"
              title="Refresh quizzes"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      stats.completedQuizzes
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Completed")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `${stats.averageScore}%`
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Average Score")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `${stats.totalPointsEarned}/${stats.totalPointsPossible}`
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Total Points")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `#${stats.userGlobalRank}`
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Class Rank")}</p>
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
              placeholder={t("Search quizzes...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/20 backdrop-blur-xl border-white/30 text-gray-900 placeholder-gray-500 shadow-lg"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-white/20 backdrop-blur-xl border-white/30 text-gray-900 shadow-lg">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 bg-white/20 backdrop-blur-xl border-white/30 text-gray-900 shadow-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="available">{t("Available")}</SelectItem>
              <SelectItem value="completed">{t("Completed")}</SelectItem>
              <SelectItem value="overdue">{t("Overdue")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-white/20 backdrop-blur-xl border-white/30 text-gray-900 shadow-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
              <SelectItem value="dueDate">{t("Due Date")}</SelectItem>
              <SelectItem value="datePosted">{t("Date Posted")}</SelectItem>
              <SelectItem value="totalMarks">{t("Total Marks")}</SelectItem>
              <SelectItem value="progress">{t("Progress")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="relative z-10 flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Quizzes
              </h3>
              <p className="text-gray-600">Fetching your quiz data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => {
              const IconComponent = quiz.icon;
              const daysUntilDue = getDaysUntilDue(quiz.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

              return (
                <Card
                  key={quiz.id}
                  className={`bg-white/20 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                    quiz.status === "completed"
                      ? "ring-2 ring-green-400/50"
                      : ""
                  } ${isOverdue ? "ring-2 ring-red-400/50" : ""} ${
                    isDueSoon ? "ring-2 ring-yellow-400/50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
                            quiz.status === "completed"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500"
                              : "bg-gradient-to-r from-cyan-400 to-blue-500"
                          }`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            {quiz.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {quiz.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(quiz.status)}>
                          {getStatusIcon(quiz.status)}
                          <span className="ml-1 capitalize">{quiz.status}</span>
                        </Badge>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700">{quiz.description}</p>

                    {/* Quiz Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/30 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-cyan-600" />
                          <span className="text-xs text-gray-600">
                            {t("Total Marks")}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          /{quiz.totalMarks}
                        </p>
                      </div>

                      <div className="bg-white/30 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-gray-600">
                            {t("Posted")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(quiz.datePosted)}
                        </p>
                      </div>

                      <div className="bg-white/30 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock
                            className={`w-4 h-4 ${
                              isOverdue
                                ? "text-red-600"
                                : isDueSoon
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          />
                          <span className="text-xs text-gray-600">
                            {t("Due Date")}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            isOverdue
                              ? "text-red-600"
                              : isDueSoon
                              ? "text-yellow-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDate(quiz.dueDate)}
                        </p>
                        {isOverdue && (
                          <p className="text-xs text-red-600">{t("Overdue")}</p>
                        )}
                        {isDueSoon && !isOverdue && (
                          <p className="text-xs text-yellow-600">
                            {t("Due soon")}
                          </p>
                        )}
                      </div>

                      <div className="bg-white/30 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-gray-600">
                            {t("Duration")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {quiz.duration}
                        </p>
                        <p className="text-xs text-gray-600">
                          {quiz.questions} {t("questions")}
                        </p>
                      </div>
                    </div>

                    {/* Class Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {t("Class Progress")}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {quiz.completedStudents}/{quiz.totalStudents} (
                          {quiz.classProgress}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2 backdrop-blur-xl shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${quiz.classProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* User Score (if completed) */}
                    {quiz.status === "completed" && quiz.userScore !== null && (
                      <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-lg p-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 font-medium">
                            {t("Your Score")}
                          </span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-700">
                              {quiz.userScore}/{quiz.totalMarks}
                            </span>
                            <p className="text-xs text-green-600">
                              {Math.round(
                                (quiz.userScore / quiz.totalMarks) * 100
                              )}
                              % • {quiz.attempts} {t("attempts")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/20 backdrop-blur-xl text-gray-700 border-white/30 shadow-lg"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full shadow-lg transition-all duration-300 hover:scale-105 ${
                        quiz.status === "completed"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-green-400/30"
                          : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-cyan-400/30"
                      }`}
                      onClick={() => handleQuizNavigation(quiz.id, quiz.status)}
                    >
                      {quiz.status === "completed"
                        ? t("Review Quiz")
                        : t("Start Quiz")}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("No quizzes found")}
            </h3>
            <p className="text-gray-600">
              {quizzes.length === 0
                ? t("No quizzes are available yet")
                : t("Try adjusting your search or filter criteria")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
