/**
 * useUserChallenges Custom Hook
 *
 * This comprehensive React custom hook manages all aspects of coding challenges for users,
 * including challenge lists, individual challenge details, user progress tracking, and
 * performance statistics. It serves as the primary interface for all challenge-related
 * data and operations in the application.
 *
 * Key Features:
 * - Fetches and manages user-specific challenge lists with progress tracking
 * - Transforms raw API data into rich UI-ready format with visual enhancements
 * - Handles individual challenge detail fetching with comprehensive data
 * - Manages user statistics including completion rates and global rankings
 * - Provides intelligent challenge categorization and difficulty mapping
 * - Implements advanced filtering and sorting capabilities
 * - Uses AbortController for efficient request cancellation and cleanup
 * - Generates contextual styling and icons based on challenge content
 * - Tracks user progress states (completed, in-progress, not started)
 * - Calculates real-time statistics and performance metrics
 * - Supports challenge search across multiple data fields
 *
 * Challenge Data Enhancement:
 * - Intelligent categorization based on content analysis
 * - Dynamic icon and color scheme assignment
 * - Progress state calculation and visual indicators
 * - Statistics aggregation for class performance
 * - User attempt tracking and best score recording
 * - Estimated completion time formatting
 * - Tag-based filtering and search optimization
 *
 * Challenge Categories:
 * - Basics: Fundamental programming concepts and syntax
 * - Algorithms: Advanced algorithmic problem solving
 * - Data Structures: Array, hash table, and data organization
 * - Functions: Function definition, parameters, and return values
 * - Math: Mathematical calculations and formulas
 * - Science: Scientific calculations and conversions
 * - Security: Password validation and security concepts
 * - Tools: Utility functions and conversion tools
 * - Games: Interactive programming challenges
 * - Logic: Logical reasoning and problem solving
 * - Education: Academic and grading-related challenges
 * - General: Miscellaneous programming challenges
 *
 * Challenge Status Management:
 * - "completed": User has successfully completed the challenge
 * - "in_progress": User has started but not completed the challenge
 * - "not_started": Challenge is available but not yet attempted
 *
 * Request Management:
 * - Uses AbortController to prevent race conditions
 * - Cancels previous requests when new ones are initiated
 * - Proper cleanup on component unmount
 * - Timeout protection for long-running requests
 *
 * Usage:
 * const {
 *   challenges, stats, loading, error,
 *   fetchChallenges, refreshChallenges, getChallengeDetails,
 *   getFilteredChallenges, getAvailableCategories
 * } = useUserChallenges();
 *
 * Dependencies:
 * - useUser hook for current user information
 * - Lucide React icons for visual representation
 * - External API endpoints for challenges and statistics
 * - AbortController for request cancellation
 */

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
 * Custom hook for comprehensive challenge management and user progress tracking
 * @returns {Object} Object containing challenge state, statistics, loading states, and utility functions
 */
