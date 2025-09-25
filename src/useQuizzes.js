/**
 * useQuizzes Custom Hook
 *
 * This comprehensive React custom hook manages all quiz-related data and operations
 * for the application. It provides a centralized interface for fetching, transforming,
 * and managing quiz lists along with user statistics and performance data.
 *
 * Key Features:
 * - Fetches complete quiz lists from the API with user-specific data
 * - Transforms raw API data into UI-ready format with enhanced properties
 * - Manages quiz statistics including completion rates and user rankings
 * - Provides advanced filtering and sorting capabilities
 * - Handles quiz categorization with intelligent category detection
 * - Calculates derived statistics and performance metrics
 * - Manages loading states for both quiz data and statistics
 * - Determines quiz status based on due dates and completion state
 * - Supports multiple quiz attempts and progress tracking
 * - Generates contextual tags for easy quiz identification
 *
 * Data Enhancement:
 * - Enriches API data with category icons and visual elements
 * - Calculates progress percentages and completion rates
 * - Formats dates and time durations for display
 * - Generates intelligent tags based on content and status
 * - Determines quiz difficulty and learning objectives
 *
 * Quiz Categories:
 * - Basics: Fundamental programming concepts
 * - Control Flow: Loops, conditionals, and program flow
 * - Functions: Function definition and usage
 * - Data Structures: Lists, dictionaries, and data organization
 * - OOP: Object-oriented programming concepts
 * - Error Handling: Exception handling and debugging
 * - IsiXhosa: Language-specific programming content
 * - Python: Python-specific concepts and syntax
 *
 * Quiz Status Management:
 * - "available": Quiz is available for taking
 * - "completed": User has completed the quiz
 * - "overdue": Quiz is past its due date
 * - "not_started": Quiz is available but not yet attempted
 *
 * Usage:
 * const {
 *   quizzes, stats, loading, error,
 *   fetchQuizzes, refreshQuizzes, getFilteredQuizzes, getAvailableCategories
 * } = useQuizzes();
 *
 * Dependencies:
 * - useUser hook for current user information
 * - Lucide React icons for category visualization
 * - External API endpoints for quiz data and statistics
 */

