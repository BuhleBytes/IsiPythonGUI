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
 * Custom hook for managing user files
 * @returns {Object} - Object containing files state and file operations
 */
export const useUserFiles = () => {
  const { userId, isLoggedIn } = useUser();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingFiles, setDeletingFiles] = useState(new Set());

  // Predefined gradients and icons for variety
  const fileStyles = [
    {
      icon: BarChart3,
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      icon: Globe,
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: Coffee,
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: Zap,
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: Database,
      gradient: "from-indigo-400 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
    {
      icon: Sparkles,
      gradient: "from-pink-400 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
    },
    {
      icon: FileText,
      gradient: "from-teal-400 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
    },
    {
      icon: Star,
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
  ];

  // Helper function to check if userId is valid - FIXED!
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    console.log("🔍 DEBUG - isValidUserId check:", { id, isValid });
    return isValid;
  };

  // Transform API file data to our format
  const transformFileData = useCallback((apiFile, index) => {
    console.log(`🔄 DEBUG - Transforming file ${index}:`, apiFile);

    const style = fileStyles[index % fileStyles.length];
    const updatedAt = new Date(apiFile.updated_at);
    const now = new Date();
    const timeDiff = now.getTime() - updatedAt.getTime();

    // Calculate relative time
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

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

    // Estimate file size based on code length
    const sizeInBytes = new Blob([apiFile.data || ""]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);

    console.log("shxxt: ", apiFile.code);
    const transformedFile = {
      id: apiFile.id,
      name: apiFile.title.endsWith(".isi")
        ? apiFile.title
        : `${apiFile.title}.isi`,
      code: apiFile.code || "",
      icon: style.icon,
      time: timeAgo,
      size: `${sizeInKB} KB`,
      language: "IsiPython",
      gradient: style.gradient,
      bgGradient: style.bgGradient,
      type: "IsiPython",
      lastModified: updatedAt.toISOString().split("T")[0],
      description: `IsiPython file: ${apiFile.title}`,
      created_at: apiFile.created_at,
      updated_at: apiFile.updated_at,
    };

    console.log(`✅ DEBUG - Final transformed file ${index}:`, transformedFile);
    return transformedFile;
  }, []);

  // Fetch user files from API
  const fetchFiles = useCallback(
    async (userIdToUse) => {
      console.log("🚀 =================================");
      console.log("🚀 FETCH FILES CALLED");
      console.log("🚀 =================================");

      const targetUserId = userIdToUse || userId;

      console.log("🔍 DEBUG - Target User ID:", targetUserId);
      console.log("🔍 DEBUG - User ID type:", typeof targetUserId);
      console.log("🔍 DEBUG - User ID valid:", isValidUserId(targetUserId));

      // FIXED: Proper validation
      if (!isValidUserId(targetUserId)) {
        console.log("❌ DEBUG - Invalid or missing userId, cannot fetch files");
        console.log("❌ DEBUG - targetUserId:", targetUserId);
        setLoading(false);
        setFiles([]);
        return;
      }

      console.log("✅ DEBUG - Valid userId found, proceeding with API call");

      try {
        setLoading(true);

        const apiUrl = `https://isipython-dev.onrender.com/api/saved/${targetUserId}`;
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

        // Check if the response has the expected wrapper structure
        let filesData;
        if (result && typeof result === "object" && "data" in result) {
          // Response is wrapped in { success, data, message } structure
          console.log("📄 DEBUG - Result Success:", result.success);
          console.log("📄 DEBUG - Result Message:", result.message);
          console.log("📄 DEBUG - Result Data:", result.data);
          filesData = result.data;
        } else if (Array.isArray(result)) {
          // Response is the array directly
          console.log("📄 DEBUG - Response is array directly");
          filesData = result;
        } else {
          // Unexpected format
          console.log("❌ DEBUG - Unexpected response format:", typeof result);
          setFiles([]);
          return;
        }

        console.log("📄 DEBUG - Files Data Type:", typeof filesData);
        console.log(
          "📄 DEBUG - Files Data is Array:",
          Array.isArray(filesData)
        );
        console.log(
          "📄 DEBUG - Number of files:",
          filesData ? filesData.length : 0
        );

        if (Array.isArray(filesData)) {
          console.log("✅ DEBUG - API SUCCESS - Processing files...");

          if (filesData.length === 0) {
            console.log("📝 DEBUG - No files found for this user");
            setFiles([]);
          } else {
            console.log(
              `📁 DEBUG - Found ${filesData.length} files, transforming...`
            );

            // Transform API data to our format
            const transformedFiles = filesData.map(transformFileData);

            console.log("🔄 DEBUG - All transformed files:", transformedFiles);

            // Sort by most recent first (updated_at desc)
            transformedFiles.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );

            console.log("✅ DEBUG - SETTING FILES IN STATE:", transformedFiles);
            console.log(
              "🎯 DEBUG - About to call setFiles with:",
              transformedFiles.length,
              "files"
            );

            setFiles(transformedFiles);

            // EXTRA DEBUG - Verify state was set
            setTimeout(() => {
              console.log(
                "🔍 DEBUG - Files state after setFiles (async check)"
              );
            }, 100);
          }
        } else {
          console.log("❌ DEBUG - Invalid response format - not an array");
          console.log("❌ DEBUG - filesData:", filesData);
          setFiles([]);
        }
      } catch (error) {
        console.error("💥 DEBUG - ERROR in fetchFiles:", error);
        console.error("💥 DEBUG - Error message:", error.message);
        setFiles([]);
      } finally {
        setLoading(false);
        console.log("🏁 DEBUG - fetchFiles completed, loading set to false");
      }
    },
    [userId, transformFileData]
  );

  // Delete file function
  const deleteFile = useCallback(
    async (fileId) => {
      console.log("🗑️ DEBUG - Delete file called for:", fileId);
      console.log("🗑️ DEBUG - Current userId:", userId);

      if (
        !isValidUserId(userId) ||
        !window.confirm("Are you sure you want to delete this file?")
      ) {
        console.log("🗑️ DEBUG - Delete cancelled or no valid userId");
        return false;
      }

      try {
        setDeletingFiles((prev) => new Set([...prev, fileId]));

        const deleteUrl = `https://isipython-dev.onrender.com/api/saved/delete/${fileId}`;
        console.log("🗑️ DEBUG - Delete URL:", deleteUrl);
        console.log("🗑️ DEBUG - Delete payload:", { user_id: userId });

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        });

        console.log("🗑️ DEBUG - Delete response status:", response.status);
        console.log("🗑️ DEBUG - Delete response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("🗑️ DEBUG - Delete response:", result);

        if (result.success) {
          console.log("✅ DEBUG - File deleted successfully, updating state");
          setFiles((prev) => prev.filter((file) => file.id !== fileId));
          return true;
        } else {
          console.log("❌ DEBUG - Delete failed:", result.error);
          alert("Failed to delete file: " + (result.error || "Unknown error"));
          return false;
        }
      } catch (error) {
        console.error("💥 DEBUG - Error deleting file:", error);
        alert("Error deleting file. Please try again.");
        return false;
      } finally {
        setDeletingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    },
    [userId]
  );

  // Refresh files
  const refreshFiles = useCallback(async () => {
    console.log("🔄 DEBUG - Refresh files called");
    await fetchFiles();
  }, [fetchFiles]);

  // Filter files based on search and filters
  const getFilteredFiles = useCallback(
    (searchQuery, fileType, timePeriod) => {
      console.log("🔍 DEBUG - Filtering files:", {
        searchQuery,
        fileType,
        timePeriod,
        totalFiles: files.length,
      });

      const filtered = files.filter((file) => {
        const matchesSearch =
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = fileType === "All" || file.type === fileType;

        let matchesTime = true;
        if (timePeriod !== "All") {
          const now = new Date();
          const fileDate = new Date(file.lastModified);
          const daysDiff = Math.floor(
            (now.getTime() - fileDate.getTime()) / (1000 * 3600 * 24)
          );

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

        return matchesSearch && matchesType && matchesTime;
      });

      console.log("🔍 DEBUG - Filtered results:", filtered.length, "files");
      return filtered;
    },
    [files]
  );

  // Main useEffect - ONLY triggers when userId changes
  useEffect(() => {
    console.log("🔄 DEBUG - Main useEffect triggered");
    console.log("🔄 DEBUG - userId:", userId);
    console.log("🔄 DEBUG - userId valid:", isValidUserId(userId));
    console.log("🔄 DEBUG - isLoggedIn:", isLoggedIn);

    if (isValidUserId(userId)) {
      console.log("✅ DEBUG - Valid userId found, calling fetchFiles");
      fetchFiles(userId);
    } else {
      console.log("⏳ DEBUG - No valid userId yet, waiting...");
      // Keep loading true until we get a valid userId
    }
  }, [userId, fetchFiles]);

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
        console.log("⏰ DEBUG - Stopping loading and setting empty files");
        setLoading(false);
        setFiles([]);
      }
    }, 10000); // 10 second timeout

    return () => {
      console.log("⏰ DEBUG - Cleaning up timeout");
      clearTimeout(timeout);
    };
  }, [loading, userId, isLoggedIn]);

  // Debug useEffect for files state changes - ADDED THIS!
  useEffect(() => {
    console.log("📁 DEBUG - Files state changed:", {
      filesCount: files.length,
      files: files,
    });
  }, [files]);

  // Debug useEffect for userId changes
  useEffect(() => {
    console.log("👤 DEBUG - userId changed:", {
      userId,
      type: typeof userId,
      isString: typeof userId === "string",
      length: userId?.length,
      truthy: !!userId,
      isValid: isValidUserId(userId),
    });
  }, [userId]);

  // Debug useEffect for isLoggedIn changes
  useEffect(() => {
    console.log("🔐 DEBUG - isLoggedIn changed:", {
      isLoggedIn,
      type: typeof isLoggedIn,
      truthy: !!isLoggedIn,
    });
  }, [isLoggedIn]);

  // Debug useEffect for loading state changes
  useEffect(() => {
    console.log("🔄 DEBUG - Loading state changed:", loading);
  }, [loading]);

  console.log("hack: ", files);
  return {
    // State
    files,
    loading,
    deletingFiles,

    // Actions
    fetchFiles,
    deleteFile,
    refreshFiles,

    // Utilities
    getFilteredFiles,
  };
};
