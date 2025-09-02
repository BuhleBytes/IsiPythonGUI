import { useEffect, useState } from "react";

const BASE_URL = "https://isipython-dev.onrender.com";

// Hook for challenges leaderboard
export const useChallengesLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallengesLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/challenges/leaderboard`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data?.leaderboard || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching challenges leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesLeaderboard();
  }, []);

  const refetch = () => {
    fetchChallengesLeaderboard();
  };

  return { data, loading, error, refetch };
};

// Hook for quizzes leaderboard
export const useQuizzesLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzesLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/quizzes/leaderboard`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data?.leaderboard || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching quizzes leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesLeaderboard();
  }, []);

  const refetch = () => {
    fetchQuizzesLeaderboard();
  };

  return { data, loading, error, refetch };
};

// Combined hook for both leaderboards
export const useLeaderboards = () => {
  const challenges = useChallengesLeaderboard();
  const quizzes = useQuizzesLeaderboard();

  const refetchAll = () => {
    challenges.refetch();
    quizzes.refetch();
  };

  return {
    challenges,
    quizzes,
    refetchAll,
    loading: challenges.loading || quizzes.loading,
    hasError: challenges.error || quizzes.error,
  };
};
