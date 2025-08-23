import {
  Activity,
  Brain,
  Calculator,
  Clock,
  Code,
  Hash,
  Shield,
  Target,
  Thermometer,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

  // Add refs for AbortControllers
  const abortControllerRef = useRef(null);
  const statsAbortControllerRef = useRef(null);

  // Helper function to check if userId is valid
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
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
      math: "Math",
      calculations: "Math",
      geometry: "Math",
      formulas: "Math",
      mathematical: "Math",
      temperature: "Science",
      conversion: "Tools",
      security: "Security",
      validation: "Security",
      loops: "Programming",
      conditionals: "Programming",
      game: "Games",
      logic: "Logic",
      grading: "Education",
    };

    for (const tag of tags) {
      if (categoryMap[tag.toLowerCase()]) {
        return categoryMap[tag.toLowerCase()];
      }
    }

    return "General";
  };

  // Helper function to get appropriate icon and gradient based on challenge content
  const getChallengeStyle = (challenge) => {
    try {
      const title = challenge.title?.toLowerCase() || "";
      const description = challenge.short_description?.toLowerCase() || "";
      const tags = challenge.tags || [];

      // Temperature-related challenges
      if (
        title.includes("temperature") ||
        title.includes("celsius") ||
        title.includes("fahrenheit")
      ) {
        return {
          icon: Thermometer,
          gradient: "from-orange-400 to-red-500",
          bgGradient: "from-orange-50 to-red-50",
        };
      }

      // Calculator and calculation challenges
      if (
        title.includes("calculator") ||
        title.includes("calculate") ||
        description.includes("calculate")
      ) {
        return {
          icon: Calculator,
          gradient: "from-blue-400 to-indigo-500",
          bgGradient: "from-blue-50 to-indigo-50",
        };
      }

      // Geometry and area challenges
      if (
        title.includes("circle") ||
        title.includes("area") ||
        tags.includes("geometry")
      ) {
        return {
          icon: Target,
          gradient: "from-purple-400 to-pink-500",
          bgGradient: "from-purple-50 to-pink-50",
        };
      }

      // Time and age-related challenges
      if (
        title.includes("age") ||
        title.includes("year") ||
        title.includes("time")
      ) {
        return {
          icon: Clock,
          gradient: "from-emerald-400 to-teal-500",
          bgGradient: "from-emerald-50 to-teal-50",
        };
      }

      // Security challenges
      if (
        title.includes("password") ||
        title.includes("strength") ||
        title.includes("validation") ||
        tags.includes("security")
      ) {
        return {
          icon: Shield,
          gradient: "from-red-400 to-pink-500",
          bgGradient: "from-red-50 to-pink-50",
        };
      }

      // Mathematical challenges (prime numbers, etc.)
      if (
        title.includes("prime") ||
        title.includes("number") ||
        tags.includes("mathematical")
      ) {
        return {
          icon: Hash,
          gradient: "from-indigo-400 to-purple-500",
          bgGradient: "from-indigo-50 to-purple-50",
        };
      }

      // Game challenges
      if (
        title.includes("game") ||
        title.includes("guess") ||
        title.includes("guessing")
      ) {
        return {
          icon: Zap,
          gradient: "from-yellow-400 to-orange-500",
          bgGradient: "from-yellow-50 to-orange-50",
        };
      }

      // Grade and educational challenges
      if (
        title.includes("grade") ||
        title.includes("average") ||
        title.includes("student")
      ) {
        return {
          icon: Brain,
          gradient: "from-teal-400 to-cyan-500",
          bgGradient: "from-teal-50 to-cyan-50",
        };
      }

      // Array and data structure challenges
      if (tags.includes("hash-table") || tags.includes("arrays")) {
        return {
          icon: Hash,
          gradient: "from-green-400 to-emerald-500",
          bgGradient: "from-green-50 to-emerald-50",
        };
      }

      // Algorithm challenges
      if (
        tags.includes("algorithms") ||
        tags.includes("binary-search") ||
        tags.includes("divide-and-conquer")
      ) {
        return {
          icon: Code,
          gradient: "from-cyan-400 to-blue-500",
          bgGradient: "from-cyan-50 to-blue-50",
        };
      }

      // Basic programming challenges
      if (
        tags.includes("input") ||
        tags.includes("output") ||
        tags.includes("basic") ||
        tags.includes("arithmetic")
      ) {
        return {
          icon: Activity,
          gradient: "from-slate-400 to-gray-500",
          bgGradient: "from-slate-50 to-gray-50",
        };
      }

      // RANDOM ASSIGNMENT FOR EVERYTHING ELSE
      // Create a consistent pseudo-random selection based on challenge title
      const iconOptions = [
        {
          icon: Code,
          gradient: "from-cyan-400 to-blue-500",
          bgGradient: "from-cyan-50 to-blue-50",
        },
        {
          icon: Target,
          gradient: "from-purple-400 to-pink-500",
          bgGradient: "from-purple-50 to-pink-50",
        },
        {
          icon: Zap,
          gradient: "from-yellow-400 to-orange-500",
          bgGradient: "from-yellow-50 to-orange-50",
        },
        {
          icon: Calculator,
          gradient: "from-blue-400 to-indigo-500",
          bgGradient: "from-blue-50 to-indigo-50",
        },
        {
          icon: Shield,
          gradient: "from-red-400 to-pink-500",
          bgGradient: "from-red-50 to-pink-50",
        },
        {
          icon: Brain,
          gradient: "from-teal-400 to-cyan-500",
          bgGradient: "from-teal-50 to-cyan-50",
        },
        {
          icon: Activity,
          gradient: "from-slate-400 to-gray-500",
          bgGradient: "from-slate-50 to-gray-50",
        },
        {
          icon: Clock,
          gradient: "from-emerald-400 to-teal-500",
          bgGradient: "from-emerald-50 to-teal-50",
        },
        {
          icon: Hash,
          gradient: "from-green-400 to-emerald-500",
          bgGradient: "from-green-50 to-emerald-50",
        },
        {
          icon: Thermometer,
          gradient: "from-orange-400 to-red-500",
          bgGradient: "from-orange-50 to-red-50",
        },
      ];

      // Use challenge title to create a consistent "random" selection
      const titleHash = challenge.title
        ? challenge.title.length + challenge.title.charCodeAt(0)
        : 0;
      const selectedIndex = titleHash % iconOptions.length;

      return iconOptions[selectedIndex];
    } catch (error) {
      console.error("Error in getChallengeStyle:", error);
      // Ultimate fallback - guaranteed to work
      return {
        icon: Code,
        gradient: "from-gray-400 to-slate-500",
        bgGradient: "from-gray-50 to-slate-50",
      };
    }
  };

  // Transform API challenge data to component format
  const transformChallengeData = useCallback((apiChallenge, index) => {
    try {
      const difficulty = mapDifficulty(apiChallenge.difficulty_level);
      const category = getCategoryFromTags(apiChallenge.tags);

      // Get appropriate style based on challenge content
      const style = getChallengeStyle(apiChallenge);

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
      const totalAttempts = Math.max(usersAttempted, usersCompleted, 1);

      const displayPassedStudents =
        passedStudents === 0 ? 0 : Math.max(passedStudents, 1);
      const displayTotalAttempts = totalAttempts === 0 ? 1 : totalAttempts;

      return {
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
    } catch (error) {
      console.error("Error in transformChallengeData:", error);
      // Return a safe fallback object
      return {
        id: apiChallenge.id || "unknown",
        title: apiChallenge.title || "Unknown Challenge",
        description: "Challenge description not available",
        difficulty: "Low",
        category: "General",
        icon: Code,
        passedStudents: 0,
        totalAttempts: 1,
        estimatedTime: "10 min",
        points: 0,
        tags: [],
        isCompleted: false,
        isInProgress: false,
        gradient: "from-gray-400 to-slate-500",
        bgGradient: "from-gray-50 to-slate-50",
        realPassRate: 0,
        totalSubmissions: 0,
        userAttempts: 0,
        userBestScore: 0,
        completedAt: null,
        problemStatement: "",
        slug: "",
        userProgress: {},
        statistics: {},
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      };
    }
  }, []);

  // Fetch user challenges from API with AbortController
  const fetchChallenges = useCallback(
    async (targetUserId) => {
      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!isValidUserId(targetUserId)) {
        setLoading(false);
        setChallenges([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const apiUrl = `https://isipython-dev.onrender.com/api/challenges?user_id=${targetUserId}`;
        console.log(
          "🌐 Fetching challenges with abort signal for user:",
          targetUserId
        );

        const response = await fetch(apiUrl, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if request was aborted
        if (signal.aborted) {
          console.log("🚫 Challenges fetch aborted");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Check again after parsing
        if (signal.aborted) {
          console.log("🚫 Challenges fetch aborted after parsing");
          return;
        }

        // Extract challenges from the response
        let challengesData = [];
        if (result && result.data && Array.isArray(result.data.challenges)) {
          challengesData = result.data.challenges;
        } else if (Array.isArray(result)) {
          challengesData = result;
        } else {
          setChallenges([]);
          return;
        }

        if (challengesData.length === 0) {
          setChallenges([]);
        } else {
          const transformedChallenges = challengesData.map(
            transformChallengeData
          );

          // Sort by user progress and then by creation date
          transformedChallenges.sort((a, b) => {
            const getProgressPriority = (challenge) => {
              if (challenge.isInProgress) return 1;
              if (!challenge.isCompleted && !challenge.isInProgress) return 2;
              return 3;
            };

            const aPriority = getProgressPriority(a);
            const bPriority = getProgressPriority(b);

            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }

            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setChallenges(transformedChallenges);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("🚫 Challenges fetch aborted");
          return;
        }
        console.error("💥 Error fetching challenges:", error);
        setError(error.message);
        setChallenges([]);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [transformChallengeData]
  );

  // Fetch user challenge stats from API with AbortController
  const fetchStats = useCallback(async (targetUserId) => {
    // Cancel previous stats request if still running
    if (statsAbortControllerRef.current) {
      statsAbortControllerRef.current.abort();
    }

    if (!isValidUserId(targetUserId)) {
      setStatsLoading(false);
      setStats(null);
      return;
    }

    try {
      setStatsLoading(true);
      setError(null);

      // Create new abort controller for this request
      statsAbortControllerRef.current = new AbortController();
      const signal = statsAbortControllerRef.current.signal;

      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/stats?user_id=${targetUserId}`;
      console.log(
        "📊 Fetching stats with abort signal for user:",
        targetUserId
      );

      const response = await fetch(apiUrl, {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if request was aborted
      if (signal.aborted) {
        console.log("🚫 Stats fetch aborted");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Check again after parsing
      if (signal.aborted) {
        console.log("🚫 Stats fetch aborted after parsing");
        return;
      }

      if (result && result.data) {
        const statsData = {
          completedChallenges: result.data.completed_challenges || 0,
          totalPointsEarned: result.data.total_points_earned || 0,
          successRate: result.data.success_rate || 0,
          userGlobalRank: result.data.user_global_rank ?? null,
        };

        setStats(statsData);
      } else {
        setStats(null);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("🚫 Stats fetch aborted");
        return;
      }
      console.error("💥 Error fetching stats:", error);
      setError(error.message);
      setStats(null);
    } finally {
      setStatsLoading(false);
      statsAbortControllerRef.current = null;
    }
  }, []);

  // FIXED getChallengeDetails with proper JavaScript syntax
  const getChallengeDetails = useCallback(
    async (challengeId, userIdOverride, signal) => {
      try {
        const targetUserId = userIdOverride || userId;

        if (!isValidUserId(targetUserId)) {
          throw new Error("Invalid userId for challenge details request");
        }

        if (!challengeId || typeof challengeId !== "string") {
          throw new Error("A valid challengeId string is required.");
        }

        console.log(
          "🌐 Fetching challenge details with abort signal:",
          challengeId
        );

        const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}?user_id=${targetUserId}`;

        // Build fetch options
        const fetchOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Add signal if provided
        if (signal) {
          fetchOptions.signal = signal;
        }

        const response = await fetch(apiUrl, fetchOptions);

        // Check if request was aborted
        if (signal?.aborted) {
          throw new Error("Request aborted");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result?.data;

        if (!data) {
          throw new Error("Invalid challenge details response format.");
        }

        // Transform the detailed challenge data
        const base = transformChallengeData(data, 0);

        const details = {
          ...base,
          problemStatement: data.problem_statement ?? base.problemStatement,
          summary: data.summary || null,
          testCases: data.test_cases || [],
          status: data.status || null,
          shortDescription: data.short_description ?? base.description,
          createdAt: data.created_at ?? base.createdAt,
          updatedAt: data.updated_at ?? null,
          publishedAt: data.published_at ?? base.publishedAt,
          userProgress: data.user_progress ?? base.userProgress,
          statistics: data.statistics ?? base.statistics,
          constraints: data.constraints || [],
          examples: data.examples || [],
          starterCode: data.starter_code || data.template_code || null,
          hints: data.hints || [],
          difficulty: mapDifficulty(data.difficulty_level) || base.difficulty,
          category: getCategoryFromTags(data.tags) || base.category,
        };

        return details;
      } catch (error) {
        // Don't log errors for aborted requests
        if (error.name !== "AbortError" && !signal?.aborted) {
          console.error("💥 Error in getChallengeDetails:", error);
        }
        return { error: error.message || "Failed to fetch challenge details." };
      }
    },
    [transformChallengeData]
  );

  // Refresh both challenges and stats
  const refreshChallenges = useCallback(async () => {
    if (!isValidUserId(userId)) return;

    console.log("🔄 Manual refresh triggered for user:", userId);

    await Promise.all([fetchChallenges(userId), fetchStats(userId)]);
  }, [fetchChallenges, fetchStats, userId]);

  // Filter challenges - STABLE
  const getFilteredChallenges = useCallback(
    (searchTerm, selectedCategory, selectedDifficulty) => {
      return challenges.filter((challenge) => {
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
    },
    [challenges]
  );

  // Get available categories - STABLE
  const getAvailableCategories = useCallback(() => {
    const categories = ["All"];
    const uniqueCategories = [...new Set(challenges.map((c) => c.category))];
    return categories.concat(uniqueCategories.sort());
  }, [challenges]);

  // Main useEffect with AbortController - ONLY userId dependency
  useEffect(() => {
    console.log("🔄 Main useEffect triggered for userId:", userId);

    if (isValidUserId(userId)) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        fetchChallenges(userId);
        fetchStats(userId);
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      console.log("⏳ No valid userId yet, waiting...");
      setLoading(false);
      setStatsLoading(false);
    }
  }, [userId]); // ONLY userId dependency!

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (statsAbortControllerRef.current) {
        statsAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Timeout useEffect - prevents infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if ((loading || statsLoading) && !isValidUserId(userId)) {
        console.log("⏰ TIMEOUT: No valid userId after 10 seconds");
        setLoading(false);
        setStatsLoading(false);
        setChallenges([]);
        setStats(null);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading, statsLoading, userId]);

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
    getChallengeDetails,
  };
};
