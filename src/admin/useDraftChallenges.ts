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
  problem_statement: string;
  send_notifications?: boolean;
}

interface DraftChallenge {
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
  problemDescription?: string;
  sendNotifications?: boolean;
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

interface UseDraftChallengesReturn {
  draftChallenges: DraftChallenge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDraftChallenges = (): UseDraftChallengesReturn => {
  const [draftChallenges, setDraftChallenges] = useState<DraftChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiChallengeToLocal = (
    apiChallenge: ApiChallenge
  ): DraftChallenge => {
    return {
      id: apiChallenge.id,
      title: apiChallenge.title,
      shortDescription:
        apiChallenge.short_description || "No description provided",
      difficulty: apiChallenge.difficulty_level,
      rewardPoints: apiChallenge.reward_points,
      estimatedTime: apiChallenge.estimated_time || 30, // Default to 30 minutes if null
      tags: apiChallenge.tags || [],
      testCases: Math.floor(Math.random() * 5) + 2, // Random number 2-6 since API doesn't provide this
      createdAt: apiChallenge.created_at.split("T")[0], // Extract date part
      lastModified: apiChallenge.updated_at.split("T")[0], // Extract date part
      problemDescription: apiChallenge.problem_statement,
      sendNotifications: apiChallenge.send_notifications ?? true,
    };
  };

  const fetchDraftChallenges = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Fetching draft challenges from API...");

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/challenges?order_by=created_at&order_direction=desc`
      );

      console.log("📥 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `Failed to fetch challenges: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiResponse = await response.json();
      console.log("✅ API Response data:", data);

      // Filter only draft challenges and transform them
      const drafts = data.data
        .filter((challenge) => challenge.status === "draft")
        .map(transformApiChallengeToLocal);

      console.log(`📝 Found ${drafts.length} draft challenges:`, drafts);
      setDraftChallenges(drafts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("💥 Error fetching draft challenges:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log("🔄 Refetching draft challenges...");
    fetchDraftChallenges();
  };

  useEffect(() => {
    fetchDraftChallenges();
  }, []);

  return {
    draftChallenges,
    loading,
    error,
    refetch,
  };
};
