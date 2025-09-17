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
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileQuestion,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shuffle,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useDraftQuizzes } from "../useDraftQuizzes";

interface DraftQuiz {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  createdAt: string;
  lastModified: string;
  allowMultipleAttempts: boolean;
  sendNotifications: boolean;
  showResultsImmediately: boolean;
  randomizeQuestions: boolean;
  instructions: string[];
}

interface DraftQuizzesProps {
  onEditQuiz?: (quizId: string) => void;
  onCreateNew?: () => void;
}

export default function DraftQuizzes({
  onEditQuiz,
  onCreateNew,
}: DraftQuizzesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Uses custom hook to fetch quizzes saved as drafts
  const { draftQuizzes, loading, error, deletingIds, refetch, deleteQuiz } =
    useDraftQuizzes();

  // Get quiz icon and styling based on time limit
  const getQuizStyle = (timeLimit: number) => {
    if (timeLimit <= 20) {
      return {
        icon: Target,
        gradient: "from-green-500 to-emerald-600",
        bgGradient: "from-green-50/50 to-emerald-50/50",
        borderColor: "border-green-200/50",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        label: "Quick",
      };
    } else if (timeLimit <= 45) {
      return {
        icon: Clock,
        gradient: "from-blue-500 to-cyan-600",
        bgGradient: "from-blue-50/50 to-cyan-50/50",
        borderColor: "border-blue-200/50",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Standard",
      };
    } else {
      return {
        icon: AlertCircle,
        gradient: "from-purple-500 to-indigo-600",
        bgGradient: "from-purple-50/50 to-indigo-50/50",
        borderColor: "border-purple-200/50",
        badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
        label: "Extended",
      };
    }
  };

  // Get feature badge styling
  const getFeatureBadge = (index: number) => {
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    ];
    return colors[index % colors.length];
  };

  // Filter and sort quizzes
  const filteredQuizzes = draftQuizzes
    .filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "quick" && quiz.timeLimit <= 20) ||
        (timeFilter === "standard" &&
          quiz.timeLimit > 20 &&
          quiz.timeLimit <= 45) ||
        (timeFilter === "extended" && quiz.timeLimit > 45);

      return matchesSearch && matchesTime;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "time":
          return a.timeLimit - b.timeLimit;
        case "points":
          return b.totalPoints - a.totalPoints;
        case "questions":
          return b.totalQuestions - a.totalQuestions;
        default:
          return 0;
      }
    });

  const handleEditQuiz = (quiz: DraftQuiz) => {
    if (onEditQuiz) {
      onEditQuiz(quiz.id);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  // Handle delete quiz with confirmation
  const handleDeleteQuiz = async (quiz: DraftQuiz, event: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering card click events
    event.stopPropagation();

    const confirmMessage = `Are you sure you want to delete "${quiz.title}"?\n\nThis action cannot be undone and will permanently remove the draft quiz from your account.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }
    const success = await deleteQuiz(quiz.id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Loading Draft Quizzes...
          </div>
          <div className="text-sm text-gray-500">
            Fetching your latest drafts
          </div>
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
            {error.includes("delete")
              ? "Delete Error"
              : "Failed to Load Draft Quizzes"}
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

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            Draft Quizzes
            <FileQuestion className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Manage and edit your quiz drafts before publishing
          </p>
        </div>

        {/* Create New Quiz Button */}
        <Card
          className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu hover:scale-[1.01] cursor-pointer group overflow-hidden"
          onClick={handleCreateNew}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create New Quiz
                  </h2>
                  <p className="text-white/80 text-base">
                    Start drafting a new quiz assessment
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

        {/* Filters and Search */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-t-xl relative z-10">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                <Search className="w-5 h-5 text-white" />
              </div>
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Search Quizzes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Time Limit
                </label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    <SelectItem value="all">All Time Limits</SelectItem>
                    <SelectItem value="quick">Quick (≤20 min)</SelectItem>
                    <SelectItem value="standard">
                      Standard (21-45 min)
                    </SelectItem>
                    <SelectItem value="extended">
                      Extended (&gt;45 min)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    <SelectItem value="recent">Recently Modified</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="time">Time Limit</SelectItem>
                    <SelectItem value="points">Total Points</SelectItem>
                    <SelectItem value="questions">Question Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Total Drafts
                </label>
                <div className="h-10 px-3 py-2 bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200/50 rounded-md flex items-center">
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    {filteredQuizzes.length}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">quizzes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Draft Quizzes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuizzes.map((quiz) => {
            const style = getQuizStyle(quiz.timeLimit);
            const IconComponent = style.icon;
            const isDeleting = deletingIds.has(quiz.id);

            // Get quiz features for display
            const features = [];
            if (quiz.allowMultipleAttempts)
              features.push({ icon: RotateCcw, text: "Multiple attempts" });
            if (quiz.randomizeQuestions)
              features.push({ icon: Shuffle, text: "Randomized" });
            if (quiz.showResultsImmediately)
              features.push({ icon: CheckCircle2, text: "Instant results" });
            if (quiz.sendNotifications)
              features.push({ icon: Bell, text: "Notifications" });

            return (
              <Card
                key={quiz.id}
                className={`bg-gradient-to-r ${style.bgGradient} border ${
                  style.borderColor
                } shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group cursor-pointer ${
                  isDeleting ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Deletion overlay */}
                {isDeleting && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="font-medium">Deleting quiz...</span>
                    </div>
                  </div>
                )}

                <CardHeader className="border-b border-gray-200/30 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${style.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200 mb-2">
                          {quiz.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`font-medium text-xs ${style.badgeColor} hover:scale-105 transition-transform duration-200`}
                          >
                            {style.label}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 hover:text-purple-800 font-medium text-xs hover:scale-105 transition-all duration-200">
                            Draft
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 relative z-10">
                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {quiz.totalPoints} points
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {quiz.timeLimit} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileQuestion className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {quiz.totalQuestions} questions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Due: {new Date(quiz.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Modified:{" "}
                        {new Date(quiz.lastModified).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Quiz Features */}
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {features.slice(0, 3).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`text-xs transition-all duration-200 hover:scale-105 ${getFeatureBadge(
                              index
                            )} flex items-center gap-1`}
                          >
                            <feature.icon className="w-3 h-3" />
                            {feature.text}
                          </Badge>
                        ))}
                        {features.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                          >
                            +{features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleEditQuiz(quiz)}
                        className={`flex-1 bg-gradient-to-r ${style.gradient} hover:shadow-lg text-white rounded-lg hover:scale-105 transition-all duration-300 font-medium`}
                        disabled={isDeleting}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm"
                        disabled={isDeleting}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteQuiz(quiz, e)}
                        className="border-red-200 text-red-700 hover:bg-red-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm disabled:opacity-50"
                        disabled={isDeleting}
                        title="Delete this draft quiz"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl relative overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <FileQuestion className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Draft Quizzes Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || timeFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "You haven't created any draft quizzes yet. Start by creating your first quiz!"}
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
