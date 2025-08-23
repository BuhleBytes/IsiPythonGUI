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
  Activity,
  AlertCircle,
  ChevronRight,
  Clock,
  Flame,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserChallenges } from "../../useUserChallenges"; // Import the new hook

export function ChallengesLight() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const navigate = useNavigate();
  const handleStartChallenge = (challengeId: string) => {
    navigate(`/challenge/${challengeId}`);
  };

  // Use the custom hook for challenge operations
  const {
    challenges,
    stats,
    loading,
    statsLoading,
    error,
    refreshChallenges,
    getFilteredChallenges,
    getAvailableCategories,
  } = useUserChallenges();

  // Get available categories dynamically
  const categories = getAvailableCategories();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0";
      case "Medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0";
      case "High":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white border-0";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0";
    }
  };

  const getPassRate = (passed: number, total: number) => {
    return Math.round((passed / total) * 100);
  };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 70) return "from-green-400 to-emerald-500";
    if (passRate >= 40) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  // Get filtered challenges
  const filteredChallenges = getFilteredChallenges(
    searchTerm,
    selectedCategory,
    selectedDifficulty
  );

  // Calculate stats from real data
  const completedChallenges = stats?.completedChallenges || 0;
  const totalPoints = stats?.totalPointsEarned || 0;
  const successRate = stats?.successRate || 0;
  const globalRank = stats?.userGlobalRank || 0;

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-cyan-500" />
              {t("Coding Challenges")}
            </h1>
            <p className="text-gray-600">
              {t("Test your Python skills with our curated challenges")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={refreshChallenges}
              className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-medium transition-all duration-300 hover:scale-105"
              disabled={loading || statsLoading}
            >
              {loading || statsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {t("Refresh")}
            </Button>
            <div className="flex items-center gap-2 text-cyan-600">
              <Flame className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {t("CHALLENGE MODE")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Now using real data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      completedChallenges
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Completed")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      Math.round(totalPoints)
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Points Earned")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `${Math.round(successRate)}%`
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Success Rate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : globalRank && globalRank > 0 ? (
                      `#${globalRank}` // Shows: #1, #73, etc.
                    ) : (
                      "∞" // Shows: ∞ for null/unranked users
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{t("Global Rank")}</p>
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
              placeholder={t("Search challenges...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
              <SelectValue placeholder={t("All")} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-gray-900 hover:bg-cyan-50"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
          >
            <SelectTrigger className="w-32 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
              <SelectValue placeholder={t("All")} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
              <SelectItem
                value="All"
                className="text-gray-900 hover:bg-cyan-50"
              >
                All
              </SelectItem>
              <SelectItem
                value="Low"
                className="text-gray-900 hover:bg-green-50"
              >
                Low
              </SelectItem>
              <SelectItem
                value="Medium"
                className="text-gray-900 hover:bg-yellow-50"
              >
                Medium
              </SelectItem>
              <SelectItem
                value="High"
                className="text-gray-900 hover:bg-red-50"
              >
                High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <span className="ml-3 text-gray-600">
              {t("Loading challenges...")}
            </span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("Error loading challenges")}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={refreshChallenges}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("Try Again")}
            </Button>
          </div>
        ) : (
          /* Challenges Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => {
              const IconComponent = challenge.icon;
              const passRate = getPassRate(
                challenge.passedStudents,
                challenge.totalAttempts
              );

              return (
                <Card
                  key={challenge.id}
                  className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-r ${challenge.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              challenge.iconColor || "text-white drop-shadow-sm"
                            }`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            {challenge.title}
                          </CardTitle>
                          <p className="text-xs text-gray-600">
                            {challenge.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {challenge.isCompleted && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t("Complete")}
                          </Badge>
                        )}
                        {challenge.isInProgress && !challenge.isCompleted && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white border-0 shadow-md">
                            <Activity className="w-3 h-3 mr-1" />
                            {t("In Progress")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                      {challenge.description}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={
                          getDifficultyColor(challenge.difficulty) +
                          " shadow-md"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md">
                        {challenge.points} pts
                      </Badge>
                      {/* Show best score badge for in-progress challenges */}
                      {challenge.isInProgress &&
                        !challenge.isCompleted &&
                        challenge.userBestScore > 0 && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white border-0 shadow-md">
                            <Star className="w-3 h-3 mr-1" />
                            {challenge.userBestScore}/{challenge.points} pts
                          </Badge>
                        )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {challenge.passedStudents.toLocaleString()} passed
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Pass Rate</span>
                        <span className="font-medium text-gray-800">
                          {passRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getPassRateColor(
                            passRate
                          )} shadow-sm`}
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {challenge.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/60 text-gray-700 border-gray-300/50 hover:bg-white/80 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleStartChallenge(challenge.id)}
                      className={`w-full ${
                        challenge.isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                      } border-0 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {challenge.isCompleted ? (
                          <>
                            <Activity className="w-4 h-4" />
                            {t("Review Solution")}
                          </>
                        ) : challenge.isInProgress ? (
                          <>
                            <Zap className="w-4 h-4" />
                            {t("Continue Challenge")}
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            {t("Start Challenge")}
                          </>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("No challenges found")}
            </h3>
            <p className="text-gray-600">
              {challenges.length === 0
                ? t("No challenges available at the moment")
                : t("Try adjusting your search or filter criteria")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
