import { useEffect, useState } from "react";

// Types for the API response
interface OverviewStat {
  count: number;
  growth_percentage: number;
  new_this_week: number;
}

interface RecentChallenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "published" | "draft";
}

interface RecentQuiz {
  id: string;
  title: string;
  status: "published" | "draft";
  total_questions: number;
}

interface DashboardOverview {
  active_challenges: OverviewStat;
  active_quizzes: OverviewStat;
  total_students: OverviewStat;
  total_submissions: OverviewStat;
}

interface DashboardData {
  overview: DashboardOverview;
  recent_challenges: RecentChallenge[];
  recent_quizzes: RecentQuiz[];
}

interface ApiResponse {
  data: DashboardData;
  message: string;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const BASE_URL = "https://isipython-dev.onrender.com";

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (): Promise<void> => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
