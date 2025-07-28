import { useState, useEffect } from "react";
import { useUser } from "./useUser";
import {
  BarChart3,
  Globe,
  Coffee,
  Zap,
  Database,
  Sparkles,
  FileText,
  Star,
} from "lucide-react";

export interface SavedFile {
  id: string;
  name: string;
  code: string;
  icon: any;
  time: string;
  size: string;
  language: string;
  gradient: string;
  bgGradient: string;
  type: string;
  lastModified: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface UseUserFilesReturn {
  // State
  files: SavedFile[];
  loading: boolean;
  deletingFiles: Set<string>;
  
  // Actions
  fetchFiles: () => Promise<void>;
  deleteFile: (fileId: string) => Promise<boolean>;
  refreshFiles: () => Promise<void>;
  
  // Utilities
  getFilteredFiles: (searchQuery: string, fileType: string, timePeriod: string) => SavedFile[];
}

export const useUserFiles = (): UseUserFilesReturn => {
  const { userId, isLoggedIn } = useUser();
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

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

  // Transform API file data to our format
  const transformFileData = (apiFile: any, index: number): SavedFile => {
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
      timeAgo = `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (weeks > 0) {
      timeAgo = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = "Just now";
    }

    // Estimate file size based on code length
    const sizeInBytes = new Blob([apiFile.data || ""]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);

    return {
      id: apiFile.id,
      name: apiFile.title.endsWith('.isi') ? apiFile.title : `${apiFile.title}.isi`,
      code: apiFile.data || "",
      icon: style.icon,
      time: timeAgo,
      size: `${sizeInKB} KB`,
      language: "IsiPython",
      gradient: style.gradient,
      bgGradient: style.bgGradient,
      type: "IsiPython",
      lastModified: updatedAt.toISOString().split('T')[0],
      description: `IsiPython file: ${apiFile.title}`,
      created_at: apiFile.created_at,
      updated_at: apiFile.updated_at,
    };
  };

  // Fetch user files from API
  const fetchFiles = async (): Promise<void> => {
    if (!userId || !isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://isipython-dev.onrender.com/api/saved/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Transform API data to our format
        const transformedFiles = result.data.map(transformFileData);

        // Sort by most recent first (updated_at desc)
        transformedFiles.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        setFiles(transformedFiles);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching user files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete file function
  const deleteFile = async (fileId: string): Promise<boolean> => {
    if (!userId || !window.confirm('Are you sure you want to delete this file?')) {
      return false;
    }

    try {
      setDeletingFiles(prev => new Set([...prev, fileId]));
      
      const response = await fetch(
        `https://isipython-dev.onrender.com/api/saved/delete/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the file from local state
        setFiles(prev => prev.filter(file => file.id !== fileId));
        return true;
      } else {
        alert('Failed to delete file: ' + (result.error || 'Unknown error'));
        return false;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
      return false;
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // Refresh files (same as fetchFiles but with user feedback)
  const refreshFiles = async (): Promise<void> => {
    await fetchFiles();
  };

  // Filter files based on search and filters
  const getFilteredFiles = (
    searchQuery: string, 
    fileType: string, 
    timePeriod: string
  ): SavedFile[] => {
    return files.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        fileType === "All" || file.type === fileType;

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
  };

  // Load files when component mounts or user changes
  useEffect(() => {
    fetchFiles();
  }, [userId, isLoggedIn]);

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