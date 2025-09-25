/**
 * AdminLeaderboard Component
 *
 * This component displays a comprehensive leaderboard system for both coding challenges
 * and quizzes within the admin dashboard. It serves as a competitive ranking system
 * that motivates students and provides administrators with insights into student performance.
 *
 * Key Features:
 * - Dual leaderboards: Separate rankings for coding challenges and quizzes
 * - Podium display: Visual podium for top 3 performers with gold/silver/bronze styling
 * - Real-time data: Live fetching from API endpoints with loading and error states
 * - Search functionality: Filter students by name with instant results
 * - Statistics dashboard: Overview metrics including total participants, averages, and activity
 * - Responsive design: Works across desktop, tablet, and mobile devices
 * - Animated interactions: Hover effects, scaling animations, and visual feedback
 * - Glassmorphism UI: Modern backdrop blur effects and transparency layers
 *
 * @component AdminLeaderboard
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Crown,
  Filter,
  Loader2,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// API Configuration
const BASE_URL = "https://isipython-dev.onrender.com";

/**
 * Custom hook for fetching challenges leaderboard data
 * Handles loading states, error management, and data refresh functionality
 * Returns formatted leaderboard data with user rankings and statistics
 */
const useChallengesLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallengesLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/challenges/leaderboard`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data?.leaderboard || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching challenges leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesLeaderboard();
  }, []);

  const refetch = () => {
    fetchChallengesLeaderboard();
  };

  return { data, loading, error, refetch };
};

/**
 * Custom hook for fetching quizzes leaderboard data
 * Similar to challenges hook but tailored for quiz-specific metrics
 * Handles percentage-based scoring and quiz completion tracking
 */
const useQuizzesLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzesLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/quizzes/leaderboard`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data?.leaderboard || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching quizzes leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesLeaderboard();
  }, []);

  const refetch = () => {
    fetchQuizzesLeaderboard();
  };

  return { data, loading, error, refetch };
};

