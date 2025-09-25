/**
 * useDashboardStats Custom Hook
 *
 * This custom React hook manages the dashboard statistics for a user, providing
 * a centralized way to fetch, store, and refresh user progress data including
 * challenges completed, quizzes attempted, and overall progress metrics.
 *
 * Key Features:
 * - Fetches dashboard statistics from the API based on user ID
 * - Manages loading states during data fetching
 * - Handles API errors with appropriate error messages
 * - Provides refresh functionality to reload stats on demand
 * - Automatically fetches stats when user ID becomes available
 * - Includes timeout protection to prevent infinite loading states
 * - Returns structured data for challenges, quizzes, and overall progress
 *
 * Data Structure:
 * - challenges: completed count, progress percentage, weekly stats, total available
 * - quizzes: attempted count, progress percentage, weekly stats, total available
 * - overall: total completed items, progress message, progress percentage, total items
 *
 * Usage:
 * const { stats, loading, error, fetchStats, refreshStats } = useDashboardStats();
 *
 * Dependencies:
 * - useUser hook for getting current user ID and login status
 * - External API endpoint for dashboard statistics
 */

import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing dashboard statistics and user progress data
 * @returns {Object} Object containing stats state, loading state, error state, and utility functions
 */
export const useDashboardStats = () => {
  // Get user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main state object containing all dashboard statistics
  // Structured to match the API response format with default values
  const [stats, setStats] = useState({
    challenges: {
      completed: 0, // Number of challenges the user has completed
      progress: 0, // Progress percentage for challenges (0-100)
      this_week: 0, // Number of challenges completed this week
      total: 0, // Total number of challenges available
    },
    quizzes: {
      attempted: 0, // Number of quizzes the user has attempted
      progress: 0, // Progress percentage for quizzes (0-100)
      this_week: 0, // Number of quizzes attempted this week
      total: 0, // Total number of quizzes available
    },
    overall: {
      completed_items: 0, // Total completed items (challenges + quizzes)
      message: "Just getting started!", // Motivational message based on progress
      progress: 0, // Overall progress percentage (0-100)
      total_items: 0, // Total items available (challenges + quizzes)
    },
  });

  // Loading state to show spinners/loading indicators while fetching data
  const [loading, setLoading] = useState(true);

  // Error state to store any API errors or validation failures
  const [error, setError] = useState(null);

  /**
   * Helper function to validate if a user ID is valid and usable
   * Checks that the ID exists, is a string, and has meaningful content
   * @param {*} id - The user ID to validate
   * @returns {boolean} True if the user ID is valid, false otherwise
   */
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    return isValid;
  };

  /**
   * Fetches dashboard statistics from the API for a given user
   * Handles all API communication, error handling, and state updates
   * @param {string} userIdToUse - Optional user ID to use instead of the hook's userId
   */
  const fetchStats = useCallback(
    async (userIdToUse) => {
      // Determine which user ID to use - parameter takes precedence over hook's userId
      const targetUserId = userIdToUse || userId;

      // Validate user ID before making API call
      // If invalid, set appropriate error state and exit early
      if (!isValidUserId(targetUserId)) {
        setLoading(false);
        setError("Invalid user ID");
        return;
      }

      try {
        // Set loading state and clear any previous errors
        setLoading(true);
        setError(null);

        // Construct API URL with user ID as query parameter
        const apiUrl = `https://isipython-dev.onrender.com/api/dashboard/stats?user_id=${targetUserId}`;

        // Make the API request
        const response = await fetch(apiUrl);

        // Check if the HTTP response indicates success
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();

        // Validate that the response has the expected structure
        if (result && result.data) {
          // Update state with new stats from the API response
          // Use fallback values (|| 0 or default message) in case any fields are missing
          setStats({
            challenges: {
              completed: result.data.challenges?.completed || 0,
              progress: result.data.challenges?.progress || 0,
              this_week: result.data.challenges?.this_week || 0,
              total: result.data.challenges?.total || 0,
            },
            quizzes: {
              attempted: result.data.quizzes?.attempted || 0,
              progress: result.data.quizzes?.progress || 0,
              this_week: result.data.quizzes?.this_week || 0,
              total: result.data.quizzes?.total || 0,
            },
            overall: {
              completed_items: result.data.overall?.completed_items || 0,
              message: result.data.overall?.message || "Just getting started!",
              progress: result.data.overall?.progress || 0,
              total_items: result.data.overall?.total_items || 0,
            },
          });
        } else {
          // Handle case where API response doesn't have expected structure
          setError("Invalid response format");
        }
      } catch (error) {
        // Handle any errors that occurred during the API call
        // This includes network errors, JSON parsing errors, and HTTP errors
        setError(error.message);
      } finally {
        // Always set loading to false when the API call completes
        // This happens regardless of success or failure
        setLoading(false);
      }
    },
    [userId] // Dependency array - recreate callback when userId changes
  );

  /**
   * Convenience function to refresh the current user's statistics
   * Simply calls fetchStats without parameters to use the current userId
   */
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]); // Dependency on fetchStats ensures it uses the latest version

  /**
   * Main effect hook that triggers stats fetching when user ID becomes available
   * Only runs when userId changes to avoid unnecessary API calls
   */
  useEffect(() => {
    // Check if we have a valid user ID
    if (isValidUserId(userId)) {
      // Valid user ID found, fetch the stats
      fetchStats(userId);
    }
    // If no valid user ID yet, keep loading state and wait
    // The timeout effect below will handle cases where userId never becomes valid
  }, [userId, fetchStats]); // Re-run when userId or fetchStats changes

  /**
   * Timeout effect to prevent infinite loading states
   * If no valid user ID is available after 10 seconds, stop loading and show error
   * This prevents the UI from being stuck in a perpetual loading state
   */
  useEffect(() => {
    // Set up a timeout to handle cases where userId never becomes valid
    const timeout = setTimeout(() => {
      // Check if we're still loading and don't have a valid user ID
      if (loading && !isValidUserId(userId)) {
        // Stop loading and set an appropriate error message
        setLoading(false);
        setError("Timeout: Unable to load user data");
      }
    }, 10000); // 10 second timeout

    // Cleanup function to clear the timeout when the effect is cleaned up
    // This prevents the timeout from firing if the component unmounts or dependencies change
    return () => {
      clearTimeout(timeout);
    };
  }, [loading, userId, isLoggedIn]); // Re-run when these dependencies change

  // Return the hook's public API
  return {
    // State values that components can read
    stats, // The current dashboard statistics
    loading, // Whether data is currently being fetched
    error, // Any error that occurred during fetching

    // Action functions that components can call
    fetchStats, // Function to fetch stats for a specific user ID
    refreshStats, // Function to refresh the current user's stats
  };
};
