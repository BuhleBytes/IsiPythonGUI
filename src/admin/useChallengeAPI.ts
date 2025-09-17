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
  challengeId?: string;
}

export const useChallengeAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftChallengeId, setDraftChallengeId] = useState<string | null>(null);

  // FIXED VALIDATION - Much more permissive to match backend capabilities
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

    // FIXED: Only validate test cases that have content - allow empty test cases
    for (let i = 0; i < formData.testCases.length; i++) {
      const tc = formData.testCases[i];
      // Only validate if user has started filling in the test case
      if (tc.input.trim() || tc.expectedOutput.trim()) {
        // If they've started one field, require both
        if (!tc.input.trim() || !tc.expectedOutput.trim()) {
          return `Test case ${
            i + 1
          }: Please fill in both input and expected output, or leave both empty`;
        }
      }
      // Allow completely empty test cases - backend supports this
    }

    // REMOVED: No longer require example test cases - backend allows this
    return null;
  };

  const formatChallengeData = (
    formData: ChallengeFormData,
    action: "save_draft" | "publish",
    challengeId?: string
  ) => {
    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    const baseData = {
      title: formData.title.trim(),
      short_description: formData.shortDescription.trim(),
      problem_statement: formData.problemDescription.trim(),
      difficulty_level: formData.difficulty,
      reward_points: parseInt(formData.rewardPoints),
      estimated_time: parseInt(formData.estimatedTime),
      tags: tagsArray,
      send_notifications: formData.sendNotifications,
      // FIXED: Filter out empty test cases and send empty array if none are complete
      test_cases: formData.testCases
        .filter((tc) => {
          // Only include test cases that have actual content
          return tc.input.trim() || tc.expectedOutput.trim();
        })
        .map((tc) => {
          let inputData;

          const trimmedInput = tc.input.trim();
          if (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
            try {
              inputData = JSON.parse(trimmedInput);
              if (Array.isArray(inputData)) {
                inputData = inputData.map((item) => String(item));
              } else {
                inputData = [String(inputData)];
              }
            } catch (e) {
              inputData = trimmedInput
                .slice(1, -1)
                .split(",")
                .map((item) => item.trim().replace(/^["']|["']$/g, ""))
                .filter((item) => item !== "");
            }
          } else {
            if (trimmedInput.includes(",")) {
              inputData = trimmedInput
                .split(",")
                .map((item) => item.trim().replace(/^["']|["']$/g, ""))
                .filter((item) => item !== "");
            } else {
              inputData = trimmedInput ? [trimmedInput] : [];
            }
          }

          return {
            input_data: inputData,
            expected_output: tc.expectedOutput.trim(),
            explanation: tc.explanation.trim() || `Test case explanation`,
            is_hidden: tc.isHidden,
            is_example: tc.isExample,
            points_weight: Number(tc.pointsWeight),
          };
        }),
      action,
    };

    // If updating an existing challenge, add the ID
    if (challengeId) {
      return {
        ...baseData,
        id: challengeId,
      };
    }

    return baseData;
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

      // If we have a draft ID, ALWAYS include it (for both save_draft and publish actions)
      const isUpdate = !!draftChallengeId;

      // Format data for API
      const challengeData = formatChallengeData(
        formData,
        action,
        isUpdate ? draftChallengeId : undefined
      );

      console.log("Challenge operation details:");
      console.log("- Action:", action);
      console.log("- Current draft ID:", draftChallengeId);
      console.log("- Is Update:", isUpdate);
      console.log("- Will include ID in payload:", !!challengeData.id);
      console.log("- Test cases being sent:", challengeData.test_cases.length);
      console.log(
        "Sending challenge data:",
        JSON.stringify(challengeData, null, 2)
      );

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const endpoint = `${apiBaseUrl}/api/admin/challenges`;

      console.log("Making API call to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
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

        // Store the challenge ID for both draft saves and publishes
        if (
          responseData.id ||
          responseData.challenge_id ||
          responseData.data?.id
        ) {
          const challengeId =
            responseData.id ||
            responseData.challenge_id ||
            responseData.data?.id;

          if (action === "save_draft") {
            // Store/update the draft ID for future operations
            setDraftChallengeId(challengeId);
            console.log("Stored draft challenge ID:", challengeId);
          } else if (action === "publish") {
            // Clear draft ID after successful publish
            setDraftChallengeId(null);
            console.log("Cleared draft ID after successful publish");
          }
        } else if (action === "save_draft" && !draftChallengeId) {
          // If this was a new draft save but no ID returned, log warning
          console.warn("No challenge ID returned from save_draft API call");
        }

        const message =
          action === "save_draft"
            ? "Challenge saved as draft successfully! You can continue editing or click 'Publish Challenge' to make it live."
            : isUpdate
            ? "Draft challenge published successfully! Students can now access and solve this challenge."
            : "Challenge published successfully! Students can now access and solve this challenge.";

        return {
          success: true,
          message: responseData.message || message,
          data: responseData,
          challengeId: responseData.id,
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
          // Handle validation errors like {"errors":{"title":"A challenge with this title already exists"}}
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
        } challenge: ${specificError}`;

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
      } challenge: ${error instanceof Error ? error.message : "Network error"}`;

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

  const resetDraft = () => {
    setDraftChallengeId(null);
  };

  return {
    isSubmitting,
    error,
    saveDraft,
    publishChallenge,
    clearError,
    draftChallengeId,
    resetDraft,
    hasDraft: !!draftChallengeId,
  };
};
