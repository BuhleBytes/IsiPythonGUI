import { useEffect, useState } from "react";

// API response structure for individual challenges
interface ApiChallenge {
  id: string;
  title: string;
  short_description: string;
  difficulty_level: "Easy" | "Medium" | "Hard";
  reward_points: number;
  estimated_time: number | null;
  tags: string[];
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
  problem_statement: string;
  send_notifications?: boolean;
  statistics?: {
    pass_rate: number;
    submissions_count: number;
    users_attempted: number;
    users_completed: number;
  };
}

// Transformed challenge data structure for frontend use
interface PublishedChallenge {
  id: string;
  title: string;
  shortDescription: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rewardPoints: number;
  estimatedTime: number;
  tags: string[];
  testCases: number;
  createdAt: string;
  lastModified: string;
  publishedAt: string;
  problemDescription?: string;
  sendNotifications?: boolean;
  statistics: {
    passRate: number;
    submissionsCount: number;
    usersAttempted: number;
    usersCompleted: number;
  };
}

// API response wrapper for challenges list
interface ApiResponse {
  data: ApiChallenge[];
  total_count: number;
  message: string;
  filters_applied: {
    limit: number;
    offset: number;
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
interface UsePublishedChallengesReturn {
  publishedChallenges: PublishedChallenge[];
  loading: boolean;
  error: string | null;
  deletingIds: Set<string>;
  refetch: () => void;
  deleteChallenge: (challengeId: string) => Promise<boolean>;
}

export const usePublishedChallenges = (): UsePublishedChallengesReturn => {
  const [publishedChallenges, setPublishedChallenges] = useState<
    PublishedChallenge[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Converts API challenge format to frontend-friendly format
  const transformApiChallengeToLocal = (
    apiChallenge: ApiChallenge
  ): PublishedChallenge => {
    return {
      id: apiChallenge.id,
      title: apiChallenge.title,
      shortDescription:
        apiChallenge.short_description || "No description provided",
      difficulty: apiChallenge.difficulty_level,
      rewardPoints: apiChallenge.reward_points,
      estimatedTime: apiChallenge.estimated_time || 30,
      tags: apiChallenge.tags || [],
      // Generate mock test cases count (2-6 cases) - TODO: get from API
      testCases: Math.floor(Math.random() * 5) + 2,
      // Extract date portion only for display
      createdAt: apiChallenge.created_at.split("T")[0],
      lastModified: apiChallenge.updated_at.split("T")[0],
      publishedAt:
        apiChallenge.published_at?.split("T")[0] ||
        apiChallenge.updated_at.split("T")[0],
      problemDescription: apiChallenge.problem_statement,
      sendNotifications: apiChallenge.send_notifications ?? true,
      statistics: {
        passRate: apiChallenge.statistics?.pass_rate || 0,
        submissionsCount: apiChallenge.statistics?.submissions_count || 0,
        usersAttempted: apiChallenge.statistics?.users_attempted || 0,
        usersCompleted: apiChallenge.statistics?.users_completed || 0,
      },
    };
  };

  // Fetches all challenges and filters for published ones
  const fetchPublishedChallenges = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/challenges?order_by=created_at&order_direction=desc`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch challenges: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiResponse = await response.json();

      // Filter for published challenges only and transform to local format
      const published = data.data
        .filter((challenge) => challenge.status === "published")
        .map(transformApiChallengeToLocal);

      setPublishedChallenges(published);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Deletes a challenge and updates local state optimistically
  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    // Track deletion state for UI feedback
    setDeletingIds((prev) => new Set([...prev, challengeId]));

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const deleteUrl = `${apiBaseUrl}/api/admin/challenges/${challengeId}`;

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

        throw new Error(`Failed to delete challenge: ${errorMessage}`);
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
      setPublishedChallenges((prev) =>
        prev.filter((challenge) => challenge.id !== challengeId)
      );

      return true;
    } catch (error) {
      // Show error temporarily, then auto-clear
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete challenge";
      setError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);

      return false;
    } finally {
      // Remove from deleting state regardless of outcome
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  // Manually triggers a refetch of challenges data
  const refetch = () => {
    fetchPublishedChallenges();
  };

  // Fetch challenges on component mount
  useEffect(() => {
    fetchPublishedChallenges();
  }, []);

  return {
    publishedChallenges,
    loading,
    error,
    deletingIds,
    refetch,
    deleteChallenge,
  };
};
