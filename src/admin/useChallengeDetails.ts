import { useEffect, useState } from "react";

interface ApiTestCase {
  id: string;
  challenge_id: string;
  input_data: string[];
  expected_output: string;
  explanation: string;
  is_example: boolean;
  is_hidden: boolean;
  points_weight: number;
  created_at: string;
}

interface ApiChallengeDetails {
  id: string;
  title: string;
  short_description: string;
  problem_statement: string;
  difficulty_level: "Easy" | "Medium" | "Hard";
  reward_points: number;
  estimated_time: number;
  tags: string[];
  status: "draft" | "published";
  send_notifications: boolean;
  test_cases: ApiTestCase[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  slug: string;
  search_vector: string;
}

interface DetailedChallenge {
  id: string;
  title: string;
  shortDescription: string;
  problemDescription: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rewardPoints: number;
  estimatedTime: number;
  tags: string[];
  sendNotifications: boolean;
  testCases: TestCase[];
  createdAt: string;
  lastModified: string;
  status: "draft" | "published";
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string;
  isHidden: boolean;
  isExample: boolean;
  pointsWeight: number;
}

interface ApiDetailResponse {
  data: ApiChallengeDetails;
  message: string;
}

interface UseChallengeDetailsReturn {
  challenge: DetailedChallenge | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useChallengeDetails = (
  challengeId: string
): UseChallengeDetailsReturn => {
  const [challenge, setChallenge] = useState<DetailedChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiChallengeToLocal = (
    apiChallenge: ApiChallengeDetails
  ): DetailedChallenge => {
    return {
      id: apiChallenge.id,
      title: apiChallenge.title,
      shortDescription:
        apiChallenge.short_description || "No description provided",
      problemDescription: apiChallenge.problem_statement,
      difficulty: apiChallenge.difficulty_level,
      rewardPoints: apiChallenge.reward_points,
      estimatedTime: apiChallenge.estimated_time || 30,
      tags: apiChallenge.tags || [],
      sendNotifications: apiChallenge.send_notifications ?? true,
      testCases: apiChallenge.test_cases.map((testCase) => ({
        id: testCase.id,
        input: JSON.stringify(testCase.input_data), // Convert array to JSON string
        expectedOutput: testCase.expected_output,
        explanation: testCase.explanation,
        isHidden: testCase.is_hidden,
        isExample: testCase.is_example,
        pointsWeight: testCase.points_weight,
      })),
      createdAt: apiChallenge.created_at.split("T")[0],
      lastModified: apiChallenge.updated_at.split("T")[0],
      status: apiChallenge.status,
    };
  };

  const fetchChallengeDetails = async () => {
    if (!challengeId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 Fetching challenge details for ID: ${challengeId}`);

      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/challenges/${challengeId}`
      );

      console.log("📥 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `Failed to fetch challenge details: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiDetailResponse = await response.json();
      console.log("✅ API Response data:", data);

      const transformedChallenge = transformApiChallengeToLocal(data.data);
      console.log("🔄 Transformed challenge:", transformedChallenge);

      setChallenge(transformedChallenge);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("💥 Error fetching challenge details:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log(`🔄 Refetching challenge details for ID: ${challengeId}`);
    fetchChallengeDetails();
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, [challengeId]);

  return {
    challenge,
    loading,
    error,
    refetch,
  };
};
