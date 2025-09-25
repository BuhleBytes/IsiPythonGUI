/**
 * useUserFiles Custom Hook
 *
 * This comprehensive React custom hook manages all file-related operations for users,
 * including file storage, retrieval, deletion, and organization. It serves as the primary
 * interface for managing user-created code files in the IsiPython programming environment.
 *
 * Key Features:
 * - Fetches and manages user's saved code files from the backend
 * - Transforms raw API data into rich UI-ready format with visual enhancements
 * - Handles file creation, updating, and deletion operations
 * - Provides advanced filtering capabilities by name, type, and time period
 * - Manages file metadata including size estimation and modification dates
 * - Implements visual styling with contextual icons and color schemes
 * - Calculates human-readable relative timestamps (e.g., "2 hours ago")
 * - Supports file search across names and descriptions
 * - Handles loading states and deletion progress tracking
 * - Provides file refresh functionality for data synchronization
 *
 * File Operations:
 * - Create: Save new code files with title and content
 * - Read: Fetch and display user's file collection
 * - Update: Modify existing files with new content
 * - Delete: Remove files with user confirmation
 * - Filter: Search and filter files by various criteria
 *
 * Data Enhancement:
 * - Assigns contextual icons and color schemes for visual variety
 * - Calculates file sizes based on content length
 * - Formats timestamps into human-readable relative time
 * - Ensures consistent file naming with .isi extension
 * - Sorts files by most recent modification date
 * - Provides file type categorization and language detection
 *
 * File Filtering Options:
 * - By name: Search in file names and descriptions
 * - By type: Filter by file type (currently supports IsiPython)
 * - By time period: Today, This Week, This Month, Older
 *
 * Visual Styling:
 * - Rotating selection of 8 different icon/color combinations
 * - Gradient backgrounds and icons for visual appeal
 * - Consistent styling patterns for file organization
 * - Responsive design considerations for various file list sizes
 *
 * Error Handling:
 * - Graceful handling of API failures
 * - User confirmation for destructive operations
 * - Loading state management during operations
 * - Fallback behaviors for missing data
 *
 * Usage:
 * const {
 *   files, loading, deletingFiles,
 *   fetchFiles, deleteFile, saveNewFile, refreshFiles,
 *   getFilteredFiles
 * } = useUserFiles();
 *
 * Dependencies:
 * - useUser hook for current user information
 * - Lucide React icons for file type visualization
 * - External API endpoints for file operations
 * - Browser APIs for file size calculation and confirmation dialogs
 */