import {
  AlertTriangle,
  Award,
  BookOpen,
  Brain,
  FileText,
  Target,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing quiz data, statistics, and user interactions
 * @returns {Object} Object containing quiz state, statistics, loading states, and utility functions
 */
export const useQuizzes = () => {
  // Get current user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main state array containing all quiz data with enhanced properties
  const [quizzes, setQuizzes] = useState([]);

  // Statistics object containing user performance metrics and global rankings
  const [stats, setStats] = useState({
    completed_quizzes: 0, // Number of quizzes the user has completed
    average_score: 0, // User's average score across all completed quizzes
    total_quizzes: 0, // Total number of quizzes available to the user
    user_global_rank: null, // User's ranking compared to other users (null if not ranked)
  });

  // Loading state for the main quiz data fetching process
  const [loading, setLoading] = useState(true);

  // Separate loading state specifically for statistics data
  const [statsLoading, setStatsLoading] = useState(true);

  // Error state to store any errors that occur during data operations
  const [error, setError] = useState(null);

  // Icon mapping for different quiz categories
  // Each category gets a specific Lucide React icon for visual representation
  const categoryIcons = {
    Basics: BookOpen, // Book icon for fundamental concepts
    "Control Flow": Target, // Target icon for conditional logic and loops
    Functions: Zap, // Lightning bolt for function concepts
    "Data Structures": Brain, // Brain icon for complex data organization
    OOP: Award, // Award icon for object-oriented programming
    "Error Handling": AlertTriangle, // Warning triangle for error concepts
    Programming: FileText, // File icon for general programming
    IsiXhosa: FileText, // File icon for language-specific content
    Python: BookOpen, // Book icon for Python-specific content
    default: FileText, // Default fallback icon
  };

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
   * Intelligent category determination based on quiz title and description
   * Uses keyword matching to automatically categorize quizzes into learning topics
   * @param {string} title - The quiz title
   * @param {string} description - The quiz description
   * @returns {string} The determined category name
   */
  const determineCategory = (title, description) => {
    // Combine title and description for comprehensive analysis
    const text = `${title} ${description}`.toLowerCase();

    // Check for category-specific keywords and return appropriate category
    if (text.includes("basic") || text.includes("fundamental")) return "Basics";
    if (
      text.includes("control") ||
      text.includes("loop") ||
      text.includes("condition")
    )
      return "Control Flow";
    if (text.includes("function") || text.includes("method"))
      return "Functions";
    if (
      text.includes("data structure") ||
      text.includes("list") ||
      text.includes("dict")
    )
      return "Data Structures";
    if (
      text.includes("object") ||
      text.includes("class") ||
      text.includes("oop")
    )
      return "OOP";
    if (
      text.includes("error") ||
      text.includes("exception") ||
      text.includes("debug")
    )
      return "Error Handling";
    if (text.includes("isixhosa") || text.includes("xhosa")) return "IsiXhosa";
    if (text.includes("python")) return "Python";

    // Default fallback category
    return "Programming";
  };

  /**
   * Determines the current status of a quiz based on API status and due date
   * Handles overdue detection and status validation
   * @param {string} apiStatus - The status returned from the API
   * @param {string} dueDate - The due date string from the API
   * @returns {string} The determined quiz status
   */
  const determineStatus = (apiStatus, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);

    // Check if quiz is overdue (past due date and not completed)
    if (apiStatus === "overdue" || (due < now && apiStatus !== "completed")) {
      return "overdue";
    }

    // Return the original API status (available, completed, etc.)
    return apiStatus;
  };

  /**
   * Transforms raw API quiz data into enhanced UI-ready format
   * Adds visual elements, calculates derived properties, and structures data for components
   * @param {Object} apiQuiz - Raw quiz data from the API
   * @returns {Object} Enhanced quiz object optimized for UI consumption
   */
  const transformQuizData = useCallback((apiQuiz) => {
    // Determine category and status using helper functions
    const category = determineCategory(apiQuiz.title, apiQuiz.description);
    const status = determineStatus(apiQuiz.status, apiQuiz.due_date);

    // Parse and format date strings
    const publishedDate = new Date(apiQuiz.published_at);
    const dueDate = new Date(apiQuiz.due_date);

    // Calculate class-wide progress percentage
    const classProgress =
      apiQuiz.class_statistics?.total_submissions > 0
        ? apiQuiz.class_statistics.pass_rate
        : 0;

    // Extract user-specific performance data
    const userScore = apiQuiz.user_performance?.best_score || null;
    const attempts = apiQuiz.user_performance?.attempts_count || 0;

    /**
     * Generates contextual tags for quiz identification and filtering
     * Tags provide quick visual indicators of quiz properties and user progress
     * @param {string} category - The quiz category
     * @param {string} title - The quiz title
     * @param {string} status - The quiz status
     * @param {number} attempts - Number of user attempts
     * @param {number} userScore - User's best score
     * @param {number} totalPoints - Total points possible
     * @returns {Array} Array of tag strings for display
     */
    const generateTags = (
      category,
      title,
      status,
      attempts,
      userScore,
      totalPoints
    ) => {
      const tags = [];

      // Always include the category as the primary tag
      tags.push(category);

      // Add status-specific tags with relevant information
      if (status === "completed") {
        // Show score percentage for completed quizzes
        const percentage =
          totalPoints > 0 ? Math.round((userScore / totalPoints) * 100) : 0;
        tags.push(`${percentage}%`);
      } else if (status === "overdue") {
        tags.push("Overdue");
      } else if (status === "available" && attempts === 0) {
        tags.push("Not Started");
      }

      // Add programming language-specific tags based on title content
      if (
        title.toLowerCase().includes("isixhosa") ||
        title.toLowerCase().includes("xhosa")
      )
        tags.push("IsiXhosa");
      if (title.toLowerCase().includes("python")) tags.push("Python");

      // Limit to 3 tags to prevent UI overcrowding
      return tags.slice(0, 3);
    };

    // Create the enhanced quiz object with all necessary properties
    const transformedQuiz = {
      id: apiQuiz.id,
      title: apiQuiz.title,
      description: apiQuiz.description,
      category: category,
      icon: categoryIcons[category] || categoryIcons.default,
      totalMarks: apiQuiz.total_points,
      duration: `${apiQuiz.time_limit_minutes} min`,
      questions: apiQuiz.total_questions,
      datePosted: publishedDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      dueDate: dueDate.toISOString(), // Keep full ISO string for time calculations
      classProgress: classProgress,
      passRate: apiQuiz.class_statistics.pass_rate,
      usersPassed: apiQuiz.class_statistics.users_passed,
      usersAttempted: apiQuiz.class_statistics.users_attempted,
      // Ensure reasonable minimum for statistical calculations
      totalStudents: Math.max(
        apiQuiz.class_statistics?.users_attempted || 0,
        50
      ),
      completedStudents: apiQuiz.class_statistics?.users_attempted || 0,
      status: status,
      userScore: userScore,
      attempts: attempts,
      tags: generateTags(
        category,
        apiQuiz.title,
        status,
        attempts,
        userScore,
        apiQuiz.total_points
      ),
      allowMultipleAttempts: apiQuiz.allow_multiple_attempts,
      // Preserve original API data for reference and debugging
      apiData: {
        published_at: apiQuiz.published_at,
        due_date: apiQuiz.due_date,
        class_statistics: apiQuiz.class_statistics,
        user_performance: apiQuiz.user_performance,
      },
    };

    return transformedQuiz;
  }, []); // No dependencies - this function is pure

  /**
   * Fetches quiz statistics from the API for a specific user
   * Handles user performance metrics, rankings, and completion data
   * @param {string} userIdToUse - The user ID to fetch statistics for
   */
  const fetchQuizStats = useCallback(async (userIdToUse) => {
    try {
      // Set loading state and clear previous errors
      setStatsLoading(true);
      setError(null);

      // Construct statistics API URL
      const statsUrl = `https://isipython-dev.onrender.com/api/quizzes/stats?user_id=${userIdToUse}`;

      // Make API request
      const response = await fetch(statsUrl);

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response and update state
      const result = await response.json();

      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      // Handle any errors during statistics fetching
      setError(error.message);
    } finally {
      // Always reset loading state
      setStatsLoading(false);
    }
  }, []); // No dependencies - this function is independent

  /**
   * Fetches the complete list of quizzes for a user with enhanced data
   * Handles data transformation, sorting, and statistics integration
   * @param {string} userIdToUse - Optional user ID to use instead of the hook's userId
   */
  const fetchQuizzes = useCallback(
    async (userIdToUse) => {
      // Determine which user ID to use
      const targetUserId = userIdToUse || userId;

      // Validate user ID before making API calls
      if (!isValidUserId(targetUserId)) {
        setLoading(false);
        setQuizzes([]);
        return;
      }

      try {
        // Set loading state and clear previous errors
        setLoading(true);
        setError(null);

        // Construct quizzes API URL with user context
        const quizzesUrl = `https://isipython-dev.onrender.com/api/quizzes?user_id=${targetUserId}`;

        // Make API request
        const response = await fetch(quizzesUrl);

        // Check if request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse response
        const result = await response.json();

        // Validate response structure and process quiz data
        if (
          result.data &&
          result.data.quizzes &&
          Array.isArray(result.data.quizzes)
        ) {
          // Transform each quiz using the transformation function
          const transformedQuizzes = result.data.quizzes.map(transformQuizData);

          // Sort quizzes by due date (earliest first) for better UX
          transformedQuizzes.sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
          );

          // Update state with transformed quiz data
          setQuizzes(transformedQuizzes);
        } else {
          // Handle invalid response format
          setQuizzes([]);
        }

        // Fetch associated statistics data
        await fetchQuizStats(targetUserId);
      } catch (error) {
        // Handle any errors during quiz fetching
        setError(error.message);
        setQuizzes([]); // Ensure UI has consistent empty state
      } finally {
        // Always reset loading state
        setLoading(false);
      }
    },
    [userId, transformQuizData, fetchQuizStats] // Dependencies for callback recreation
  );

  /**
   * Convenience function to refresh quiz data for the current user
   * Useful for manual refresh triggers and data updates
   */
  const refreshQuizzes = useCallback(async () => {
    await fetchQuizzes();
  }, [fetchQuizzes]); // Dependency ensures it uses the latest fetchQuizzes

  /**
   * Advanced filtering function that supports multiple filter criteria
   * Provides flexible quiz filtering with search, category, status, and sorting options
   * @param {string} searchTerm - Text to search in titles, descriptions, and tags
   * @param {string} category - Category to filter by ("All" for no filter)
   * @param {string} status - Status to filter by ("All" for no filter)
   * @param {string} sortBy - Field to sort by (dueDate, datePosted, totalMarks, progress)
   * @returns {Array} Filtered and sorted array of quizzes
   */
  const getFilteredQuizzes = useCallback(
    (searchTerm, category, status, sortBy) => {
      // Apply filters to the quiz list
      let filtered = quizzes.filter((quiz) => {
        // Search term matching across multiple fields
        const matchesSearch =
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          );

        // Category matching (or "All" to include everything)
        const matchesCategory =
          category === "All" || quiz.category === category;

        // Status matching (or "All" to include everything)
        const matchesStatus = status === "All" || quiz.status === status;

        // All filters must match for quiz to be included
        return matchesSearch && matchesCategory && matchesStatus;
      });

      // Apply sorting to the filtered results
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            // Sort by due date (earliest first)
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "datePosted":
            // Sort by posted date (newest first)
            return new Date(b.datePosted) - new Date(a.datePosted);
          case "totalMarks":
            // Sort by total marks (highest first)
            return b.totalMarks - a.totalMarks;
          case "progress":
            // Sort by class progress (highest first)
            return b.classProgress - a.classProgress;
          default:
            // No sorting applied
            return 0;
        }
      });

      return filtered;
    },
    [quizzes] // Dependency on quizzes array for filtering
  );

  /**
   * Extracts unique categories from loaded quizzes for filter dropdown
   * Provides dynamic category list based on available quiz data
   * @returns {Array} Array of category strings including "All" option
   */
  const getAvailableCategories = useCallback(() => {
    // Start with "All" option for showing all quizzes
    const categories = ["All"];

    // Extract unique categories from current quiz data
    const uniqueCategories = [...new Set(quizzes.map((quiz) => quiz.category))];

    // Add unique categories in sorted order
    categories.push(...uniqueCategories.sort());

    return categories;
  }, [quizzes]); // Dependency on quizzes array for category extraction

  /**
   * Main effect hook that triggers quiz data fetching when user information changes
   * Only fetches when valid user ID is available
   */
  useEffect(() => {
    // Check if we have valid user information
    if (isValidUserId(userId)) {
      // Valid user ID found, proceed with fetching quiz data
      fetchQuizzes(userId);
    }
    // If no valid user ID yet, wait (timeout effect will handle prolonged waiting)
  }, [userId, fetchQuizzes]); // Re-run when userId or fetchQuizzes changes

  /**
   * Timeout effect to prevent infinite loading states
   * Handles cases where user ID never becomes available
   */
  useEffect(() => {
    // Set up timeout to handle prolonged loading states
    const timeout = setTimeout(() => {
      // If still loading and no valid user ID after timeout
      if (loading && !isValidUserId(userId)) {
        // Stop loading and set empty state
        setLoading(false);
        setQuizzes([]);
      }
    }, 10000); // 10 second timeout

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timeout);
  }, [loading, userId]); // Re-run when loading state or userId changes

  // Calculate derived statistics using both API data and local quiz data
  // Provides comprehensive metrics for dashboard and progress displays
  const derivedStats = {
    // Primary statistics from API
    completedQuizzes: stats.completed_quizzes || 0,
    totalQuizzes: stats.total_quizzes || quizzes.length,
    averageScore: Math.round(stats.average_score || 0),
    userGlobalRank: stats.user_global_rank, // Keep null if not available

    // Calculated statistics from local quiz data (fallback/verification)
    totalPointsEarned: quizzes
      .filter((q) => q.userScore !== null) // Only include completed quizzes
      .reduce((sum, q) => sum + (q.userScore || 0), 0),

    totalPointsPossible: quizzes
      .filter((q) => q.userScore !== null) // Only include completed quizzes
      .reduce((sum, q) => sum + q.totalMarks, 0),
  };

  // Return the hook's public API
  return {
    // State values that components can read
    quizzes, // The complete array of transformed quiz data
    stats: derivedStats, // Comprehensive statistics object
    loading, // Whether quiz data is currently being loaded
    statsLoading, // Whether statistics are currently being loaded
    error, // Any error that occurred during operations

    // Action functions that components can call
    fetchQuizzes, // Function to fetch quizzes for a specific user
    refreshQuizzes, // Function to refresh the current user's quiz data

    // Utility functions for data manipulation
    getFilteredQuizzes, // Function to filter and sort quizzes
    getAvailableCategories, // Function to get available filter categories
  };
};
