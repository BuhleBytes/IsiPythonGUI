import { useEffect, useState } from "react";

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

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

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
      testCases: Math.floor(Math.random() * 5) + 2, // Mock test cases count
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

  const fetchPublishedChallenges = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Fetching published challenges from API...");

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/challenges?order_by=created_at&order_direction=desc`
      );

      console.log("🔥 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `Failed to fetch challenges: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiResponse = await response.json();
      console.log("✅ API Response data:", data);

      const published = data.data
        .filter((challenge) => challenge.status === "published")
        .map(transformApiChallengeToLocal);

      console.log(
        `📋 Found ${published.length} published challenges:`,
        published
      );
      setPublishedChallenges(published);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("💥 Error fetching published challenges:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    console.log("🗑️ Attempting to delete published challenge:", challengeId);

    // Add to deleting set
    setDeletingIds((prev) => new Set([...prev, challengeId]));

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const deleteUrl = `${apiBaseUrl}/api/admin/challenges/${challengeId}`;

      console.log("🌍 DELETE request to:", deleteUrl);

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔥 Delete response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorText = await response.text();
          console.error("❌ Delete error response:", errorText);

          // Try to parse error response
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If not JSON, use the text as error message
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch {
          // If we can't read the response, use the status text
        }

        throw new Error(`Failed to delete challenge: ${errorMessage}`);
      }

      // Parse response if it exists
      let responseData: DeleteResponse = { success: true };
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch {
        // Response might be empty, which is fine for DELETE
        console.log(
          "ℹ️ Empty or non-JSON response from delete API (this is normal)"
        );
      }

      console.log("✅ Delete response:", responseData);

      // Remove the challenge from local state immediately for better UX
      setPublishedChallenges((prev) =>
        prev.filter((challenge) => challenge.id !== challengeId)
      );

      console.log("🎉 Published challenge deleted successfully:", challengeId);
      return true;
    } catch (error) {
      console.error("💥 Error deleting published challenge:", error);

      // Set a temporary error state that will be cleared
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete challenge";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);

      return false;
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  const refetch = () => {
    console.log("🔄 Refetching published challenges...");
    fetchPublishedChallenges();
  };

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