import {
  BarChart3,
  Coffee,
  Database,
  FileText,
  Globe,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for comprehensive file management and user file operations
 * @returns {Object} Object containing file state, loading states, and file operation functions
 */
export const useUserFiles = () => {
  // Get current user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main state array containing all user files with enhanced properties
  const [files, setFiles] = useState([]);

  // Loading state for file fetching operations
  const [loading, setLoading] = useState(true);

  // Set to track which files are currently being deleted (for UI feedback)
  const [deletingFiles, setDeletingFiles] = useState(new Set());

  // Predefined visual styles for file display variety
  // Each file gets assigned one of these styles in rotation for visual appeal
  const fileStyles = [
    {
      icon: BarChart3, // Analytics/data visualization icon
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      icon: Globe, // Global/web development icon
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: Coffee, // Casual/creative coding icon
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: Zap, // Performance/energy icon
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: Database, // Data management icon
      gradient: "from-indigo-400 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
    {
      icon: Sparkles, // Creative/special projects icon
      gradient: "from-pink-400 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
    },
    {
      icon: FileText, // General document icon
      gradient: "from-teal-400 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
    },
    {
      icon: Star, // Featured/important files icon
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
  ];

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
   * Transforms raw API file data into enhanced UI-ready format
   * Adds visual styling, calculates derived properties, and formats data for display
   * @param {Object} apiFile - Raw file data from the API
   * @param {number} index - Index of the file in the array (used for style rotation)
   * @returns {Object} Enhanced file object optimized for UI consumption
   */
  const transformFileData = useCallback((apiFile, index) => {
    // Assign visual style based on file index (rotates through available styles)
    const style = fileStyles[index % fileStyles.length];

    // Parse the last updated timestamp for relative time calculation
    const updatedAt = new Date(apiFile.updated_at);
    const now = new Date();
    const timeDiff = now.getTime() - updatedAt.getTime();

    // Calculate relative time components
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    // Generate human-readable relative time string
    let timeAgo = "";
    if (months > 0) {
      timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
    } else if (weeks > 0) {
      timeAgo = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (days > 0) {
      timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      timeAgo = "Just now";
    }

    // Estimate file size based on code content length
    // Creates a Blob to get accurate byte size including Unicode characters
    const sizeInBytes = new Blob([apiFile.data || ""]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);

    // Create comprehensive file object with all enhancements
    const transformedFile = {
      id: apiFile.id, // Unique identifier from API
      // Ensure file name has proper .isi extension
      name: apiFile.title.endsWith(".isi")
        ? apiFile.title
        : `${apiFile.title}.isi`,
      code: apiFile.code || "", // File content/code
      icon: style.icon, // Visual icon component
      time: timeAgo, // Human-readable relative time
      size: `${sizeInKB} KB`, // Formatted file size
      language: "IsiPython", // Programming language
      gradient: style.gradient, // CSS gradient for styling
      bgGradient: style.bgGradient, // Background gradient for containers
      type: "IsiPython", // File type for filtering
      lastModified: updatedAt.toISOString().split("T")[0], // ISO date string (YYYY-MM-DD)
      description: `IsiPython file: ${apiFile.title}`, // Descriptive text
      created_at: apiFile.created_at, // Original creation timestamp
      updated_at: apiFile.updated_at, // Original update timestamp
    };

    return transformedFile;
  }, []); // No dependencies - this function is pure

  /**
   * Fetches user files from the API with comprehensive error handling
   * Transforms raw data and updates component state with enhanced file objects
   * @param {string} userIdToUse - Optional user ID to use instead of the hook's userId
   */
  const fetchFiles = useCallback(
    async (userIdToUse) => {
      // Determine which user ID to use - parameter takes precedence
      const targetUserId = userIdToUse || userId;

      // Validate user ID before making API call
      if (!isValidUserId(targetUserId)) {
        setLoading(false);
        setFiles([]);
        return;
      }

      try {
        // Set loading state for UI feedback
        setLoading(true);

        // Construct API URL for user's saved files
        const apiUrl = `https://isipython-dev.onrender.com/api/saved/${targetUserId}`;

        // Make API request
        const response = await fetch(apiUrl);

        // Check if request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const result = await response.json();

        // Handle different response formats from the API
        let filesData;
        if (result && typeof result === "object" && "data" in result) {
          // Response is wrapped in success/data/message structure
          filesData = result.data;
        } else if (Array.isArray(result)) {
          // Response is the file array directly
          filesData = result;
        } else {
          // Unexpected response format
          setFiles([]);
          return;
        }

        // Validate that we received an array of files
        if (Array.isArray(filesData)) {
          if (filesData.length === 0) {
            // No files found for this user
            setFiles([]);
          } else {
            // Transform all files using the enhancement function
            const transformedFiles = filesData.map(transformFileData);

            // Sort files by most recent modification date (newest first)
            transformedFiles.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );

            // Update state with enhanced file data
            setFiles(transformedFiles);
          }
        } else {
          // Invalid response format - not an array
          setFiles([]);
        }
      } catch (error) {
        // Handle any errors during file fetching
        // Set empty state to prevent UI issues
        setFiles([]);
      } finally {
        // Always reset loading state when operation completes
        setLoading(false);
      }
    },
    [userId, transformFileData] // Dependencies for callback recreation
  );

  /**
   * Deletes a file with user confirmation and optimistic UI updates
   * Handles API communication and state management for file deletion
   * @param {string} fileId - The unique identifier of the file to delete
   * @returns {boolean} True if deletion was successful, false otherwise
   */
  const deleteFile = useCallback(
    async (fileId) => {
      // Validate user ID and get user confirmation before proceeding
      if (
        !isValidUserId(userId) ||
        !window.confirm("Are you sure you want to delete this file?")
      ) {
        return false;
      }

      try {
        // Add file to deleting set for UI feedback (loading indicators)
        setDeletingFiles((prev) => new Set([...prev, fileId]));

        // Construct delete API URL
        const deleteUrl = `https://isipython-dev.onrender.com/api/saved/delete/${fileId}`;

        // Make delete request with user ID in request body
        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        });

        // Check if deletion request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse response to confirm deletion
        const result = await response.json();

        // Check for successful deletion message from API
        if (result.message === "Code deleted successfully") {
          // Remove the file from local state immediately (optimistic update)
          setFiles((prev) => prev.filter((file) => file.id !== fileId));
          return true;
        } else {
          // Handle API error response
          alert(
            "Failed to delete file: " + (result.message || "Unknown error")
          );
          return false;
        }
      } catch (error) {
        // Handle network or other errors
        alert("Error deleting file. Please try again.");
        return false;
      } finally {
        // Always remove the file from deleting state (cleanup loading indicators)
        setDeletingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    },
    [userId] // Dependency for callback recreation
  );

  /**
   * Convenience function to refresh the current user's files
   * Useful for manual refresh triggers and data synchronization
   */
  const refreshFiles = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]); // Dependency ensures it uses the latest fetchFiles

  /**
   * Filters files based on multiple criteria for advanced search functionality
   * Supports text search, file type filtering, and time period filtering
   * @param {string} searchQuery - Text to search in file names and descriptions
   * @param {string} fileType - File type to filter by ("All" for no filter)
   * @param {string} timePeriod - Time period to filter by ("All", "Today", "This Week", etc.)
   * @returns {Array} Filtered array of files matching all criteria
   */
  const getFilteredFiles = useCallback(
    (searchQuery, fileType, timePeriod) => {
      const filtered = files.filter((file) => {
        // Text search matching across name and description
        const matchesSearch =
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description.toLowerCase().includes(searchQuery.toLowerCase());

        // File type matching with "All" option support
        const matchesType = fileType === "All" || file.type === fileType;

        // Time period filtering logic
        let matchesTime = true;
        if (timePeriod !== "All") {
          const now = new Date();
          const fileDate = new Date(file.lastModified);
          const daysDiff = Math.floor(
            (now.getTime() - fileDate.getTime()) / (1000 * 3600 * 24)
          );

          // Apply time period filters
          switch (timePeriod) {
            case "Today":
              matchesTime = daysDiff === 0;
              break;
            case "This Week":
              matchesTime = daysDiff <= 7;
              break;
            case "This Month":
              matchesTime = daysDiff <= 30;
              break;
            case "Older":
              matchesTime = daysDiff > 30;
              break;
          }
        }

        // All criteria must match for file to be included
        return matchesSearch && matchesType && matchesTime;
      });

      return filtered;
    },
    [files] // Dependency on files array for filtering
  );

  /**
   * Saves a new file or updates an existing file
   * Handles both create and update operations based on whether fileId is provided
   * @param {string} title - The title/name for the file
   * @param {string} code - The code content to save
   * @param {string|null} fileId - Optional file ID for updates (null for new files)
   * @returns {Object|null} Server response object or null if operation failed
   */
  const saveNewFile = useCallback(
    async (title, code, fileId = null) => {
      // Validate user ID before attempting to save
      if (!isValidUserId(userId)) {
        return null;
      }

      try {
        // Determine if this is an update or create operation
        const isUpdate = fileId !== null && fileId !== undefined;

        // Construct appropriate API URL and HTTP method
        const url = isUpdate
          ? `https://isipython-dev.onrender.com/api/saved/update/${fileId}`
          : "https://isipython-dev.onrender.com/api/save";

        const method = isUpdate ? "PUT" : "POST";

        // Make API request to save/update the file
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            code,
            user_id: userId,
          }),
        });

        // Check if save operation was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse server response
        const result = await response.json();

        // Refresh file list to show the saved/updated file
        await fetchFiles(userId);

        // Return server response for additional processing if needed
        return result;
      } catch (error) {
        // Return null to indicate failure
        return null;
      }
    },
    [userId, fetchFiles] // Dependencies for callback recreation
  );

  /**
   * Main effect hook that triggers file fetching when user ID changes
   * Only fetches data when valid user ID is available
   */
  useEffect(() => {
    if (isValidUserId(userId)) {
      // Valid user ID found, proceed with fetching files
      fetchFiles(userId);
    }
    // If no valid user ID yet, wait (timeout effect will handle prolonged waiting)
  }, [userId, fetchFiles]); // Re-run when userId or fetchFiles changes

  /**
   * Timeout effect to prevent infinite loading states
   * Handles cases where user ID never becomes available
   */
  useEffect(() => {
    // Set up timeout to handle prolonged loading states
    const timeout = setTimeout(() => {
      // If still loading and no valid user ID after timeout
      if (loading && !isValidUserId(userId)) {
        // Stop loading and set empty file list
        setLoading(false);
        setFiles([]);
      }
    }, 10000); // 10 second timeout

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timeout);
  }, [loading, userId, isLoggedIn]); // Re-run when loading state, userId, or login status changes

  // Return the hook's public API
  return {
    // State values that components can read
    files, // Array of enhanced file objects
    loading, // Boolean indicating if files are being loaded
    deletingFiles, // Set of file IDs currently being deleted
    saveNewFile, // Function to save or update files

    // Action functions that components can call
    fetchFiles, // Function to fetch files for a specific user
    deleteFile, // Function to delete a specific file
    refreshFiles, // Function to refresh the current user's files

    // Utility functions for data manipulation
    getFilteredFiles, // Function to filter files by multiple criteria
  };
};
