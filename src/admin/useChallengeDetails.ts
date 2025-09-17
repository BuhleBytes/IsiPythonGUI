import { useEffect, useState } from "react";

// API response structure for individual test cases
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

// API response structure for complete challenge details
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

// Transformed challenge data structure used throughout the app
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

// Simplified test case structure for frontend use
interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string;
  isHidden: boolean;
  isExample: boolean;
  pointsWeight: number;
}

// API wrapper response structure
interface ApiDetailResponse {
  data: ApiChallengeDetails;
  message: string;
}

// Hook return type definition
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

  // Converts API response format to frontend-friendly format
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
      // Transform test cases and convert input data to JSON string
      testCases: apiChallenge.test_cases.map((testCase) => ({
        id: testCase.id,
        input: JSON.stringify(testCase.input_data), // Convert array to JSON string
        expectedOutput: testCase.expected_output,
        explanation: testCase.explanation,
        isHidden: testCase.is_hidden,
        isExample: testCase.is_example,
        pointsWeight: testCase.points_weight,
      })),
      // Extract date portion only for display
      createdAt: apiChallenge.created_at.split("T")[0],
      lastModified: apiChallenge.updated_at.split("T")[0],
      status: apiChallenge.status,
    };
  };

  // Fetches challenge details from API and handles loading states
  const fetchChallengeDetails = async () => {
    if (!challengeId) return;

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const response = await fetch(
        `${apiBaseUrl}/api/admin/challenges/${challengeId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch challenge details: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiDetailResponse = await response.json();
      const transformedChallenge = transformApiChallengeToLocal(data.data);
      setChallenge(transformedChallenge);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manually triggers a refetch of challenge data
  const refetch = () => {
    fetchChallengeDetails();
  };

  // Fetch challenge details when challengeId changes
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
