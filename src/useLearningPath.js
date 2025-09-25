/**
 * useLearningPath Custom Hook
 *
 * This custom React hook manages a user's personalized learning path, fetching and transforming
 * data from the backend API to provide a structured progression through challenges and quizzes.
 *
 * Key Features:
 * - Fetches personalized learning path data based on user ID
 * - Transforms raw API data into UI-ready format with icons, colors, and progress indicators
 * - Manages loading states during data fetching operations
 * - Handles API errors with appropriate error messages and fallbacks
 * - Provides refresh functionality for manual data updates
 * - Automatically fetches data when user ID becomes available
 * - Includes timeout protection to prevent infinite loading states
 * - Supports both challenges and quizzes with different visual treatments
 *
 * Data Transformation:
 * - Maps API status to user-friendly labels and progress percentages
 * - Assigns appropriate icons based on item type and completion status
 * - Applies color schemes and styling based on progress state
 * - Maintains original API data for reference while providing UI enhancements
 *
 * Learning Path States:
 * - "completed": Items user has successfully finished (100% progress, green styling)
 * - "in_progress": Items user is currently working on (partial progress, blue styling)
 * - "not_started": Items user hasn't begun yet (0% progress, gray styling)
 *
 * Usage:
 * const { learningPath, loading, error, fetchLearningPath, refreshLearningPath } = useLearningPath();
 *
 * Dependencies:
 * - useUser hook for current user information
 * - Lucide React icons for visual indicators
 * - External API endpoint for learning path data
 */

