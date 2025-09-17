import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// API Hooks
const BASE_URL = "https://isipython-dev.onrender.com";

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

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all-time");

  // Use API hooks instead of static data
  const challengesData = useChallengesLeaderboard();
  const quizzesData = useQuizzesLeaderboard();

  // Get current data based on active tab
  const currentData = activeTab === "challenges" ? challengesData : quizzesData;
  const quizData = quizzesData.data;
  const challengeData = challengesData.data;
  const loading = currentData.loading;

  const filteredData = currentData.data.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "👑";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white border-0";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRefresh = () => {
    challengesData.refetch();
    quizzesData.refetch();
  };

  // Show error state if there's an error
  if (currentData.error) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-lg p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("Failed to load leaderboard")}
            </h3>
            <p className="text-gray-600 mb-4">{currentData.error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
            >
              {t("Try Again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <span className="text-white text-2xl">🏆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {t("Leaderboard")}
              </h1>
              <p className="text-gray-600">
                {t("See how you rank among fellow learners")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 rounded-lg disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-lg">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  className={`rounded-lg px-6 py-2 transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "challenges"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-600 hover:to-blue-700"
                      : "text-gray-700 hover:bg-white/80"
                  }`}
                  onClick={() => setActiveTab("challenges")}
                >
                  <span>⚡</span>
                  {t("Challenges")}
                </button>
                <button
                  className={`rounded-lg px-6 py-2 transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "quizzes"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-600 hover:to-blue-700"
                      : "text-gray-700 hover:bg-white/80"
                  }`}
                  onClick={() => setActiveTab("quizzes")}
                >
                  <span>🎯</span>
                  {t("Quizzes")}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    placeholder={t("Search learners...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white/70 border border-gray-300/50 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all"
                  />
                </div>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full sm:w-40 bg-white/70 border border-gray-300/50 rounded-lg px-3 py-2 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none"
                >
                  <option value="all-time">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="this-week">This Week</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-700">
                {t("Total Participants")}
              </h3>
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
            <div className="px-6 pb-6 relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                {currentData.data.length}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <span className="text-green-500">📈</span>
                {t("Active learners")}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-700">
                {activeTab === "challenges"
                  ? t("Avg Score")
                  : t("Avg Performance")}
              </h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
            <div className="px-6 pb-6 relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {activeTab === "challenges"
                  ? Math.round(
                      challengeData.reduce(
                        (sum, user) => sum + user.total_score,
                        0
                      ) / challengeData.length || 0
                    )
                  : Math.round(
                      quizData.reduce(
                        (sum, user) => sum + user.average_percentage,
                        0
                      ) / quizData.length || 0
                    ) + "%"}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <span className="text-orange-500">🔥</span>
                {t("Community average")}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-700">
                {t("Top Performer")}
              </h3>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
                <span className="text-white text-xl">⭐</span>
              </div>
            </div>
            <div className="px-6 pb-6 relative z-10">
              <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                {filteredData[0]?.full_name || "No data"}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <span className="text-yellow-500">👑</span>
                {t("Leading the pack")}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-lg">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-yellow-500 text-2xl">🏆</span>
              {activeTab === "challenges" ? t("Challenge Leaderboard") : t("Quiz Leaderboard")}{" "}
            </h2>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t("Loading leaderboard...")}</p>
                </div>
              </div>
            ) : currentData.error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Failed to load data")}
                </h3>
                <p className="text-gray-600 mb-4">{currentData.error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
                >
                  {t("Try Again")}
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-6">
                {filteredData.map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-102 hover:shadow-md ${
                      user.rank <= 3
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50"
                        : "bg-gray-50/50 border border-gray-200/50 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getRankIcon(user.rank)}</div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(
                            user.rank
                          )}`}
                        >
                          #{user.rank}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">
                          {user.full_name}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {activeTab === "challenges" ? (
                            <>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="text-cyan-500">⚡</span>
                                {user.challenges_completed} {t("challenges")}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="text-yellow-500">⭐</span>
                                {user.total_score} {t("points")}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="text-green-500">🎯</span>
                                {user.quizzes_completed} {t("quizzes")}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="text-blue-500">📈</span>
                                {user.average_percentage.toFixed(1)}% avg
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>📅</span>
                            {formatDate(user.last_completion)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                        {activeTab === "challenges"
                          ? user.total_score
                          : `${user.average_percentage.toFixed(1)}%`}
                      </div>
                      <p className="text-xs text-gray-500">
                        {activeTab === "challenges"
                          ? t("Total Score")
                          : t("Average")}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredData.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No learners found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? t("Try adjusting your search terms")
                        : t(
                            "Be the first to complete some challenges or quizzes!"
                          )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-lg">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white flex items-center gap-2 text-lg font-bold">
                <span>👑</span>
                {t("Top Performer")}
              </h3>
            </div>
            <div className="p-6">
              {filteredData[0] && (
                <div className="space-y-2">
                  <div className="text-xl font-bold">
                    {filteredData[0].full_name}
                  </div>
                  <div className="text-white/90 text-sm">
                    {activeTab === "challenges"
                      ? `${filteredData[0].total_score} ${t("points from")} ${filteredData[0].challenges_completed} ${t("challenges")}`
                      : `${filteredData[0].average_percentage.toFixed(
                          1
                        )}% ${t("average from")} ${
                          filteredData[0].quizzes_completed
                        } ${t("quizzes")}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-lg">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white flex items-center gap-2 text-lg font-bold">
                <span>📈</span>
                {t("Most Active")}
              </h3>
            </div>
            <div className="p-6">
              {(() => {
                const mostActive =
                  activeTab === "challenges"
                    ? [...challengeData].sort(
                        (a, b) =>
                          b.challenges_completed - a.challenges_completed
                      )[0]
                    : [...quizData].sort(
                        (a, b) => b.quizzes_completed - a.quizzes_completed
                      )[0];

                return (
                  mostActive && (
                    <div className="space-y-2">
                      <div className="text-xl font-bold">
                        {mostActive.full_name}
                      </div>
                      <div className="text-white/90 text-sm">
                        {activeTab === "challenges"
                          ? `${mostActive.challenges_completed} ${t("challenges completed")}`
                          : `${mostActive.quizzes_completed} ${t("quizzes taken")}`}
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
