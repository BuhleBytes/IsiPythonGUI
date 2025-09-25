/**
 * EditChallenge Component
 *
 * This component provides a comprehensive interface for editing existing coding challenges.
 * It can handle both draft challenges (that haven't been published yet) and published
 * challenges that need updates. The component loads the existing challenge data and
 * populates the form fields for editing.
 *
 * Key Features:
 * - Load and display existing challenge data for editing
 * - Support for both draft and published challenge editing
 * - Complete form interface matching the create challenge functionality
 * - Test case management (add, edit, remove test cases)
 * - Real-time preview functionality
 * - Draft saving capabilities (update existing draft)
 * - Publishing functionality (publish draft or update published challenge)
 * - Comprehensive error handling and loading states
 * - Navigation back to draft/challenge lists
 * - API integration for challenge updates
 * - Visual status indicators (draft vs published)
 * - Notification system for user feedback
 *
 * The component integrates with custom hooks for:
 * - useChallengeDetails: Fetching existing challenge data
 * - useChallengeAPI: Handling save/publish operations
 *
 * @component
 */

"use client";

import { ChallengePreviewModal } from "@/components/challenge-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle,
  Clock,
  Code,
  Edit3,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Send,
  Tag,
  Target,
  TestTube,
  Trash2,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useChallengeAPI } from "../useChallengeAPI";
import { useChallengeDetails } from "../useChallengeDetails";

/**
 * Interface defining the structure of a test case
 * Matches the test case structure used in challenge creation
 */
interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string;
  isHidden: boolean;
  isExample: boolean;
  pointsWeight: number;
}

/**
 * Props interface for the EditChallenge component
 * Allows parent components to control navigation and handle updates
 */
interface EditChallengeProps {
  challengeId: string; // ID of the challenge to edit
  onBackToList?: () => void; // Callback for navigating back to list
  onSave?: (updatedChallenge: any) => void; // Callback after successful save/publish
}

