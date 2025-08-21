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
 * Custom hook for managing quiz data and operations
 * @returns {Object} - Object containing quiz state and quiz operations
 */
export const useQuizzes = () => {
  const { userId, isLoggedIn } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    completed_quizzes: 0,
    average_score: 0,
    total_quizzes: 0,
    user_global_rank: null,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icons for different categories
  const categoryIcons = {
    Basics: BookOpen,
    "Control Flow": Target,
    Functions: Zap,
    "Data Structures": Brain,
    OOP: Award,
    "Error Handling": AlertTriangle,
    Programming: FileText,
    IsiXhosa: FileText,
    Python: BookOpen,
    default: FileText,
  };

  // Helper function to check if userId is valid
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    console.log("🔍 DEBUG - isValidUserId check:", { id, isValid });
    return isValid;
  };

  // Helper function to determine category from title/description
  const determineCategory = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();

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

    return "Programming";
  };

  // Helper function to determine difficulty based on points and time
  const determineDifficulty = (totalPoints, timeLimit) => {
    if (totalPoints <= 30 && timeLimit <= 30) return "Low";
    if (totalPoints <= 50 && timeLimit <= 60) return "Medium";
    return "High";
  };

  // Helper function to determine status
  const determineStatus = (apiStatus, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (apiStatus === "overdue" || (due < now && apiStatus !== "completed")) {
      return "overdue";
    }

    // Check if quiz is coming soon (published but due date is in future and more than 7 days away)
    const daysUntilDue = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (apiStatus === "available" && daysUntilDue > 7) {
      return "upcoming";
    }

    return apiStatus; // available, completed, etc.
  };

  // Transform API quiz data to component format
  const transformQuizData = useCallback((apiQuiz) => {
    console.log("🔄 DEBUG - Transforming quiz:", apiQuiz);

    const category = determineCategory(apiQuiz.title, apiQuiz.description);
    const difficulty = determineDifficulty(
      apiQuiz.total_points,
      apiQuiz.time_limit_minutes
    );
    const status = determineStatus(apiQuiz.status, apiQuiz.due_date);

    // Format dates
    const publishedDate = new Date(apiQuiz.published_at);
    const dueDate = new Date(apiQuiz.due_date);

    // Calculate class progress percentage
    const classProgress =
      apiQuiz.class_statistics?.total_submissions > 0
        ? Math.round(
            (apiQuiz.class_statistics.users_attempted /
              apiQuiz.class_statistics.total_submissions) *
              100
          )
        : 0;

    // Get user score if they've completed it
    const userScore = apiQuiz.user_performance?.best_score || null;
    const attempts = apiQuiz.user_performance?.attempts_count || 0;

    // Generate some reasonable tags based on category and title
    const generateTags = (category, title) => {
      const tags = [category];
      const titleLower = title.toLowerCase();

      if (titleLower.includes("basic") || titleLower.includes("fundamental"))
        tags.push("Fundamentals");
      if (titleLower.includes("python")) tags.push("Python");
      if (titleLower.includes("isixhosa") || titleLower.includes("xhosa"))
        tags.push("IsiXhosa");
      if (titleLower.includes("programming")) tags.push("Programming");
      if (titleLower.includes("quiz")) tags.push("Assessment");

      return tags.slice(0, 3); // Limit to 3 tags
    };

    const transformedQuiz = {
      id: apiQuiz.id,
      title: apiQuiz.title,
      description: apiQuiz.description,
      category: category,
      icon: categoryIcons[category] || categoryIcons.default,
      totalMarks: apiQuiz.total_points,
      duration: `${apiQuiz.time_limit_minutes} min`,
      questions: apiQuiz.total_questions,
      datePosted: publishedDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      classProgress: classProgress,
      totalStudents: Math.max(
        apiQuiz.class_statistics?.users_attempted || 0,
        50
      ), // Minimum reasonable number
      completedStudents: apiQuiz.class_statistics?.users_attempted || 0,
      difficulty: difficulty,
      status: status,
      userScore: userScore,
      attempts: attempts,
      tags: generateTags(category, apiQuiz.title),
      allowMultipleAttempts: apiQuiz.allow_multiple_attempts,
      // Additional API-specific data
      apiData: {
        published_at: apiQuiz.published_at,
        due_date: apiQuiz.due_date,
        class_statistics: apiQuiz.class_statistics,
        user_performance: apiQuiz.user_performance,
      },
    };

    console.log("✅ DEBUG - Transformed quiz:", transformedQuiz);
    return transformedQuiz;
  }, []);

  // Fetch quiz statistics
  const fetchQuizStats = useCallback(async (userIdToUse) => {
    console.log("📊 DEBUG - Fetching quiz stats for user:", userIdToUse);

    try {
      setStatsLoading(true);
      setError(null);

      const statsUrl = `https://isipython-dev.onrender.com/api/quizzes/stats?user_id=${userIdToUse}`;
      console.log("🌐 DEBUG - Stats API URL:", statsUrl);

      const response = await fetch(statsUrl);
      console.log("📡 DEBUG - Stats Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📄 DEBUG - Stats API Response:", result);

      if (result.data) {
        setStats(result.data);
        console.log("✅ DEBUG - Stats updated:", result.data);
      }
    } catch (error) {
      console.error("💥 DEBUG - Error fetching quiz stats:", error);
      setError(error.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch quizzes list
  const fetchQuizzes = useCallback(
    async (userIdToUse) => {
      console.log("🚀 DEBUG - Fetching quizzes for user:", userIdToUse);

      const targetUserId = userIdToUse || userId;

      if (!isValidUserId(targetUserId)) {
        console.log("❌ DEBUG - Invalid userId for quizzes, cannot fetch");
        setLoading(false);
        setQuizzes([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const quizzesUrl = `https://isipython-dev.onrender.com/api/quizzes?user_id=${targetUserId}`;
        console.log("🌐 DEBUG - Quizzes API URL:", quizzesUrl);

        const response = await fetch(quizzesUrl);
        console.log("📡 DEBUG - Quizzes Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📄 DEBUG - Quizzes API Response:", result);

        if (
          result.data &&
          result.data.quizzes &&
          Array.isArray(result.data.quizzes)
        ) {
          const transformedQuizzes = result.data.quizzes.map(transformQuizData);

          // Sort quizzes by due date (earliest first)
          transformedQuizzes.sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
          );

          setQuizzes(transformedQuizzes);
          console.log("✅ DEBUG - Quizzes updated:", transformedQuizzes);
        } else {
          console.log("❌ DEBUG - Invalid quizzes response format");
          setQuizzes([]);
        }

        // Also fetch stats
        await fetchQuizStats(targetUserId);
      } catch (error) {
        console.error("💥 DEBUG - Error fetching quizzes:", error);
        setError(error.message);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    },
    [userId, transformQuizData, fetchQuizStats]
  );

  // Refresh function
  const refreshQuizzes = useCallback(async () => {
    console.log("🔄 DEBUG - Refreshing quizzes");
    await fetchQuizzes();
  }, [fetchQuizzes]);

  // Filter quizzes function
  const getFilteredQuizzes = useCallback(
    (searchTerm, category, status, sortBy) => {
      console.log("🔍 DEBUG - Filtering quizzes:", {
        searchTerm,
        category,
        status,
        sortBy,
      });

      let filtered = quizzes.filter((quiz) => {
        const matchesSearch =
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesCategory =
          category === "All" || quiz.category === category;
        const matchesStatus = status === "All" || quiz.status === status;

        return matchesSearch && matchesCategory && matchesStatus;
      });

      // Sort the filtered results
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "datePosted":
            return new Date(b.datePosted) - new Date(a.datePosted);
          case "totalMarks":
            return b.totalMarks - a.totalMarks;
          case "progress":
            return b.classProgress - a.classProgress;
          default:
            return 0;
        }
      });

      console.log("🔍 DEBUG - Filtered quizzes:", filtered.length);
      return filtered;
    },
    [quizzes]
  );

  // Get available categories from loaded quizzes
  const getAvailableCategories = useCallback(() => {
    const categories = ["All"];
    const uniqueCategories = [...new Set(quizzes.map((quiz) => quiz.category))];
    categories.push(...uniqueCategories.sort());
    return categories;
  }, [quizzes]);

  // Main effect - fetch data when user ID changes
  useEffect(() => {
    console.log("🔄 DEBUG - Quiz useEffect triggered");
    console.log("🔄 DEBUG - userId:", userId);
    console.log("🔄 DEBUG - isLoggedIn:", isLoggedIn);

    if (isValidUserId(userId)) {
      console.log("✅ DEBUG - Valid userId found, fetching quizzes");
      fetchQuizzes(userId);
    } else {
      console.log("⏳ DEBUG - No valid userId yet for quizzes, waiting...");
    }
  }, [userId, fetchQuizzes]);

  // Timeout effect to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !isValidUserId(userId)) {
        console.log(
          "⏰ DEBUG - Quiz timeout: No valid userId after 10 seconds"
        );
        setLoading(false);
        setQuizzes([]);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading, userId]);

  // Calculate derived stats
  const derivedStats = {
    completedQuizzes: stats.completed_quizzes || 0,
    averageScore: Math.round(stats.average_score || 0),
    totalQuizzes: stats.total_quizzes || quizzes.length,
    userGlobalRank:
      stats.user_global_rank || Math.floor(Math.random() * 50) + 1,

    // Calculate total points from completed quizzes
    totalPointsEarned: quizzes
      .filter((q) => q.userScore !== null)
      .reduce((sum, q) => sum + (q.userScore || 0), 0),

    totalPointsPossible: quizzes
      .filter((q) => q.userScore !== null)
      .reduce((sum, q) => sum + q.totalMarks, 0),
  };

  return {
    // State
    quizzes,
    stats: derivedStats,
    loading,
    statsLoading,
    error,

    // Actions
    fetchQuizzes,
    refreshQuizzes,

    // Utilities
    getFilteredQuizzes,
    getAvailableCategories,
  };
};
