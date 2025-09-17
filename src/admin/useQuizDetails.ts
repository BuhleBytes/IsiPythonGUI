import { useEffect, useState } from "react";

// API response structure for individual quiz questions
interface ApiQuizQuestion {
  id: string;
  quiz_id: string;
  question_order_idx: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  points_weight: number;
  created_at: string;
}

// API response structure for complete quiz details
interface ApiQuizDetails {
  id: string;
  title: string;
  description: string;
  due_date: string;
  time_limit_minutes: number;
  total_points: number;
  total_questions: number;
  status: "draft" | "published";
  allow_multiple_attempts: boolean;
  send_notifications: boolean;
  show_results_immediately: boolean;
  randomize_question_order: boolean;
  instructions: string[];
  questions: ApiQuizQuestion[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  slug: string;
  search_vector: string;
}

// Transformed quiz data structure used throughout the app
interface DetailedQuiz {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  status: "draft" | "published";
  allowMultipleAttempts: boolean;
  sendNotifications: boolean;
  showResultsImmediately: boolean;
  randomizeQuestions: boolean;
  instructions: string[];
  questions: QuizQuestion[];
  createdAt: string;
  lastModified: string;
}

// Simplified question structure for frontend use
interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  points_weight: number;
}

// API wrapper response structure
interface ApiDetailResponse {
  data: ApiQuizDetails;
  message: string;
}

// Hook return type definition
interface UseQuizDetailsReturn {
  quiz: DetailedQuiz | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useQuizDetails = (quizId: string): UseQuizDetailsReturn => {
  const [quiz, setQuiz] = useState<DetailedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Converts API response format to frontend-friendly format
  const transformApiQuizToLocal = (apiQuiz: ApiQuizDetails): DetailedQuiz => {
    // Format due date for datetime-local input compatibility
    const dueDateFormatted = apiQuiz.due_date
      ? new Date(apiQuiz.due_date).toISOString().slice(0, 16)
      : "";

    return {
      id: apiQuiz.id,
      title: apiQuiz.title,
      description: apiQuiz.description || "",
      dueDate: dueDateFormatted,
      timeLimit: apiQuiz.time_limit_minutes,
      totalPoints: apiQuiz.total_points,
      totalQuestions: apiQuiz.total_questions,
      status: apiQuiz.status,
      allowMultipleAttempts: apiQuiz.allow_multiple_attempts,
      sendNotifications: apiQuiz.send_notifications,
      showResultsImmediately: apiQuiz.show_results_immediately,
      randomizeQuestions: apiQuiz.randomize_question_order,
      instructions: apiQuiz.instructions || [],
      // Sort questions by order index and transform to frontend format
      questions: apiQuiz.questions
        .sort(
          (a, b) =>
            parseInt(a.question_order_idx) - parseInt(b.question_order_idx)
        )
        .map((question) => ({
          id: question.id,
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          points_weight: question.points_weight,
        })),
      // Extract date portion only for display
      createdAt: apiQuiz.created_at.split("T")[0],
      lastModified: apiQuiz.updated_at.split("T")[0],
    };
  };

  // Fetches quiz details from API and handles loading states
  const fetchQuizDetails = async () => {
    if (!quizId) return;

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(`${apiBaseUrl}/api/admin/quizzes/${quizId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch quiz details: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiDetailResponse = await response.json();
      const transformedQuiz = transformApiQuizToLocal(data.data);
      setQuiz(transformedQuiz);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manually triggers a refetch of quiz data
  const refetch = () => {
    fetchQuizDetails();
  };

  // Fetch quiz details when quizId changes
  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  return {
    quiz,
    loading,
    error,
    refetch,
  };
};
