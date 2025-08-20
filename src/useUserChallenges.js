import {
  Activity,
  Brain,
  Clock,
  Code,
  Database,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing user challenges and stats
 * @returns {Object} - Object containing challenges state and challenge operations
 */
export const useUserChallenges = () => {
  const { userId, isLoggedIn } = useUser();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Predefined icons and gradients for different categories/difficulties
  const challengeStyles = [
    {
      icon: Code,
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      icon: Target,
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: Zap,
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      icon: Database,
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: Shield,
      gradient: "from-indigo-400 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
    {
      icon: Brain,
      gradient: "from-red-400 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
    },
    {
      icon: Activity,
      gradient: "from-teal-400 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
    },
    {
      icon: Clock,
      gradient: "from-rose-400 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
    },
  ];

  // Helper function to check if userId is valid
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    console.log("🔍 DEBUG - isValidUserId check:", { id, isValid });
    return isValid;
  };

  // Map difficulty levels from API to component expected values
  const mapDifficulty = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "Low";
      case "Medium":
        return "Medium";
      case "Hard":
        return "High";
      default:
        return difficulty;
    }
  };

  // Get category from tags (fallback logic)
  const getCategoryFromTags = (tags) => {
    if (!tags || tags.length === 0) return "General";

    const categoryMap = {
      basics: "Basics",
      beginner: "Basics",
      output: "Basics",
      input: "Basics",
      algorithms: "Algorithms",
      "binary-search": "Algorithms",
      "divide-and-conquer": "Algorithms",
      arrays: "Data Structures",
      "hash-table": "Data Structures",
      arithmetic: "Functions",
    };

    for (const tag of tags) {
      if (categoryMap[tag.toLowerCase()]) {
        return categoryMap[tag.toLowerCase()];
      }
    }

    return "General";
  };

  // Transform API challenge data to component format
  const transformChallengeData = useCallback((apiChallenge, index) => {
    console.log(`🔄 DEBUG - Transforming challenge ${index}:`, apiChallenge);

    const style = challengeStyles[index % challengeStyles.length];
    const difficulty = mapDifficulty(apiChallenge.difficulty_level);
    const category = getCategoryFromTags(apiChallenge.tags);

    // Extract real user progress data
    const userProgress = apiChallenge.user_progress || {};
    const isCompleted = userProgress.status === "completed";
    const isInProgress = userProgress.status === "in_progress";
    const userAttempts = userProgress.attempts_count || 0;
    const userBestScore = userProgress.best_score || 0;
    const completedAt = userProgress.completed_at;

    // Extract real challenge statistics
    const challengeStats = apiChallenge.statistics || {};
    const usersCompleted = challengeStats.users_completed || 0;
    const usersAttempted = challengeStats.users_attempted || 0;
    const realPassRate = challengeStats.pass_rate || 0;
    const totalSubmissions = challengeStats.total_submissions || 0;

    // Use real statistics with intelligent fallbacks
    const passedStudents = usersCompleted;
    // Ensure totalAttempts is never less than usersCompleted
    const totalAttempts = Math.max(usersAttempted, usersCompleted, 1);

    // If no real stats available, show more modest numbers
    const displayPassedStudents =
      passedStudents === 0 ? 0 : Math.max(passedStudents, 1);
    const displayTotalAttempts = totalAttempts === 0 ? 1 : totalAttempts;

    console.log(`📊 DEBUG - Challenge ${apiChallenge.title} stats:`, {
      displayPassedStudents,
      displayTotalAttempts,
      realPassRate,
      isCompleted,
      userAttempts,
    });

    const transformedChallenge = {
      id: apiChallenge.id,
      title: apiChallenge.title,
      description:
        apiChallenge.short_description ||
        apiChallenge.problem_statement?.slice(0, 100) + "...",
      difficulty: difficulty,
      category: category,
      icon: style.icon,
      passedStudents: displayPassedStudents,
      totalAttempts: displayTotalAttempts,
      estimatedTime: `${apiChallenge.estimated_time} min`,
      points: apiChallenge.reward_points,
      tags: apiChallenge.tags || [],
      isCompleted: isCompleted,
      isInProgress: isInProgress,
      gradient: style.gradient,
      bgGradient: style.bgGradient,
      // Real API statistics and user progress
      realPassRate: realPassRate,
      totalSubmissions: totalSubmissions,
      userAttempts: userAttempts,
      userBestScore: userBestScore,
      completedAt: completedAt,
      problemStatement: apiChallenge.problem_statement,
      slug: apiChallenge.slug,
      userProgress: userProgress,
      statistics: challengeStats,
      createdAt: apiChallenge.created_at,
      publishedAt: apiChallenge.published_at,
    };

    console.log(
      `✅ DEBUG - Final transformed challenge ${index}:`,
      transformedChallenge
    );
    return transformedChallenge;
  }, []);

  // Fetch user challenges from API
  const fetchChallenges = useCallback(
    async (userIdToUse) => {
      console.log("🚀 =================================");
      console.log("🚀 FETCH CHALLENGES CALLED");
      console.log("🚀 =================================");

      const targetUserId = userIdToUse || userId;

      if (!isValidUserId(targetUserId)) {
        console.log(
          "❌ DEBUG - Invalid or missing userId, cannot fetch challenges"
        );
        setLoading(false);
        setChallenges([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `https://isipython-dev.onrender.com/api/challenges?user_id=${targetUserId}`;
        console.log("🌐 DEBUG - Calling Challenges API:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("📡 DEBUG - Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📄 DEBUG - Full Challenges API Response:", result);

        // Extract challenges from the response
        let challengesData = [];
        if (result && result.data && Array.isArray(result.data.challenges)) {
          challengesData = result.data.challenges;
        } else if (Array.isArray(result)) {
          challengesData = result;
        } else {
          console.log("❌ DEBUG - Unexpected response format:", typeof result);
          setChallenges([]);
          return;
        }

        console.log(
          `📁 DEBUG - Found ${challengesData.length} challenges, transforming...`
        );

        if (challengesData.length === 0) {
          console.log("📝 DEBUG - No challenges found");
          setChallenges([]);
        } else {
          // Transform API data to component format
          const transformedChallenges = challengesData.map(
            transformChallengeData
          );
          console.log(
            "🔄 DEBUG - All transformed challenges:",
            transformedChallenges
          );

          // Sort by user progress and then by creation date
          transformedChallenges.sort((a, b) => {
            // Priority: 1. In Progress, 2. Not Started, 3. Completed
            const getProgressPriority = (challenge) => {
              if (challenge.isInProgress) return 1;
              if (!challenge.isCompleted && !challenge.isInProgress) return 2; // not started
              return 3; // completed
            };

            const aPriority = getProgressPriority(a);
            const bPriority = getProgressPriority(b);

            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }

            // If same progress status, sort by creation date (newest first)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setChallenges(transformedChallenges);
        }
      } catch (error) {
        console.error("💥 DEBUG - ERROR in fetchChallenges:", error);
        setError(error.message);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    },
    [userId, transformChallengeData]
  );

  // Fetch user challenge stats from API
  const fetchStats = useCallback(
    async (userIdToUse) => {
      console.log("📊 =================================");
      console.log("📊 FETCH CHALLENGE STATS CALLED");
      console.log("📊 =================================");

      const targetUserId = userIdToUse || userId;

      if (!isValidUserId(targetUserId)) {
        console.log("❌ DEBUG - Invalid or missing userId, cannot fetch stats");
        setStatsLoading(false);
        setStats(null);
        return;
      }

      try {
        setStatsLoading(true);
        setError(null);

        const apiUrl = `https://isipython-dev.onrender.com/api/challenges/stats?user_id=${targetUserId}`;
        console.log("🌐 DEBUG - Calling Stats API:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("📡 DEBUG - Stats Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📄 DEBUG - Full Stats API Response:", result);

        // Extract stats from the response
        if (result && result.data) {
          const statsData = {
            completedChallenges: result.data.completed_challenges || 0,
            totalPointsEarned: result.data.total_points_earned || 0,
            successRate: result.data.success_rate || 0,
            userGlobalRank: result.data.user_global_rank ?? null,
          };

          console.log("✅ DEBUG - Transformed stats:", statsData);
          setStats(statsData);
        } else {
          console.log("❌ DEBUG - Invalid stats response format");
          setStats(null);
        }
      } catch (error) {
        console.error("💥 DEBUG - ERROR in fetchStats:", error);
        setError(error.message);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    },
    [userId]
  );

  // Refresh both challenges and stats
  const refreshChallenges = useCallback(async () => {
    console.log("🔄 DEBUG - Refresh challenges and stats called");
    await Promise.all([fetchChallenges(), fetchStats()]);
  }, [fetchChallenges, fetchStats]);

  // Filter challenges based on search and filters
  const getFilteredChallenges = useCallback(
    (searchTerm, selectedCategory, selectedDifficulty) => {
      console.log("🔍 DEBUG - Filtering challenges:", {
        searchTerm,
        selectedCategory,
        selectedDifficulty,
        totalChallenges: challenges.length,
      });

      const filtered = challenges.filter((challenge) => {
        const matchesSearch =
          challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          challenge.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" || challenge.category === selectedCategory;

        const matchesDifficulty =
          selectedDifficulty === "All" ||
          challenge.difficulty === selectedDifficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
      });

      console.log(
        "🔍 DEBUG - Filtered results:",
        filtered.length,
        "challenges"
      );
      return filtered;
    },
    [challenges]
  );

  // Get available categories from challenges
  const getAvailableCategories = useCallback(() => {
    const categories = ["All"];
    const uniqueCategories = [...new Set(challenges.map((c) => c.category))];
    return categories.concat(uniqueCategories.sort());
  }, [challenges]);

  // Main useEffect - fetches data when userId changes
  useEffect(() => {
    console.log("🔄 DEBUG - Main useEffect triggered");
    console.log("🔄 DEBUG - userId:", userId);
    console.log("🔄 DEBUG - isLoggedIn:", isLoggedIn);

    if (isValidUserId(userId)) {
      console.log("✅ DEBUG - Valid userId found, calling fetch functions");
      fetchChallenges(userId);
      fetchStats(userId);
    } else {
      console.log("⏳ DEBUG - No valid userId yet, waiting...");
    }
  }, [userId, fetchChallenges, fetchStats]);

  // Timeout useEffect - prevents infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !isValidUserId(userId)) {
        console.log("⏰ DEBUG - TIMEOUT: No valid userId after 10 seconds");
        setLoading(false);
        setStatsLoading(false);
        setChallenges([]);
        setStats(null);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading, userId, isLoggedIn]);

  // Debug useEffects
  useEffect(() => {
    console.log("📁 DEBUG - Challenges state changed:", {
      challengesCount: challenges.length,
      challenges: challenges,
    });
  }, [challenges]);

  useEffect(() => {
    console.log("📊 DEBUG - Stats state changed:", stats);
  }, [stats]);

  return {
    // State
    challenges,
    stats,
    loading,
    statsLoading,
    error,

    // Actions
    fetchChallenges,
    fetchStats,
    refreshChallenges,

    // Utilities
    getFilteredChallenges,
    getAvailableCategories,
  };
};