export const useUserChallenges = () => {
  // Get current user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main state array containing all challenge data with enhanced properties
  const [challenges, setChallenges] = useState([]);

  // Statistics object containing user performance metrics and rankings
  const [stats, setStats] = useState(null);

  // Loading state for challenge data fetching operations
  const [loading, setLoading] = useState(true);

  // Separate loading state specifically for statistics data
  const [statsLoading, setStatsLoading] = useState(true);

  // Error state to store any errors that occur during operations
  const [error, setError] = useState(null);

  // Ref to store AbortController for challenge requests - prevents race conditions
  const abortControllerRef = useRef(null);

  // Ref to store AbortController for statistics requests - prevents race conditions
  const statsAbortControllerRef = useRef(null);

  /**
   * Helper function to validate if a user ID is valid and usable
   * Ensures the ID exists, is a string, and contains meaningful content
   * @param {*} id - The user ID to validate
   * @returns {boolean} True if the user ID is valid, false otherwise
   */
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    return isValid;
  };

  /**
   * Maps API difficulty levels to component-expected values
   * Standardizes difficulty terminology across the application
   * @param {string} difficulty - The difficulty level from the API
   * @returns {string} The mapped difficulty level for UI display
   */
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

  /**
   * Determines challenge category based on tags with intelligent fallback logic
   * Uses tag analysis to categorize challenges into meaningful groups
   * @param {Array} tags - Array of tag strings from the API
   * @returns {string} The determined category for the challenge
   */
  const getCategoryFromTags = (tags) => {
    // Default fallback if no tags provided
    if (!tags || tags.length === 0) return "General";

    // Comprehensive mapping of tags to categories
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

    // Check each tag against the category mapping
    for (const tag of tags) {
      if (categoryMap[tag.toLowerCase()]) {
        return categoryMap[tag.toLowerCase()];
      }
    }

    // Return default if no matching category found
    return "General";
  };

  /**
   * Generates appropriate visual styling for challenges based on content analysis
   * Analyzes challenge title, description, and tags to assign contextual icons and colors
   * @param {Object} challenge - The challenge object to analyze
   * @returns {Object} Object containing icon component and gradient classes
   */
  const getChallengeStyle = (challenge) => {
    try {
      // Extract and normalize text content for analysis
      const title = challenge.title?.toLowerCase() || "";
      const description = challenge.short_description?.toLowerCase() || "";
      const tags = challenge.tags || [];

      // Temperature-related challenges get thermometer icon and warm colors
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

      // Calculator and mathematical challenges get calculator icon and blue colors
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

      // Geometry and spatial challenges get target icon and purple colors
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

      // Time and age-related challenges get clock icon and green colors
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

      // Security challenges get shield icon and red colors
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

      // Mathematical challenges (numbers, primes) get hash icon and purple colors
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

      // Game challenges get lightning icon and yellow colors
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

      // Educational challenges get brain icon and teal colors
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

      // Array and data structure challenges get hash icon and green colors
      if (tags.includes("hash-table") || tags.includes("arrays")) {
        return {
          icon: Hash,
          gradient: "from-green-400 to-emerald-500",
          bgGradient: "from-green-50 to-emerald-50",
        };
      }

      // Algorithm challenges get code icon and cyan colors
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

      // Basic programming challenges get activity icon and gray colors
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

      // Consistent pseudo-random assignment for unmatched challenges
      // Creates deterministic but varied styling based on challenge title
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

      // Generate consistent hash from challenge title for pseudo-random selection
      const titleHash = challenge.title
        ? challenge.title.length + challenge.title.charCodeAt(0)
        : 0;
      const selectedIndex = titleHash % iconOptions.length;

      return iconOptions[selectedIndex];
    } catch (error) {
      // Ultimate fallback styling if any errors occur
      return {
        icon: Code,
        gradient: "from-gray-400 to-slate-500",
        bgGradient: "from-gray-50 to-slate-50",
      };
    }
  };

  /**
   * Transforms raw API challenge data into enhanced UI-ready format
   * Enriches data with visual elements, computed properties, and formatted values
   * @param {Object} apiChallenge - Raw challenge data from the API
   * @param {number} index - Index of the challenge in the array (for consistent styling)
   * @returns {Object} Enhanced challenge object optimized for UI consumption
   */
  const transformChallengeData = useCallback((apiChallenge, index) => {
    try {
      // Apply difficulty mapping and category determination
      const difficulty = mapDifficulty(apiChallenge.difficulty_level);
      const category = getCategoryFromTags(apiChallenge.tags);

      // Generate appropriate visual styling
      const style = getChallengeStyle(apiChallenge);

      // Extract user progress data with safe defaults
      const userProgress = apiChallenge.user_progress || {};
      const isCompleted = userProgress.status === "completed";
      const isInProgress = userProgress.status === "in_progress";
      const userAttempts = userProgress.attempts_count || 0;
      const userBestScore = userProgress.best_score || 0;
      const completedAt = userProgress.completed_at;

      // Extract challenge statistics with safe defaults
      const challengeStats = apiChallenge.statistics || {};
      const usersCompleted = challengeStats.users_completed || 0;
      const usersAttempted = challengeStats.users_attempted || 0;
      const realPassRate = challengeStats.pass_rate || 0;
      const totalSubmissions = challengeStats.total_submissions || 0;

      // Calculate display values with intelligent fallbacks
      const passedStudents = usersCompleted;
      const totalAttempts = Math.max(usersAttempted, usersCompleted, 1);

      // Ensure reasonable minimum values for UI display
      const displayPassedStudents =
        passedStudents === 0 ? 0 : Math.max(passedStudents, 1);
      const displayTotalAttempts = totalAttempts === 0 ? 1 : totalAttempts;

      // Return comprehensive challenge object with all enhancements
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
      // Return safe fallback object if transformation fails
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

  /**
   * Fetches user challenges from the API with AbortController support
   * Handles request cancellation, data transformation, and state management
   * @param {string} targetUserId - The user ID to fetch challenges for
   */
  const fetchChallenges = useCallback(
    async (targetUserId) => {
      // Cancel any previous request that might still be running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Validate user ID before making API call
      if (!isValidUserId(targetUserId)) {
        setLoading(false);
        setChallenges([]);
        return;
      }

      try {
        // Set loading state and clear previous errors
        setLoading(true);
        setError(null);

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Construct API URL for challenges endpoint
        const apiUrl = `https://isipython-dev.onrender.com/api/challenges?user_id=${targetUserId}`;

        // Make API request with abort signal
        const response = await fetch(apiUrl, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if request was aborted before proceeding
        if (signal.aborted) {
          return;
        }

        // Verify response success
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const result = await response.json();

        // Check again for abortion after parsing
        if (signal.aborted) {
          return;
        }

        // Extract challenges from response with flexible structure handling
        let challengesData = [];
        if (result && result.data && Array.isArray(result.data.challenges)) {
          challengesData = result.data.challenges;
        } else if (Array.isArray(result)) {
          challengesData = result;
        } else {
          setChallenges([]);
          return;
        }

        // Handle empty results
        if (challengesData.length === 0) {
          setChallenges([]);
        } else {
          // Transform all challenges using the transformation function
          const transformedChallenges = challengesData.map(
            transformChallengeData
          );

          // Sort challenges by user progress priority and creation date
          transformedChallenges.sort((a, b) => {
            // Define progress priority order (lower number = higher priority)
            const getProgressPriority = (challenge) => {
              if (challenge.isInProgress) return 1; // Highest priority
              if (!challenge.isCompleted && !challenge.isInProgress) return 2; // Medium priority
              return 3; // Lowest priority (completed)
            };

            const aPriority = getProgressPriority(a);
            const bPriority = getProgressPriority(b);

            // Sort by priority first
            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }

            // If same priority, sort by creation date (newest first)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          // Update state with sorted and transformed challenges
          setChallenges(transformedChallenges);
        }
      } catch (error) {
        // Handle AbortError specifically (don't treat as real error)
        if (error.name === "AbortError") {
          return;
        }
        // Handle all other errors
        setError(error.message);
        setChallenges([]);
      } finally {
        // Always reset loading state and clear abort controller
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [transformChallengeData] // Dependency for callback recreation
  );

  /**
   * Fetches user challenge statistics from the API with AbortController support
   * Handles performance metrics, rankings, and completion data
   * @param {string} targetUserId - The user ID to fetch statistics for
   */
  const fetchStats = useCallback(async (targetUserId) => {
    // Cancel any previous statistics request that might still be running
    if (statsAbortControllerRef.current) {
      statsAbortControllerRef.current.abort();
    }

    // Validate user ID before making API call
    if (!isValidUserId(targetUserId)) {
      setStatsLoading(false);
      setStats(null);
      return;
    }

    try {
      // Set loading state and clear previous errors
      setStatsLoading(true);
      setError(null);

      // Create new AbortController for this statistics request
      statsAbortControllerRef.current = new AbortController();
      const signal = statsAbortControllerRef.current.signal;

      // Construct API URL for statistics endpoint
      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/stats?user_id=${targetUserId}`;

      // Make API request with abort signal
      const response = await fetch(apiUrl, {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if request was aborted before proceeding
      if (signal.aborted) {
        return;
      }

      // Verify response success
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const result = await response.json();

      // Check again for abortion after parsing
      if (signal.aborted) {
        return;
      }

      // Extract and structure statistics data
      if (result && result.data) {
        const statsData = {
          completedChallenges: result.data.completed_challenges || 0,
          totalPointsEarned: result.data.total_points_earned || 0,
          successRate: result.data.success_rate || 0,
          userGlobalRank: result.data.user_global_rank ?? null, // Keep null explicitly
        };

        setStats(statsData);
      } else {
        setStats(null);
      }
    } catch (error) {
      // Handle AbortError specifically (don't treat as real error)
      if (error.name === "AbortError") {
        return;
      }
      // Handle all other errors
      setError(error.message);
      setStats(null);
    } finally {
      // Always reset loading state and clear abort controller
      setStatsLoading(false);
      statsAbortControllerRef.current = null;
    }
  }, []);

  /**
   * Fetches detailed information for a specific challenge
   * Provides comprehensive challenge data including problem statement and test cases
   * @param {string} challengeId - The unique identifier of the challenge
   * @param {string} userIdOverride - Optional user ID to use instead of current user
   * @param {AbortSignal} signal - Optional abort signal for request cancellation
   * @returns {Object} Detailed challenge object or error information
   */
  const getChallengeDetails = useCallback(
    async (challengeId, userIdOverride, signal) => {
      try {
        // Determine which user ID to use
        const targetUserId = userIdOverride || userId;

        // Validate inputs
        if (!isValidUserId(targetUserId)) {
          throw new Error("Invalid userId for challenge details request");
        }

        if (!challengeId || typeof challengeId !== "string") {
          throw new Error("A valid challengeId string is required.");
        }

        // Construct API URL for specific challenge details
        const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}?user_id=${targetUserId}`;

        // Build fetch options with optional abort signal
        const fetchOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Add abort signal if provided
        if (signal) {
          fetchOptions.signal = signal;
        }

        // Make API request
        const response = await fetch(apiUrl, fetchOptions);

        // Check if request was aborted
        if (signal?.aborted) {
          throw new Error("Request aborted");
        }

        // Verify response success
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse response and validate structure
        const result = await response.json();
        const data = result?.data;

        if (!data) {
          throw new Error("Invalid challenge details response format.");
        }

        // Transform the detailed challenge data using the base transformer
        const base = transformChallengeData(data, 0);

        // Create comprehensive details object with additional properties
        const details = {
          ...base, // Include all base transformed properties
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
        // Return error object for handling by calling code
        // Don't log errors for aborted requests
        if (error.name !== "AbortError" && !signal?.aborted) {
          // Error logging removed but error still returned
        }
        return { error: error.message || "Failed to fetch challenge details." };
      }
    },
    [transformChallengeData] // Dependency for callback recreation
  );

  /**
   * Refreshes both challenges and statistics data for the current user
   * Useful for manual refresh triggers and data synchronization
   */
  const refreshChallenges = useCallback(async () => {
    // Only proceed if user ID is valid
    if (!isValidUserId(userId)) return;

    // Fetch both challenges and statistics concurrently
    await Promise.all([fetchChallenges(userId), fetchStats(userId)]);
  }, [fetchChallenges, fetchStats, userId]); // Dependencies for callback recreation

  /**
   * Filters challenges based on search term, category, and difficulty
   * Provides flexible multi-criteria filtering for challenge lists
   * @param {string} searchTerm - Text to search in titles and descriptions
   * @param {string} selectedCategory - Category to filter by ("All" for no filter)
   * @param {string} selectedDifficulty - Difficulty to filter by ("All" for no filter)
   * @returns {Array} Filtered array of challenges matching all criteria
   */
  const getFilteredChallenges = useCallback(
    (searchTerm, selectedCategory, selectedDifficulty) => {
      return challenges.filter((challenge) => {
        // Search term matching across title and description
        const matchesSearch =
          challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          challenge.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Category matching with "All" option support
        const matchesCategory =
          selectedCategory === "All" || challenge.category === selectedCategory;

        // Difficulty matching with "All" option support
        const matchesDifficulty =
          selectedDifficulty === "All" ||
          challenge.difficulty === selectedDifficulty;

        // All criteria must match for challenge to be included
        return matchesSearch && matchesCategory && matchesDifficulty;
      });
    },
    [challenges] // Dependency on challenges array for filtering
  );

  /**
   * Extracts unique categories from loaded challenges for filter options
   * Provides dynamic category list based on available challenge data
   * @returns {Array} Array of category strings including "All" option
   */
  const getAvailableCategories = useCallback(() => {
    // Start with "All" option for showing all challenges
    const categories = ["All"];

    // Extract unique categories from current challenge data
    const uniqueCategories = [...new Set(challenges.map((c) => c.category))];

    // Add unique categories in sorted order
    return categories.concat(uniqueCategories.sort());
  }, [challenges]); // Dependency on challenges array for category extraction

  /**
   * Main effect hook that triggers data fetching when user ID changes
   * Only fetches data when valid user ID is available, with small delay to prevent rapid calls
   */
  useEffect(() => {
    if (isValidUserId(userId)) {
      // Add small delay to prevent rapid successive API calls
      const timeoutId = setTimeout(() => {
        fetchChallenges(userId);
        fetchStats(userId);
      }, 100); // 100ms delay

      // Cleanup timeout if effect runs again before delay completes
      return () => clearTimeout(timeoutId);
    } else {
      // No valid user ID - stop loading states
      setLoading(false);
      setStatsLoading(false);
    }
  }, [userId]); // Only depend on userId to prevent unnecessary re-renders

  /**
   * Cleanup effect that ensures AbortControllers are properly cleaned up on unmount
   * Prevents memory leaks and abandoned network requests
   */
  useEffect(() => {
    return () => {
      // Abort any running challenges request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Abort any running statistics request
      if (statsAbortControllerRef.current) {
        statsAbortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  /**
   * Timeout effect to prevent infinite loading states
   * Handles cases where user ID never becomes available or requests hang
   */
  useEffect(() => {
    // Set up timeout to handle prolonged loading states
    const timeout = setTimeout(() => {
      // If still loading and no valid user ID after timeout period
      if ((loading || statsLoading) && !isValidUserId(userId)) {
        // Stop all loading states and clear data
        setLoading(false);
        setStatsLoading(false);
        setChallenges([]);
        setStats(null);
      }
    }, 10000); // 10 second timeout

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timeout);
  }, [loading, statsLoading, userId]); // Re-run when loading states or userId change

  // Return the hook's public API with all state and functions
  return {
    // State values that components can read
    challenges, // Array of transformed challenge objects
    stats, // User statistics object with performance metrics
    loading, // Boolean indicating if challenges are being loaded
    statsLoading, // Boolean indicating if statistics are being loaded
    error, // Any error that occurred during operations

    // Action functions that components can call
    fetchChallenges, // Function to fetch challenges for a specific user
    fetchStats, // Function to fetch statistics for a specific user
    refreshChallenges, // Function to refresh all data for the current user

    // Utility functions for data manipulation and filtering
    getFilteredChallenges, // Function to filter challenges by multiple criteria
    getAvailableCategories, // Function to get available filter categories
    getChallengeDetails, // Function to fetch detailed challenge information
  };
};
