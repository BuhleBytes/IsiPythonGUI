import { useEffect, useState } from "react";
// API response structure for individual quizzes
interface ApiQuiz {
  id: string;
  title: string;
  description: string;
  due_date: string;
  time_limit_minutes: number;
  total_points: number;
  total_questions: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
  allow_multiple_attempts: boolean;
  send_notifications: boolean;
  show_results_immediately: boolean;
  randomize_question_order: boolean;
  instructions: string[];
  statistics: {
    attempts_count: number;
    average_score: number;
    pass_rate: number;
    users_attempted: number;
    users_passed: number;
  };
}

// Transformed quiz data structure for frontend use
interface PublishedQuiz {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  createdAt: string;
  lastModified: string;
  publishedAt: string;
  allowMultipleAttempts: boolean;
  sendNotifications: boolean;
  showResultsImmediately: boolean;
  randomizeQuestions: boolean;
  instructions: string[];
  statistics: {
    passRate: number;
    attemptsCount: number;
    usersAttempted: number;
    usersPassed: number;
    averageScore: number;
  };
}

// API response wrapper for quizzes list
interface ApiResponse {
  data: ApiQuiz[];
  total_count: number;
  message: string;
  filters_applied: {
    order_by: string;
    order_direction: string;
  };
}

// Response structure for delete operations
interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Hook return type definition
interface UsePublishedQuizzesReturn {
  publishedQuizzes: PublishedQuiz[];
  loading: boolean;
  error: string | null;
  deletingIds: Set<string>;
  refetch: () => void;
  deleteQuiz: (quizId: string) => Promise<boolean>;
}

export const usePublishedQuizzes = (): UsePublishedQuizzesReturn => {
  const [publishedQuizzes, setPublishedQuizzes] = useState<PublishedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Converts API quiz format to frontend-friendly format
  const transformApiQuizToLocal = (apiQuiz: ApiQuiz): PublishedQuiz => {
    return {
      id: apiQuiz.id,
      title: apiQuiz.title,
      description: apiQuiz.description || "No description provided",
      // Extract date portion only for display
      dueDate: apiQuiz.due_date.split("T")[0],
      timeLimit: apiQuiz.time_limit_minutes,
      totalPoints: apiQuiz.total_points,
      totalQuestions: apiQuiz.total_questions,
      createdAt: apiQuiz.created_at.split("T")[0],
      lastModified: apiQuiz.updated_at.split("T")[0],
      publishedAt: apiQuiz.published_at
        ? apiQuiz.published_at.split("T")[0]
        : "",
      allowMultipleAttempts: apiQuiz.allow_multiple_attempts,
      sendNotifications: apiQuiz.send_notifications,
      showResultsImmediately: apiQuiz.show_results_immediately,
      randomizeQuestions: apiQuiz.randomize_question_order,
      instructions: apiQuiz.instructions || [],
      // Transform statistics to match frontend format
      statistics: {
        passRate: apiQuiz.statistics.pass_rate,
        attemptsCount: apiQuiz.statistics.attempts_count,
        usersAttempted: apiQuiz.statistics.users_attempted,
        usersPassed: apiQuiz.statistics.users_passed,
        averageScore: apiQuiz.statistics.average_score,
      },
    };
  };

  // Fetches all quizzes and filters for published ones
  const fetchPublishedQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/quizzes?order_by=created_at&order_direction=desc`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch quizzes: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiResponse = await response.json();

      // Filter for published quizzes only and transform to local format
      const published = data.data
        .filter((quiz) => quiz.status === "published")
        .map(transformApiQuizToLocal);

      setPublishedQuizzes(published);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Deletes a quiz and updates local state optimistically
  const deleteQuiz = async (quizId: string): Promise<boolean> => {
    // Track deletion state for UI feedback
    setDeletingIds((prev) => new Set([...prev, quizId]));

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const deleteUrl = `${apiBaseUrl}/api/admin/quizzes/${quizId}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorText = await response.text();

          // Try to parse structured error response
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Use raw text if not JSON
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch {
          // Use status text if can't read response
        }

        throw new Error(`Failed to delete quiz: ${errorMessage}`);
      }

      // Parse response if it exists (DELETE responses may be empty)
      let responseData: DeleteResponse = { success: true };
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch {
        // Empty response is fine for DELETE operations
      }

      // Update local state immediately for better UX
      setPublishedQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));

      return true;
    } catch (error) {
      // Show error temporarily, then auto-clear
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete quiz";
      setError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);

      return false;
    } finally {
      // Remove from deleting state regardless of outcome
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quizId);
        return newSet;
      });
    }
  };

  // Manually triggers a refetch of quiz data
  const refetch = () => {
    fetchPublishedQuizzes();
  };

  // Fetch published quizzes on component mount
  useEffect(() => {
    fetchPublishedQuizzes();
  }, []);

  return {
    publishedQuizzes,
    loading,
    error,
    deletingIds,
    refetch,
    deleteQuiz,
  };
};