export default function EditChallenge({
  challengeId,
  onBackToList,
  onSave,
}: EditChallengeProps) {
  // Custom hook to fetch existing challenge details
  const { challenge, loading, error, refetch } = useChallengeDetails(
    challengeId || ""
  );

  // Custom hook for API operations (same as create challenge for consistency)
  const {
    isSubmitting,
    error: apiError,
    saveDraft,
    publishChallenge,
    clearError,
    draftChallengeId,
    resetDraft,
  } = useChallengeAPI();

  // Form state - initialized empty and populated when challenge data loads
  const [title, setTitle] = useState("");
  const { t } = useTranslation();
  const [shortDescription, setShortDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Easy"
  );
  const [problemDescription, setProblemDescription] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tags, setTags] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // UI state for modals and notifications
  const [showPreview, setShowPreview] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "draft" | "error"
  >("success");

  /**
   * Effect to populate form fields when challenge data is loaded
   * Converts API response format to form state format
   */
  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title);
      setShortDescription(challenge.shortDescription);
      setRewardPoints(challenge.rewardPoints.toString());
      setDifficulty(challenge.difficulty);
      setProblemDescription(challenge.problemDescription);
      setEstimatedTime(challenge.estimatedTime.toString());
      setTags(challenge.tags.join(", "));
      setSendNotifications(challenge.sendNotifications);
      setTestCases(challenge.testCases);
    }
  }, [challenge]);

  /**
   * Effect to handle API errors and display them as notifications
   * Same pattern as create challenge for consistency
   */
  useEffect(() => {
    if (apiError) {
      setNotificationMessage(apiError);
      setNotificationType("error");
      setShowNotification(true);
      clearError();

      // Auto-hide error notifications after 6 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 6000);
    }
  }, [apiError, clearError]);

  /**
   * Notification Component
   * Displays contextual notifications for success, error, and draft operations
   * Same implementation as create challenge for consistency
   */
  const Notification = () => {
    if (!showNotification) return null;

    // Configuration for different notification types
    const getNotificationConfig = () => {
      switch (notificationType) {
        case "success":
          return {
            icon: CheckCircle,
            bgColor: "bg-green-50 border-green-200",
            textColor: "text-green-800",
            iconColor: "text-green-600",
          };
        case "error":
          return {
            icon: XCircle,
            bgColor: "bg-red-50 border-red-200",
            textColor: "text-red-800",
            iconColor: "text-red-600",
          };
        case "draft":
          return {
            icon: AlertCircle,
            bgColor: "bg-amber-50 border-amber-200",
            textColor: "text-amber-800",
            iconColor: "text-amber-600",
          };
        default:
          return {
            icon: CheckCircle,
            bgColor: "bg-green-50 border-green-200",
            textColor: "text-green-800",
            iconColor: "text-green-600",
          };
      }
    };

    const config = getNotificationConfig();
    const IconComponent = config.icon;

    return (
      <div
        className={`fixed top-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-500 ${config.bgColor}`}
      >
        <div className="flex items-start gap-3">
          <IconComponent
            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`}
          />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {notificationMessage}
            </p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  /**
   * Adds a new test case to the test cases array
   * Creates a default test case with empty values
   */
  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(), // Use timestamp as unique ID
      input: "",
      expectedOutput: "",
      explanation: "",
      isHidden: false,
      isExample: false, // New test cases default to non-example
      pointsWeight: 25.0,
    };
    setTestCases([...testCases, newTestCase]);
  };

  /**
   * Removes a test case from the array
   * Prevents removal if only one test case remains
   */
  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((tc) => tc.id !== id));
    }
  };

  /**
   * Updates a specific field of a test case
   * Uses the test case ID to identify which case to update
   */
  const updateTestCase = (
    id: string,
    field: keyof Omit<TestCase, "id">,
    value: string | boolean | number
  ) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  /**
   * Collects all form data into a single object for API submission
   * Same format as create challenge for consistency
   */
  const getFormData = () => ({
    title,
    shortDescription,
    problemDescription,
    difficulty,
    rewardPoints,
    estimatedTime,
    tags,
    sendNotifications,
    testCases,
  });

  /**
   * Custom API submission function for editing challenges
   * Handles both save draft and publish actions for existing challenges
   * Different from create challenge because it includes the existing challenge ID
   */
  const submitEditChallenge = async (action: "save_draft" | "publish") => {
    const formData = getFormData();

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const endpoint = `${apiBaseUrl}/api/admin/challenges`;

      // Format data according to API requirements
      // Key difference: always include the existing challenge ID
      const requestBody = {
        id: challengeId, // This is the key difference - we always include the existing ID
        title: formData.title.trim(),
        short_description: formData.shortDescription.trim(),
        problem_statement: formData.problemDescription.trim(),
        difficulty_level: formData.difficulty,
        reward_points: parseInt(formData.rewardPoints) || 0,
        estimated_time: parseInt(formData.estimatedTime) || 0,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        send_notifications: formData.sendNotifications,
        test_cases: formData.testCases.map((tc) => {
          // Parse input data with error handling
          let inputData;
          const trimmedInput = tc.input.trim();

          // Handle JSON array format
          if (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
            try {
              inputData = JSON.parse(trimmedInput);
              if (Array.isArray(inputData)) {
                inputData = inputData.map((item) => String(item));
              } else {
                inputData = [String(inputData)];
              }
            } catch (e) {
              // Fallback: parse as comma-separated values inside brackets
              inputData = trimmedInput
                .slice(1, -1)
                .split(",")
                .map((item) => item.trim().replace(/^["']|["']$/g, ""))
                .filter((item) => item !== "");
            }
          } else {
            // Handle comma-separated or single value format
            if (trimmedInput.includes(",")) {
              inputData = trimmedInput
                .split(",")
                .map((item) => item.trim().replace(/^["']|["']$/g, ""))
                .filter((item) => item !== "");
            } else {
              inputData = [trimmedInput];
            }
          }

          return {
            input_data: inputData,
            expected_output: tc.expectedOutput.trim(),
            explanation:
              tc.explanation.trim() || `Test case ${tc.id} explanation`,
            is_hidden: tc.isHidden,
            is_example: tc.isExample,
            points_weight: Number(tc.pointsWeight),
          };
        }),
        action: action,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Handle successful response
        let responseData;
        try {
          responseData = await response.json();
        } catch (parseError) {
          responseData = {};
        }

        return { success: true, data: responseData };
      } else {
        // Handle error response with detailed error extraction
        let errorData;
        try {
          const errorText = await response.text();

          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
        } catch {
          errorData = { message: "Network error" };
        }

        // Extract specific error messages from API response
        let specificError = "Unknown server error";

        if (errorData.errors && typeof errorData.errors === "object") {
          const errorKeys = Object.keys(errorData.errors);
          if (errorKeys.length > 0) {
            const errorMessages = errorKeys.map(
              (key) => `${key}: ${errorData.errors[key]}`
            );
            specificError = errorMessages.join(", ");
          }
        } else if (errorData.message) {
          specificError = errorData.message;
        } else if (errorData.error) {
          specificError = errorData.error;
        } else if (errorData.detail) {
          specificError = errorData.detail;
        } else if (response.status) {
          specificError = `HTTP ${response.status} ${response.statusText}`;
        }

        const errorMessage = `Failed to ${
          action === "save_draft" ? "update draft" : "publish"
        } challenge: ${specificError}`;

        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      throw new Error(errorMessage);
    }
  };

  /**
   * Handles saving the challenge as a draft
   * Updates the existing challenge while keeping it as draft status
   */
  const handleSaveDraft = async () => {
    try {
      const result = await submitEditChallenge("save_draft");

      if (result.success) {
        // Clear previous notifications
        setShowNotification(false);

        setTimeout(() => {
          setNotificationMessage("Challenge draft updated successfully!");
          setNotificationType("draft");
          setShowNotification(true);
        }, 100);

        // Call onSave callback if provided
        if (onSave) {
          onSave(result.data);
        }

        // Refetch challenge data to ensure UI is synchronized
        if (refetch) {
          await refetch();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update challenge draft";
      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  /**
   * Handles publishing the challenge
   * Either publishes a draft or updates a published challenge
   */
  const handlePublish = async () => {
    try {
      const result = await submitEditChallenge("publish");

      if (result.success) {
        // Clear previous notifications
        setShowNotification(false);

        setTimeout(() => {
          setNotificationMessage(
            challenge?.status === "draft"
              ? "Draft challenge published successfully! Students can now access and solve this challenge."
              : "Challenge updated and published successfully!"
          );
          setNotificationType("success");
          setShowNotification(true);
        }, 100);

        // Call onSave callback if provided
        if (onSave) {
          onSave(result.data);
        }

        // Refetch challenge data to ensure UI is synchronized
        if (refetch) {
          await refetch();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish challenge";
      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  /**
   * Handles navigation back to the challenge/draft list
   * Calls the parent component's callback function
   */
  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  /**
   * Invalid Challenge ID State
   * Displayed when no challenge ID is provided
   */
  if (!challengeId) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Invalid Challenge ID
          </div>
          <div className="text-sm text-gray-500">
            No challenge ID was provided.
          </div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Drafts")}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Loading State Component
   * Displayed while challenge details are being fetched
   */
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Loading Challenge Details...")}
          </div>
          <div className="text-sm text-gray-500">
            {t("Fetching challenge information and test cases")}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State Component
   * Displayed when there's an error fetching challenge details
   */
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Failed to Load Challenge Details")}
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          <div className="flex gap-3 justify-center">
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("Try Again")}
            </Button>
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Drafts")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Challenge Not Found State
   * Displayed when the challenge doesn't exist or has been deleted
   */
  if (!challenge) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Challenge Not Found")}
          </div>
          <div className="text-sm text-gray-500">
            {t(
              "The challenge you're looking for doesn't exist or has been deleted."
            )}
          </div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Drafts")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Animated background elements for visual appeal */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main scrollable content area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {/* Page header with navigation and status indicators */}
        <div className="space-y-3">
          {/* Navigation button */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Drafts")}
            </Button>
          </div>

          {/* Page title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            {t("Edit Challenge")}
            <Edit3 className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            {t("Update and refine your coding challenge before publishing")}
          </p>

          {/* Challenge status badges */}
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800 hover:border-amber-300 font-medium transition-all duration-200">
              {challenge.status === "draft"
                ? t("Draft Challenge")
                : t("Published Challenge")}
            </Badge>

            <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300 font-medium transition-all duration-200">
              {t("Last Modified")}: {challenge.lastModified}
            </Badge>
          </div>
        </div>

        {/* Main form content - Same structure as createChallenge for consistency */}
        <div className="space-y-6">
          {/* Challenge Details Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Code className="w-5 h-5 text-white" />
                </div>
                {t("Challenge Details")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Title and Difficulty row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-cyan-500" />
                    {t("Challenge Title")}
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Binary Search Implementation"
                    className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="difficulty"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-purple-500" />
                    {t("Difficulty Level")}
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                      <SelectItem
                        value="Easy"
                        className="text-gray-900 hover:bg-emerald-50"
                      >
                        Easy
                      </SelectItem>
                      <SelectItem
                        value="Medium"
                        className="text-gray-900 hover:bg-orange-50"
                      >
                        Medium
                      </SelectItem>
                      <SelectItem
                        value="Hard"
                        className="text-gray-900 hover:bg-red-50"
                      >
                        Hard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Short description field */}
              <div className="space-y-2">
                <Label
                  htmlFor="shortDesc"
                  className="text-gray-700 font-semibold"
                >
                  {t("Short Description")}
                </Label>
                <Input
                  id="shortDesc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description of the challenge"
                  className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                />
              </div>

              {/* Points, Time, and Notifications row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="points"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-md flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                    {t("Reward Points")}
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(e.target.value)}
                    placeholder="e.g., 100"
                    className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="estimatedTime"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t("Estimated Time")} ({t("minutes")})
                  </Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g., 30"
                    className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-500" />
                    Notifications
                  </Label>
                  <div className="flex items-center space-x-2 h-10 px-3 py-2 bg-white/70 border border-gray-300/50 rounded-md backdrop-blur-sm shadow-sm">
                    <Checkbox
                      id="notifications"
                      checked={sendNotifications}
                      onCheckedChange={setSendNotifications}
                    />
                    <Label
                      htmlFor="notifications"
                      className="text-sm text-gray-700"
                    >
                      Send notifications
                    </Label>
                  </div>
                </div>
              </div>

              {/* Tags field */}
              <div className="space-y-2">
                <Label
                  htmlFor="tags"
                  className="text-gray-700 font-semibold flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-indigo-500" />
                  {t("Tags")} ({t("comma-separated")})
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., algorithms, arrays, binary-search"
                  className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Problem Description Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {t("Problem Description")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
              <div className="space-y-2">
                <Label
                  htmlFor="problemDesc"
                  className="text-gray-700 font-semibold"
                >
                  {t("Detailed Problem Statement")}
                </Label>
                <Textarea
                  id="problemDesc"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the coding problem that students need to solve. Include examples, constraints, and any special requirements..."
                  rows={8}
                  className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 resize-none backdrop-blur-sm shadow-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Cases Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  {t("Test Cases")} ({testCases.length})
                </CardTitle>
                <Button
                  onClick={addTestCase}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("Add Test Case")}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                {/* Render each test case */}
                {testCases.map((testCase, index) => (
                  <Card
                    key={testCase.id}
                    className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      {/* Test case header with badges and delete button */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 hover:text-purple-800 hover:border-purple-300 font-medium transition-all duration-200">
                            {t("Test Case")} {index + 1}
                          </Badge>
                          {testCase.isExample && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:text-blue-800 hover:border-blue-300 font-medium transition-all duration-200">
                              {t("Example test")}
                            </Badge>
                          )}
                          {testCase.isHidden && (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300 font-medium transition-all duration-200">
                              {t("Hidden test")}
                            </Badge>
                          )}
                        </div>
                        {/* Only show delete button if more than one test case exists */}
                        {testCases.length > 1 && (
                          <Button
                            onClick={() => removeTestCase(testCase.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Input and Expected Output fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Input")}
                          </Label>
                          <Textarea
                            value={testCase.input}
                            onChange={(e) =>
                              updateTestCase(
                                testCase.id,
                                "input",
                                e.target.value
                              )
                            }
                            placeholder='Enter test input (e.g., ["[1,3,5,7,9,11]", "7"])'
                            rows={3}
                            className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 resize-none backdrop-blur-sm shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Expected Output")}
                          </Label>
                          <Textarea
                            value={testCase.expectedOutput}
                            onChange={(e) =>
                              updateTestCase(
                                testCase.id,
                                "expectedOutput",
                                e.target.value
                              )
                            }
                            placeholder="Enter expected output..."
                            rows={3}
                            className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 resize-none backdrop-blur-sm shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Additional test case options */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Explanation")}
                          </Label>
                          <Input
                            value={testCase.explanation}
                            onChange={(e) =>
                              updateTestCase(
                                testCase.id,
                                "explanation",
                                e.target.value
                              )
                            }
                            placeholder="Brief explanation of this test case..."
                            className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                          />
                        </div>

                        {/* Points weight and checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Points Weight")}
                            </Label>
                            <Input
                              type="number"
                              value={testCase.pointsWeight}
                              onChange={(e) =>
                                updateTestCase(
                                  testCase.id,
                                  "pointsWeight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="25.0"
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Options")}
                            </Label>
                            <div className="flex items-center space-x-4 h-10">
                              {/* Example test case checkbox */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={testCase.isExample}
                                  onCheckedChange={(checked) =>
                                    updateTestCase(
                                      testCase.id,
                                      "isExample",
                                      checked
                                    )
                                  }
                                />
                                <Label className="text-sm text-gray-700">
                                  {t("Example test")}
                                </Label>
                              </div>

                              {/* Hidden test case checkbox */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={testCase.isHidden}
                                  onCheckedChange={(checked) =>
                                    updateTestCase(
                                      testCase.id,
                                      "isHidden",
                                      checked
                                    )
                                  }
                                />
                                <Label className="text-sm text-gray-700">
                                  {t("Hidden test")}
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Section */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {/* Preview button */}
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("Preview Challenge")}
            </Button>

            {/* Save Draft button */}
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? t("Updating...") : t("Update Draft")}
            </Button>

            {/* Publish button - Dynamic text based on current challenge status */}
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting
                ? t("Publishing...")
                : challenge?.status === "draft"
                ? t("Publish Draft")
                : t("Publish Update")}
            </Button>
          </div>
        </div>
      </main>

      {/* Notification overlay */}
      <Notification />

      {/* Challenge Preview Modal */}
      <ChallengePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        challengeData={{
          title,
          shortDescription,
          difficulty,
          rewardPoints,
          problemDescription,
          // ✅ MUST include all properties
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            explanation: tc.explanation,
            isHidden: tc.isHidden, // ⭐ This is required
            isExample: tc.isExample, // ⭐ This is required
          })),
        }}
      />
    </div>
  );
}