export default function LeaderboardPage() {
  // Component state management
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all-time");

  // Data fetching hooks
  const challengesData = useChallengesLeaderboard();
  const quizzesData = useQuizzesLeaderboard();

  // Current active data based on selected tab
  const currentData = activeTab === "challenges" ? challengesData : quizzesData;
  const quizData = quizzesData.data;
  const challengeData = challengesData.data;
  const loading = currentData.loading;

  // Search filtering - filters users by name with case-insensitive matching
  const filteredData = currentData.data.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split data for podium display (top 3) and regular list (rest)
  const topThree = filteredData.slice(0, 3);
  const restOfUsers = filteredData.slice(3);

  /**
   * Formats date strings into readable format
   * Handles null/undefined dates gracefully
   */
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No activity";
  };

  /**
   * Handles refresh action for both leaderboards
   * Triggers data refetch for current view
   */
  const handleRefresh = () => {
    challengesData.refetch();
    quizzesData.refetch();
  };

  /**
   * Returns appropriate height class for podium ranks
   * Creates visual hierarchy for top 3 positions
   */
  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1:
        return "h-32";
      case 2:
        return "h-24";
      case 3:
        return "h-20";
      default:
        return "h-16";
    }
  };

  /**
   * Returns gradient classes for podium styling
   * Gold for 1st, silver for 2nd, bronze for 3rd
   */
  const getPodiumGradient = (rank) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 via-yellow-500 to-amber-600";
      case 2:
        return "from-gray-300 via-gray-400 to-gray-500";
      case 3:
        return "from-amber-400 via-amber-500 to-orange-600";
      default:
        return "from-gray-200 to-gray-300";
    }
  };

  // Error state display with retry functionality
  if (currentData.error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to load leaderboard
              </h3>
              <p className="text-gray-600 mb-4">{currentData.error}</p>
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden flex flex-col">
      {/* Animated Background Elements - Matching Dashboard Style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        {/* Header Section - Matching Dashboard Typography */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 rounded-full mb-6 shadow-2xl shadow-purple-200/50 group hover:scale-110 hover:rotate-6 transition-all duration-300">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
              LEADERBOARD
              <Sparkles className="w-10 h-10 text-cyan-500 animate-pulse" />
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Track student progress and celebrate achievements with our
              comprehensive ranking system
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-white/80 backdrop-blur-sm rounded-full px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard - Updated with Dashboard Icons and Styling */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
                {currentData.data.length}
              </div>
              <div className="text-gray-600 font-medium">Total Champions</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {activeTab === "challenges"
                  ? Math.round(
                      challengeData.length > 0
                        ? challengeData.reduce(
                            (sum, user) => sum + (user.total_score || 0),
                            0
                          ) / challengeData.length
                        : 0
                    )
                  : Math.round(
                      quizData.length > 0
                        ? quizData.reduce(
                            (sum, user) => sum + (user.average_percentage || 0),
                            0
                          ) / quizData.length
                        : 0
                    ) + "%"}
              </div>
              <div className="text-gray-600 font-medium">Average Score</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                {activeTab === "challenges"
                  ? challengeData.reduce(
                      (sum, user) => sum + (user.challenges_completed || 0),
                      0
                    )
                  : quizData.reduce(
                      (sum, user) => sum + (user.quizzes_completed || 0),
                      0
                    )}
              </div>
              <div className="text-gray-600 font-medium">Total Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
                {filteredData.length > 0 ? (
                  <Star className="w-8 h-8 text-orange-500 inline" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full inline-block"></div>
                )}
              </div>
              <div className="text-gray-600 font-medium">Competition Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation - Updated with Dashboard Styling */}
        <div className="flex justify-center mb-12">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-0 gap-2">
                <TabsTrigger
                  value="challenges"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-cyan-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Challenges Arena
                </TabsTrigger>
                <TabsTrigger
                  value="quizzes"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-purple-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Quiz Masters
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>

        {/* Search and Filters - Updated Styling */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for champions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-14 text-lg backdrop-blur-sm shadow-sm transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="bg-white/80 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none backdrop-blur-sm shadow-sm transition-all duration-200"
                  >
                    <option value="all-time">All Time</option>
                    <option value="this-month">This Month</option>
                    <option value="this-week">This Week</option>
                  </select>
                  <Button className="bg-white/80 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl px-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                    <Filter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 font-semibold">
                Loading champions...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Podium for Top 3 - Enhanced with Dashboard Animations */}
            {topThree.length > 0 && (
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                    <Trophy className="w-12 h-12 text-cyan-500" />
                    HALL OF FAME
                    <Trophy className="w-12 h-12 text-cyan-500" />
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <span className="font-medium">The Elite Champions</span>
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>
                <div className="flex justify-center items-end gap-8 max-w-4xl mx-auto">
                  {/* Second Place */}
                  {topThree[1] && (
                    <div className="text-center transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-gray-300/50 border-4 border-white group-hover:scale-110 transition-transform duration-300">
                          <Medal className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          2
                        </div>
                      </div>
                      <div
                        className={cn(
                          "bg-gradient-to-t",
                          getPodiumGradient(2),
                          getPodiumHeight(2),
                          "rounded-t-2xl shadow-2xl shadow-gray-300/30 mb-4 flex items-end justify-center pb-4"
                        )}
                      >
                        <div className="text-white font-bold text-lg">
                          SILVER
                        </div>
                      </div>
                      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardContent className="p-4">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {topThree[1].full_name}
                          </h3>
                          <div className="text-2xl font-black bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-2">
                            {activeTab === "challenges"
                              ? `${topThree[1].total_score || 0} pts`
                              : `${(
                                  topThree[1].average_percentage || 0
                                ).toFixed(1)}%`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activeTab === "challenges"
                              ? `${
                                  topThree[1].challenges_completed || 0
                                } challenges`
                              : `${topThree[1].quizzes_completed || 0} quizzes`}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* First Place */}
                  {topThree[0] && (
                    <div className="text-center transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-300/50 border-4 border-white group-hover:scale-110 transition-transform duration-300">
                          <Crown className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full animate-pulse opacity-20"></div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full animate-ping opacity-10"></div>
                      </div>
                      <div
                        className={cn(
                          "bg-gradient-to-t",
                          getPodiumGradient(1),
                          getPodiumHeight(1),
                          "rounded-t-2xl shadow-2xl shadow-yellow-300/40 mb-4 flex items-end justify-center pb-4"
                        )}
                      >
                        <div className="text-white font-bold text-xl">
                          CHAMPION
                        </div>
                      </div>
                      <Card className="bg-white/90 backdrop-blur-xl border-2 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-bold text-gray-900 text-xl">
                              {topThree[0].full_name}
                            </h3>
                            <Star className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent mb-3">
                            {activeTab === "challenges"
                              ? `${topThree[0].total_score || 0} pts`
                              : `${(
                                  topThree[0].average_percentage || 0
                                ).toFixed(1)}%`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activeTab === "challenges"
                              ? `${
                                  topThree[0].challenges_completed || 0
                                } challenges`
                              : `${topThree[0].quizzes_completed || 0} quizzes`}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Third Place */}
                  {topThree[2] && (
                    <div className="text-center transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-amber-300/50 border-4 border-white group-hover:scale-110 transition-transform duration-300">
                          <Medal className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          3
                        </div>
                      </div>
                      <div
                        className={cn(
                          "bg-gradient-to-t",
                          getPodiumGradient(3),
                          getPodiumHeight(3),
                          "rounded-t-2xl shadow-2xl shadow-amber-300/30 mb-4 flex items-end justify-center pb-4"
                        )}
                      >
                        <div className="text-white font-bold text-lg">
                          BRONZE
                        </div>
                      </div>
                      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardContent className="p-4">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {topThree[2].full_name}
                          </h3>
                          <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent mb-2">
                            {activeTab === "challenges"
                              ? `${topThree[2].total_score || 0} pts`
                              : `${(
                                  topThree[2].average_percentage || 0
                                ).toFixed(1)}%`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activeTab === "challenges"
                              ? `${
                                  topThree[2].challenges_completed || 0
                                } challenges`
                              : `${topThree[2].quizzes_completed || 0} quizzes`}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rest of the Leaderboard - Updated with Dashboard Styling */}
            {restOfUsers.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Rising Stars
                  </h2>
                  <p className="text-gray-600 font-medium">
                    The next generation of champions
                  </p>
                </div>
                <div className="space-y-4">
                  {restOfUsers.map((user, index) => (
                    <Card
                      key={user.user_id}
                      className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                #{user.rank}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-cyan-700 transition-colors duration-200">
                                  {user.full_name || "Unknown User"}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4 text-emerald-500" />
                                    {activeTab === "challenges"
                                      ? `${
                                          user.challenges_completed || 0
                                        } challenges`
                                      : `${
                                          user.quizzes_completed || 0
                                        } quizzes`}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-cyan-500" />
                                    {formatDate(user.last_completion)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                              {activeTab === "challenges"
                                ? `${user.total_score || 0}`
                                : `${(user.average_percentage || 0).toFixed(
                                    1
                                  )}%`}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {activeTab === "challenges"
                                ? "Total Points"
                                : "Average Score"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State - Enhanced with Dashboard Icons */}
            {filteredData.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  No Champions Yet
                </h3>
                <p className="text-xl text-gray-600 max-w-md mx-auto">
                  {searchQuery
                    ? "No champions match your search. Try different terms."
                    : "Be the first to rise to greatness!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
