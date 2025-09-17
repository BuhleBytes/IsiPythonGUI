import { useState } from "react";

export interface QuizQuestion {
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

export interface QuizFormData {
  title: string;
  description: string;
  due_date: string;
  time_limit_minutes: string;
  send_notifications: boolean;
  randomize_question_order: boolean;
  show_results_immediately: boolean;
  allow_multiple_attempts: boolean;
  instructions: string[];
  questions: QuizQuestion[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  quizId?: string;
}

export const useQuizAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftQuizId, setDraftQuizId] = useState<string | null>(null);

  const formatQuizData = (
    formData: QuizFormData,
    action: "save_draft" | "publish",
    existingQuizId?: string
  ) => {
    const baseData = {
      ...(existingQuizId && { id: existingQuizId }),
      title: formData.title.trim(),
      description: formData.description.trim(),
      due_date: formData.due_date,
      time_limit_minutes: parseInt(formData.time_limit_minutes) || 30,
      send_notifications: formData.send_notifications,
      randomize_question_order: formData.randomize_question_order,
      show_results_immediately: formData.show_results_immediately,
      allow_multiple_attempts: formData.allow_multiple_attempts,
      instructions: formData.instructions.filter(
        (instruction) => instruction.trim().length > 0
      ),
      questions: formData.questions.map((question, index) => ({
        question_order_idx: index + 1,
        question_text: question.question_text.trim(),
        option_a: question.option_a.trim(),
        option_b: question.option_b.trim(),
        option_c: question.option_c.trim(),
        option_d: question.option_d.trim(),
        correct_answer: question.correct_answer,
        explanation: question.explanation.trim(),
        points_weight: question.points_weight || 10,
      })),
      action: action,
    };

    return baseData;
  };

  const submitQuiz = async (
    formData: QuizFormData,
    action: "save_draft" | "publish"
  ): Promise<ApiResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log(`🚀 Starting quiz ${action} operation`);

      // Check if this is an update to existing draft
      const isUpdate = action === "publish" && !!draftQuizId;

      // Format data for API
      const quizData = formatQuizData(
        formData,
        action,
        isUpdate ? draftQuizId : undefined
      );

      console.log("Quiz operation details:");
      console.log("- Action:", action);
      console.log("- Current draft ID:", draftQuizId);
      console.log("- Is Update:", isUpdate);
      console.log("- Will include ID in payload:", !!quizData.id);
      console.log("- Questions being sent:", quizData.questions.length);
      console.log("Sending quiz data:", JSON.stringify(quizData, null, 2));

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const endpoint = `${apiBaseUrl}/api/admin/quizzes`;

      console.log("Making API call to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);

      if (response.ok) {
        let responseData;
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.warn("Response is not JSON, treating as success");
          responseData = {};
        }

        console.log("Success response:", responseData);

        // Store the quiz ID for both draft saves and publishes
        if (responseData.id || responseData.quiz_id || responseData.data?.id) {
          const quizId =
            responseData.id || responseData.quiz_id || responseData.data?.id;

          if (action === "save_draft") {
            // Store/update the draft ID for future operations
            setDraftQuizId(quizId);
            console.log("Stored draft quiz ID:", quizId);
          } else if (action === "publish") {
            // Clear draft ID after successful publish
            setDraftQuizId(null);
            console.log("Cleared draft ID after successful publish");
          }
        } else if (action === "save_draft" && !draftQuizId) {
          // If this was a new draft save but no ID returned, log warning
          console.warn("No quiz ID returned from save_draft API call");
        }

        const message =
          action === "save_draft"
            ? "Quiz saved as draft successfully! You can continue editing or click 'Publish Quiz' to make it live."
            : isUpdate
            ? "Draft quiz published successfully! Students can now access and take this quiz."
            : "Quiz published successfully! Students can now access and take this quiz.";

        return {
          success: true,
          message: responseData.message || message,
          data: responseData,
          quizId: responseData.id,
        };
      } else {
        // Enhanced error handling
        let errorData;
        try {
          const errorText = await response.text();
          console.error("Error response text:", errorText);

          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
        } catch {
          errorData = { message: "Network error" };
        }

        // Extract specific error messages
        let specificError = "Unknown server error";

        if (errorData.errors && typeof errorData.errors === "object") {
          // Handle validation errors
          const errorKeys = Object.keys(errorData.errors);
          if (errorKeys.length > 0) {
            const errorMessages = errorKeys.map(
              (key) => `${key}: ${errorData.errors[key]}`
            );
            specificError = errorMessages.join(", ");
          }
        } else if (errorData.message) {
          specificError = errorData.message;
        } else if (errorData.error) {
          specificError = errorData.error;
        } else if (errorData.detail) {
          specificError = errorData.detail;
        } else if (response.status) {
          specificError = `HTTP ${response.status} ${response.statusText}`;
        }

        const errorMessage = `Failed to ${
          action === "save_draft" ? "save draft" : "publish"
        } quiz: ${specificError}`;

        console.error("Formatted error message:", errorMessage);
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      console.error("Network/Request error:", error);
      const errorMessage = `Failed to ${
        action === "save_draft" ? "save draft" : "publish"
      } quiz: ${error instanceof Error ? error.message : "Network error"}`;

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async (formData: QuizFormData): Promise<ApiResponse> => {
    return await submitQuiz(formData, "save_draft");
  };

  const publishQuiz = async (formData: QuizFormData): Promise<ApiResponse> => {
    return await submitQuiz(formData, "publish");
  };

  const clearError = () => {
    setError(null);
  };

  const resetDraft = () => {
    setDraftQuizId(null);
  };

  return {
    isSubmitting,
    error,
    saveDraft,
    publishQuiz,
    clearError,
    draftQuizId,
    resetDraft,
    hasDraft: !!draftQuizId,
  };
};
