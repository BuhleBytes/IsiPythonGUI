import { useState } from "react";

// Question structure for quiz creation and editing
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

// Complete quiz form data structure
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

// Standardized API response format
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  quizId?: string;
}

// Converts various date formats to UTC ISO string with Z suffix
function toZuluIso(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Already has timezone (Z or offset) - just normalize
  if (/Z$|[+-]\d{2}:\d{2}$/.test(input)) {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/\.\d{3}Z$/, "Z"); // drop ms
  }

  // Date-only format: treat as end of day in local timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    const local = new Date(y, m - 1, d, 23, 59, 59);
    return isNaN(local.getTime())
      ? ""
      : local.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  // datetime-local format: convert local time to UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(input)) {
    const [datePart, timePart] = input.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ssRaw] = timePart.split(":").map(Number);
    const ss = Number.isFinite(ssRaw) ? ssRaw : 0;
    const local = new Date(y, m - 1, d, hh, mm, ss);
    return isNaN(local.getTime())
      ? ""
      : local.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  // Fallback: let Date constructor handle parsing
  const d = new Date(input);
  return isNaN(d.getTime()) ? "" : d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export const useQuizAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftQuizId, setDraftQuizId] = useState<string | null>(null);

  // Transforms form data into API-compatible format
  const formatQuizData = (
    formData: QuizFormData,
    action: "save_draft" | "publish",
    existingQuizId?: string
  ) => {
    const baseData = {
      // Include ID for updates
      ...(existingQuizId && { id: existingQuizId }),
      title: formData.title.trim(),
      description: formData.description.trim(),
      due_date: toZuluIso(formData.due_date),
      time_limit_minutes: parseInt(formData.time_limit_minutes) || 30,
      send_notifications: formData.send_notifications,
      randomize_question_order: formData.randomize_question_order,
      show_results_immediately: formData.show_results_immediately,
      allow_multiple_attempts: formData.allow_multiple_attempts,
      // Filter out empty instructions
      instructions: formData.instructions.filter(
        (instruction) => instruction.trim().length > 0
      ),
      // Add order index and clean up question data
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

  // Main submission handler for both draft saving and publishing
  const submitQuiz = async (
    formData: QuizFormData,
    action: "save_draft" | "publish"
  ): Promise<ApiResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate due date before sending to avoid backend errors
      const normalizedDue = toZuluIso(formData.due_date);
      if (!normalizedDue) {
        const msg =
          "Invalid due date. Use a valid date/time. We'll send it as UTC like 2025-09-28T23:59:59Z.";
        setError(msg);
        return { success: false, message: msg };
      }

      // Determine if this is updating an existing draft
      const isUpdate = action === "publish" && !!draftQuizId;

      const quizData = formatQuizData(
        { ...formData, due_date: normalizedDue },
        action,
        isUpdate ? draftQuizId : undefined
      );

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const endpoint = `${apiBaseUrl}/api/admin/quizzes`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        let responseData: any = {};
        try {
          responseData = await response.json();
        } catch {
          // Some successful responses may be empty
        }

        // Extract quiz ID from various possible response formats
        if (responseData.id || responseData.quiz_id || responseData.data?.id) {
          const quizId =
            responseData.id || responseData.quiz_id || responseData.data?.id;

          // Update draft state based on action
          if (action === "save_draft") {
            setDraftQuizId(quizId);
          } else if (action === "publish") {
            setDraftQuizId(null);
          }
        }

        // Generate appropriate success message
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
        // Parse error response with multiple fallbacks
        let errorData: any;
        try {
          const errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
        } catch {
          errorData = { message: "Network error" };
        }

        let specificError = "Unknown server error";

        // Extract error message from various response formats
        if (errorData.errors && typeof errorData.errors === "object") {
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

        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = `Failed to ${
        action === "save_draft" ? "save draft" : "publish"
      } quiz: ${error instanceof Error ? error.message : "Network error"}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convenience method for saving drafts
  const saveDraft = async (formData: QuizFormData): Promise<ApiResponse> => {
    return await submitQuiz(formData, "save_draft");
  };

  // Convenience method for publishing quizzes
  const publishQuiz = async (formData: QuizFormData): Promise<ApiResponse> => {
    return await submitQuiz(formData, "publish");
  };

  // Utility methods for state management
  const clearError = () => setError(null);
  const resetDraft = () => setDraftQuizId(null);

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
