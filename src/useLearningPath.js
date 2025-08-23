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
 * Custom hook for managing learning path data
 * @returns {Object} - Object containing learning path state and operations
 */
export const useLearningPath = () => {
  const { userId, isLoggedIn } = useUser();
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to check if userId is valid
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    console.log("🔍 DEBUG - isValidUserId check:", { id, isValid });
    return isValid;
  };

  // Transform API learning path data to our format
  const transformLearningPathData = useCallback((apiItems) => {
    return apiItems.map((item, index) => {
      // Determine status and progress based on API status
      let status, progress, icon, color, bgColor, borderColor;

      switch (item.status) {
        case "completed":
          status = "Completed"; // Completed in isiXhosa
          progress = 100;
          icon = CheckCircle;
          color = "text-green-600";
          bgColor = "bg-gradient-to-r from-green-100 to-emerald-100";
          borderColor = "border-green-300";
          break;
        case "in_progress":
          status = "In progress"; // In Progress in isiXhosa
          progress = 65; // Default progress for in-progress items
          icon = Clock;
          color = "text-cyan-600";
          bgColor = "bg-gradient-to-r from-cyan-100 to-blue-100";
          borderColor = "border-cyan-300";
          break;
        case "not_started":
        default:
          status = "Not started"; // Locked in isiXhosa
          progress = 0;
          icon = AlertCircle;
          color = "text-gray-500";
          bgColor = "bg-gradient-to-r from-gray-100 to-slate-100";
          borderColor = "border-gray-300";
          break;
      }

      // Determine icon based on type
      if (item.type === "challenge") {
        icon =
          item.status === "completed"
            ? CheckCircle
            : item.status === "in_progress"
            ? Trophy
            : AlertCircle;
      } else if (item.type === "quiz") {
        icon =
          item.status === "completed"
            ? CheckCircle
            : item.status === "in_progress"
            ? GraduationCap
            : AlertCircle;
      }

      return {
        id: item.id,
        title: item.title,
        status,
        progress,
        icon,
        color,
        bgColor,
        borderColor,
        type: item.type,
        originalStatus: item.status,
      };
    });
  }, []);

  // Fetch learning path from API
  const fetchLearningPath = useCallback(
    async (userIdToUse) => {
      console.log("📚 =================================");
      console.log("📚 FETCH LEARNING PATH CALLED");
      console.log("📚 =================================");

      const targetUserId = userIdToUse || userId;

      console.log("🔍 DEBUG - Target User ID:", targetUserId);
      console.log("🔍 DEBUG - User ID type:", typeof targetUserId);
      console.log("🔍 DEBUG - User ID valid:", isValidUserId(targetUserId));

      // Proper validation
      if (!isValidUserId(targetUserId)) {
        console.log(
          "❌ DEBUG - Invalid or missing userId, cannot fetch learning path"
        );
        console.log("❌ DEBUG - targetUserId:", targetUserId);
        setLoading(false);
        setError("Invalid user ID");
        return;
      }

      console.log("✅ DEBUG - Valid userId found, proceeding with API call");

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `https://isipython-dev.onrender.com/api/dashboard/learning-path?user_id=${targetUserId}`;
        console.log("🌐 DEBUG - Calling API:", apiUrl);

        const response = await fetch(apiUrl);

        console.log("📡 DEBUG - Response Status:", response.status);
        console.log("📡 DEBUG - Response OK:", response.ok);

        if (!response.ok) {
          console.log("❌ DEBUG - Response not OK, throwing error");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log("📄 DEBUG - Full API Response:", result);

        // Check if the response has the expected structure
        if (result && result.data && Array.isArray(result.data)) {
          console.log("📄 DEBUG - Result Success");
          console.log("📄 DEBUG - Result Message:", result.message);
          console.log("📄 DEBUG - Result Data:", result.data);

          // Transform API data to our format
          const transformedData = transformLearningPathData(result.data);

          console.log(
            "🔄 DEBUG - Transformed learning path data:",
            transformedData
          );

          // Update state with new learning path
          setLearningPath(transformedData);

          console.log("✅ DEBUG - Learning path updated successfully");
        } else {
          console.log("❌ DEBUG - Invalid response format");
          setError("Invalid response format");

          // Fallback to empty array
          setLearningPath([]);
        }
      } catch (error) {
        console.error("💥 DEBUG - ERROR in fetchLearningPath:", error);
        console.error("💥 DEBUG - Error message:", error.message);
        setError(error.message);

        // Set empty array on error
        setLearningPath([]);
      } finally {
        setLoading(false);
        console.log(
          "🏁 DEBUG - fetchLearningPath completed, loading set to false"
        );
      }
    },
    [userId, transformLearningPathData]
  );

  // Refresh learning path
  const refreshLearningPath = useCallback(async () => {
    console.log("🔄 DEBUG - Refresh learning path called");
    await fetchLearningPath();
  }, [fetchLearningPath]);

  // Main useEffect - ONLY triggers when userId changes
  useEffect(() => {
    console.log("🔄 DEBUG - Main useEffect triggered");
    console.log("🔄 DEBUG - userId:", userId);
    console.log("🔄 DEBUG - userId valid:", isValidUserId(userId));
    console.log("🔄 DEBUG - isLoggedIn:", isLoggedIn);

    if (isValidUserId(userId)) {
      console.log("✅ DEBUG - Valid userId found, calling fetchLearningPath");
      fetchLearningPath(userId);
    } else {
      console.log("⏳ DEBUG - No valid userId yet, waiting...");
      // Keep loading true until we get a valid userId
    }
  }, [userId, fetchLearningPath]);

  // Timeout useEffect - prevents infinite loading
  useEffect(() => {
    console.log("⏰ DEBUG - Setting up timeout for loading state");

    const timeout = setTimeout(() => {
      if (loading && !isValidUserId(userId)) {
        console.log("⏰ DEBUG - TIMEOUT: No valid userId after 10 seconds");
        console.log("⏰ DEBUG - Current state:", {
          loading,
          userId,
          isLoggedIn,
        });
        console.log(
          "⏰ DEBUG - Stopping loading and setting empty learning path"
        );
        setLoading(false);
        setError("Timeout: Unable to load user data");
        setLearningPath([]);
      }
    }, 10000); // 10 second timeout

    return () => {
      console.log("⏰ DEBUG - Cleaning up timeout");
      clearTimeout(timeout);
    };
  }, [loading, userId, isLoggedIn]);

  // Debug useEffect for learning path state changes
  useEffect(() => {
    console.log("📚 DEBUG - Learning path state changed:", learningPath);
  }, [learningPath]);

  return {
    // State
    learningPath,
    loading,
    error,

    // Actions
    fetchLearningPath,
    refreshLearningPath,
  };
};
