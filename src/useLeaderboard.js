/**
 * Leaderboard Custom Hooks
 *
 * This file provides a collection of React custom hooks for managing leaderboard data
 * from the backend API. It includes hooks for both challenges and quizzes leaderboards,
 * as well as a combined hook that manages both simultaneously.
 *
 * Key Features:
 * - Fetches leaderboard data from REST API endpoints
 * - Manages loading states during API requests
 * - Handles API errors with appropriate error messages
 * - Provides refetch functionality for manual data refresh
 * - Automatically fetches data on component mount
 * - Combines multiple leaderboards with unified loading/error states
 *
 * Available Hooks:
 * - useChallengesLeaderboard: Manages challenges leaderboard data
 * - useQuizzesLeaderboard: Manages quizzes leaderboard data
 * - useLeaderboards: Combined hook that manages both leaderboards
 *
 * Data Structure:
 * Each leaderboard contains an array of user entries with rankings, scores,
 * and user information sorted by performance.
 *
 * Usage:
 * // Single leaderboard
 * const { data, loading, error, refetch } = useChallengesLeaderboard();
 *
 * // Combined leaderboards
 * const { challenges, quizzes, loading, hasError, refetchAll } = useLeaderboards();
 *
 * API Endpoints:
 * - GET /api/challenges/leaderboard - Returns challenges leaderboard
 * - GET /api/quizzes/leaderboard - Returns quizzes leaderboard
 */

import { useEffect, useState } from "react";

// Base URL for the API endpoints
// This should be moved to environment variables for different deployment environments
const BASE_URL = "https://isipython-dev.onrender.com";

/**
 * Custom hook for managing challenges leaderboard data
 * Fetches and manages the leaderboard showing top performers in coding challenges
 *
 * @returns {Object} Object containing:
 *   - data: Array of leaderboard entries for challenges
 *   - loading: Boolean indicating if data is being fetched
 *   - error: String containing error message if request fails
 *   - refetch: Function to manually refresh the leaderboard data
 */
export const useChallengesLeaderboard = () => {
  // State to store the leaderboard data array
  // Initially empty array until data is fetched from API
  const [data, setData] = useState([]);

  // Loading state to indicate when API request is in progress
  // Starts as true since we fetch data immediately on mount
  const [loading, setLoading] = useState(true);

  // Error state to store any error messages from failed API requests
  // Null when no errors have occurred
  const [error, setError] = useState(null);

  /**
   * Async function to fetch challenges leaderboard data from the API
   * Handles the complete request lifecycle including loading states and error handling
   */
  const fetchChallengesLeaderboard = async () => {
    try {
      // Set loading state to true and clear any previous errors
      setLoading(true);
      setError(null);

      // Make HTTP GET request to the challenges leaderboard endpoint
      const response = await fetch(`${BASE_URL}/api/challenges/leaderboard`);

      // Check if the HTTP response indicates success (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response from the server
      const result = await response.json();

      // Extract leaderboard data from the response structure
      // Use fallback empty array if data is missing or malformed
      setData(result.data?.leaderboard || []);
    } catch (err) {
      // Store error message in state for display to user
      setError(err.message);
      // Note: Removed console.error to keep production code clean
      // Error is still captured in state for UI display
    } finally {
      // Always set loading to false when request completes
      // This runs regardless of success or failure
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch leaderboard data when component mounts
   * Empty dependency array means this only runs once after initial render
   */
  useEffect(() => {
    fetchChallengesLeaderboard();
  }, []);

  /**
   * Public function to manually refresh the leaderboard data
   * Useful for refresh buttons or periodic updates
   */
  const refetch = () => {
    fetchChallengesLeaderboard();
  };

  // Return the hook's public API
  return { data, loading, error, refetch };
};

/**
 * Custom hook for managing quizzes leaderboard data
 * Fetches and manages the leaderboard showing top performers in quizzes
 *
 * @returns {Object} Object containing:
 *   - data: Array of leaderboard entries for quizzes
 *   - loading: Boolean indicating if data is being fetched
 *   - error: String containing error message if request fails
 *   - refetch: Function to manually refresh the leaderboard data
 */
export const useQuizzesLeaderboard = () => {
  // State to store the leaderboard data array
  // Initially empty array until data is fetched from API
  const [data, setData] = useState([]);

  // Loading state to indicate when API request is in progress
  // Starts as true since we fetch data immediately on mount
  const [loading, setLoading] = useState(true);

  // Error state to store any error messages from failed API requests
  // Null when no errors have occurred
  const [error, setError] = useState(null);

  /**
   * Async function to fetch quizzes leaderboard data from the API
   * Handles the complete request lifecycle including loading states and error handling
   */
  const fetchQuizzesLeaderboard = async () => {
    try {
      // Set loading state to true and clear any previous errors
      setLoading(true);
      setError(null);

      // Make HTTP GET request to the quizzes leaderboard endpoint
      const response = await fetch(`${BASE_URL}/api/quizzes/leaderboard`);

      // Check if the HTTP response indicates success (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response from the server
      const result = await response.json();

      // Extract leaderboard data from the response structure
      // Use fallback empty array if data is missing or malformed
      setData(result.data?.leaderboard || []);
    } catch (err) {
      // Store error message in state for display to user
      setError(err.message);
      // Note: Removed console.error to keep production code clean
      // Error is still captured in state for UI display
    } finally {
      // Always set loading to false when request completes
      // This runs regardless of success or failure
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch leaderboard data when component mounts
   * Empty dependency array means this only runs once after initial render
   */
  useEffect(() => {
    fetchQuizzesLeaderboard();
  }, []);

  /**
   * Public function to manually refresh the leaderboard data
   * Useful for refresh buttons or periodic updates
   */
  const refetch = () => {
    fetchQuizzesLeaderboard();
  };

  // Return the hook's public API
  return { data, loading, error, refetch };
};

/**
 * Combined custom hook that manages both challenges and quizzes leaderboards
 * Provides a unified interface when components need access to both leaderboards
 *
 * This hook internally uses both individual leaderboard hooks and provides:
 * - Access to both leaderboard datasets
 * - Combined loading state (true if either is loading)
 * - Combined error state (true if either has an error)
 * - Unified refetch function for both leaderboards
 *
 * @returns {Object} Object containing:
 *   - challenges: Complete return object from useChallengesLeaderboard
 *   - quizzes: Complete return object from useQuizzesLeaderboard
 *   - refetchAll: Function to refresh both leaderboards simultaneously
 *   - loading: Boolean true if either leaderboard is loading
 *   - hasError: Boolean true if either leaderboard has an error
 */
export const useLeaderboards = () => {
  // Use individual leaderboard hooks to get their complete functionality
  const challenges = useChallengesLeaderboard();
  const quizzes = useQuizzesLeaderboard();

  /**
   * Function to refresh both leaderboards simultaneously
   * Useful when you want to ensure both datasets are current
   */
  const refetchAll = () => {
    challenges.refetch();
    quizzes.refetch();
  };

  // Return combined interface with both individual hooks plus unified states
  return {
    // Individual leaderboard objects with their complete APIs
    challenges, // { data, loading, error, refetch }
    quizzes, // { data, loading, error, refetch }

    // Unified action functions
    refetchAll, // Function to refresh both leaderboards

    // Unified state indicators
    loading: challenges.loading || quizzes.loading, // True if either is loading
    hasError: challenges.error || quizzes.error, // True if either has an error
  };
};