import {
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing user's learning path data and progress tracking
 * @returns {Object} Object containing learning path state, loading state, error state, and utility functions
 */
export const useLearningPath = () => {
  // Get user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main state array containing the user's learning path items
  // Each item represents a challenge or quiz with progress information
  const [learningPath, setLearningPath] = useState([]);

  // Loading state to show spinners/loading indicators while fetching data
  const [loading, setLoading] = useState(true);

  // Error state to store any API errors or validation failures
  const [error, setError] = useState(null);

  /**
   * Helper function to validate if a user ID is valid and usable
   * Ensures the ID exists, is a string, and contains meaningful content
   * @param {*} id - The user ID to validate
   * @returns {boolean} True if the user ID is valid, false otherwise
   */
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    return isValid;
  };

  /**
   * Transforms raw API learning path data into UI-ready format
   * Maps API status codes to user-friendly labels, progress percentages, icons, and styling
   * @param {Array} apiItems - Array of learning path items from the API
   * @returns {Array} Transformed array with UI enhancements and styling information
   */
  const transformLearningPathData = useCallback((apiItems) => {
    return apiItems.map((item, index) => {
      // Initialize variables for status display and styling
      let status, progress, icon, color, bgColor, borderColor;

      // Map API status to UI representation with appropriate styling
      switch (item.status) {
        case "completed":
          // Item has been successfully completed by the user
          status = "Completed";
          progress = 100; // Full completion
          icon = CheckCircle;
          color = "text-green-600"; // Green text for success
          bgColor = "bg-gradient-to-r from-green-100 to-emerald-100"; // Green gradient background
          borderColor = "border-green-300"; // Green border
          break;

        case "in_progress":
          // Item is currently being worked on by the user
          status = "In progress";
          progress = 65; // Default partial progress for in-progress items
          icon = Clock;
          color = "text-cyan-600"; // Blue text for active state
          bgColor = "bg-gradient-to-r from-cyan-100 to-blue-100"; // Blue gradient background
          borderColor = "border-cyan-300"; // Blue border
          break;

        case "not_started":
        default:
          // Item has not been started yet (locked or available)
          status = "Not started";
          progress = 0; // No progress made
          icon = AlertCircle;
          color = "text-gray-500"; // Gray text for inactive state
          bgColor = "bg-gradient-to-r from-gray-100 to-slate-100"; // Gray gradient background
          borderColor = "border-gray-300"; // Gray border
          break;
      }

      // Override icon based on item type and status for more specific visual indicators
      if (item.type === "challenge") {
        // Challenge items get trophy/check icons based on completion
        icon =
          item.status === "completed"
            ? CheckCircle // Completed challenges show check mark
            : item.status === "in_progress"
            ? Trophy // Active challenges show trophy
            : AlertCircle; // Locked challenges show alert
      } else if (item.type === "quiz") {
        // Quiz items get graduation cap/check icons based on completion
        icon =
          item.status === "completed"
            ? CheckCircle // Completed quizzes show check mark
            : item.status === "in_progress"
            ? GraduationCap // Active quizzes show graduation cap
            : AlertCircle; // Locked quizzes show alert
      }

      // Return transformed item with both original API data and UI enhancements
      return {
        id: item.id, // Unique identifier from API
        title: item.title, // Display title from API
        status, // User-friendly status label
        progress, // Progress percentage (0-100)
        icon, // Lucide React icon component
        color, // CSS class for text color
        bgColor, // CSS class for background gradient
        borderColor, // CSS class for border color
        type: item.type, // Original type (challenge/quiz)
        originalStatus: item.status, // Preserve original API status for reference
      };
    });
  }, []); // No dependencies - this function is pure

  /**
   * Fetches learning path data from the API for a given user
   * Handles complete request lifecycle including validation, error handling, and state updates
   * @param {string} userIdToUse - Optional user ID to use instead of the hook's userId
   */
  const fetchLearningPath = useCallback(
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
        const apiUrl = `https://isipython-dev.onrender.com/api/dashboard/learning-path?user_id=${targetUserId}`;

        // Make the API request
        const response = await fetch(apiUrl);

        // Check if the HTTP response indicates success
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();

        // Validate that the response has the expected structure with array data
        if (result && result.data && Array.isArray(result.data)) {
          // Transform the raw API data into UI-ready format
          const transformedData = transformLearningPathData(result.data);

          // Update state with the transformed learning path data
          setLearningPath(transformedData);
        } else {
          // Handle case where API response doesn't have expected structure
          setError("Invalid response format");
          // Set empty array as fallback to prevent UI issues
          setLearningPath([]);
        }
      } catch (error) {
        // Handle any errors that occurred during the API call
        // This includes network errors, JSON parsing errors, and HTTP errors
        setError(error.message);
        // Set empty array on error to ensure consistent UI state
        setLearningPath([]);
      } finally {
        // Always set loading to false when the API call completes
        // This happens regardless of success or failure
        setLoading(false);
      }
    },
    [userId, transformLearningPathData] // Dependencies - recreate when userId or transform function changes
  );

  /**
   * Convenience function to refresh the current user's learning path
   * Simply calls fetchLearningPath without parameters to use the current userId
   */
  const refreshLearningPath = useCallback(async () => {
    await fetchLearningPath();
  }, [fetchLearningPath]); // Dependency on fetchLearningPath ensures it uses the latest version

  /**
   * Main effect hook that triggers learning path fetching when user ID becomes available
   * Only runs when userId changes to avoid unnecessary API calls
   */
  useEffect(() => {
    // Check if we have a valid user ID
    if (isValidUserId(userId)) {
      // Valid user ID found, fetch the learning path
      fetchLearningPath(userId);
    }
    // If no valid user ID yet, keep loading state and wait
    // The timeout effect below will handle cases where userId never becomes valid
  }, [userId, fetchLearningPath]); // Re-run when userId or fetchLearningPath changes

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
        // Stop loading and set appropriate error message and empty data
        setLoading(false);
        setError("Timeout: Unable to load user data");
        setLearningPath([]); // Ensure UI has consistent empty state
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
    learningPath, // The transformed learning path data with UI enhancements
    loading, // Whether data is currently being fetched
    error, // Any error that occurred during fetching

    // Action functions that components can call
    fetchLearningPath, // Function to fetch learning path for a specific user ID
    refreshLearningPath, // Function to refresh the current user's learning path
  };
};
