import { useState } from "react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string;
  isHidden: boolean;
  isExample: boolean;
  pointsWeight: number;
}

interface ChallengeFormData {
  title: string;
  shortDescription: string;
  problemDescription: string;
  difficulty: string;
  rewardPoints: string;
  estimatedTime: string;
  tags: string;
  sendNotifications: boolean;
  testCases: TestCase[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const useChallengeAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (formData: ChallengeFormData): string | null => {
    if (!formData.title.trim()) {
      return "Please enter a challenge title";
    }
    if (!formData.shortDescription.trim()) {
      return "Please enter a short description";
    }
    if (!formData.problemDescription.trim()) {
      return "Please enter a problem description";
    }
    if (!formData.difficulty) {
      return "Please select a difficulty level";
    }
    if (!formData.rewardPoints || parseInt(formData.rewardPoints) <= 0) {
      return "Please enter valid reward points";
    }
    if (!formData.estimatedTime || parseInt(formData.estimatedTime) <= 0) {
      return "Please enter estimated time in minutes";
    }

    // Validate test cases
    for (let i = 0; i < formData.testCases.length; i++) {
      const tc = formData.testCases[i];
      if (!tc.input.trim() || !tc.expectedOutput.trim()) {
        return `Please fill in input and expected output for test case ${
          i + 1
        }`;
      }
    }

    return null;
  };

  const formatChallengeData = (
    formData: ChallengeFormData,
    action: "save_draft" | "publish"
  ) => {
    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    return {
      title: formData.title.trim(),
      short_description: formData.shortDescription.trim(),
      problem_statement: formData.problemDescription.trim(),
      difficulty_level: formData.difficulty,
      reward_points: parseInt(formData.rewardPoints),
      estimated_time: parseInt(formData.estimatedTime),
      tags: tagsArray,
      send_notifications: formData.sendNotifications,
      test_cases: formData.testCases.map((tc) => {
        // Parse input_data as comma-separated values or JSON array
        let inputData;
        try {
          // Try to parse as JSON array first
          inputData = JSON.parse(tc.input.trim());
          if (!Array.isArray(inputData)) {
            // If not an array, split by comma
            inputData = tc.input
              .trim()
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item);
          }
        } catch {
          // If JSON parsing fails, split by comma
          inputData = tc.input
            .trim()
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        }

        return {
          input_data: inputData,
          expected_output: tc.expectedOutput.trim(),
          explanation: tc.explanation.trim() || `Test case explanation`,
          is_hidden: tc.isHidden,
          is_example: tc.isExample,
          points_weight: tc.pointsWeight,
        };
      }),
      action,
    };
  };

  const submitChallenge = async (
    formData: ChallengeFormData,
    action: "save_draft" | "publish"
  ): Promise<ApiResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      const validationError = validateForm(formData);
      if (validationError) {
        setError(validationError);
        return { success: false, message: validationError };
      }

      // Format data for API
      const challengeData = formatChallengeData(formData, action);

      // Log the data being sent for debugging
      console.log(
        "Sending challenge data:",
        JSON.stringify(challengeData, null, 2)
      );

      // Make API call
      const baseUrl =
        typeof window !== "undefined" &&
        window.location.origin.includes("localhost")
          ? "https://isipython-dev.onrender.com" // Always use the production URL for API calls
          : "https://isipython-dev.onrender.com";
      // Make API call
      const apiBaseUrl = "https://isipython-dev.onrender.com";

      console.log("Making API call to:", `${apiBaseUrl}/api/admin/challenges`);

      const response = await fetch(`${apiBaseUrl}/api/admin/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      });

      // Log response details for debugging
      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log("Success response:", responseData);
        const message =
          action === "save_draft"
            ? "Challenge saved as draft successfully! You can continue editing or publish it later."
            : "Challenge published successfully! Students can now access and solve this challenge.";

        return {
          success: true,
          message,
          data: responseData,
        };
      } else {
        // Get the full error response
        const errorText = await response.text();
        console.error("Error response status:", response.status);
        console.error("Error response text:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message:
              errorText || `HTTP ${response.status} ${response.statusText}`,
          };
        }

        const errorMessage = `Failed to ${
          action === "save_draft" ? "save draft" : "publish"
        } challenge: ${
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          response.statusText ||
          "Unknown error"
        }`;
        console.error("Formatted error message:", errorMessage);
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error submitting challenge:", error);
      const errorMessage = `Failed to ${
        action === "save_draft" ? "save draft" : "publish"
      } challenge. Please try again.`;
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async (
    formData: ChallengeFormData
  ): Promise<ApiResponse> => {
    return await submitChallenge(formData, "save_draft");
  };

  const publishChallenge = async (
    formData: ChallengeFormData
  ): Promise<ApiResponse> => {
    return await submitChallenge(formData, "publish");
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isSubmitting,
    error,
    saveDraft,
    publishChallenge,
    clearError,
  };
};
