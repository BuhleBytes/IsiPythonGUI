/**
 * CreateChallenge Component
 *
 * This component provides a comprehensive interface for educators to create coding challenges.
 * It allows users to define challenge details, write problem descriptions, create test cases,
 * and manage draft states. The component integrates with an API to save drafts and publish
 * challenges with proper error handling and user feedback.
 *
 * Features:
 * - Challenge metadata (title, difficulty, points, tags, etc.)
 * - Rich problem description input
 * - Dynamic test case management with various options
 * - Draft saving and publishing functionality
 * - Preview modal for challenge review
 * - Responsive design with modern UI elements
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
import { useTranslation } from "react-i18next";
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
  Bell,
  CheckCircle,
  Clock,
  Code,
  Eye,
  FileText,
  Plus,
  Save,
  Send,
  Sparkles,
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
import { useChallengeAPI } from "../useChallengeAPI";

/**
 * Interface defining the structure of a test case
 * Each test case represents a single validation scenario for the coding challenge
 */
interface TestCase {
  id: string; // Unique identifier for the test case
  input: string; // Input data for the test
  expectedOutput: string; // Expected output from the test
  explanation: string; // Human-readable explanation of the test case
  isHidden: boolean; // Whether the test case is hidden from students
  isExample: boolean; // Whether this is an example test case shown to students
  pointsWeight: number; // Point value assigned to this test case
}

export default function CreateChallenge() {
  // Form state for challenge basic information
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tags, setTags] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);

  // Test cases state - starts with one default example test case
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      input: "",
      expectedOutput: "",
      explanation: "",
      isHidden: false,
      isExample: true,
      pointsWeight: 25.0,
    },
  ]);

  const {t} = useTranslation();

  // UI state for modals and notifications
  const [showPreview, setShowPreview] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "draft" | "error"
  >("success");

  // Custom hook for API operations (save draft, publish, error handling)
  const {
    isSubmitting,
    error,
    saveDraft,
    publishChallenge,
    clearError,
    hasDraft,
    resetDraft,
    draftChallengeId,
  } = useChallengeAPI();

  /**
   * Effect to handle API errors and display them as notifications
   * Automatically clears errors and hides error notifications after 6 seconds
   */
  useEffect(() => {
    if (error) {
      setNotificationMessage(error);
      setNotificationType("error");
      setShowNotification(true);
      clearError();

      // Auto-hide error notifications after 6 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 6000);
    }
  }, [error, clearError]);

  /**
   * Notification Component
   * Displays contextual notifications for success, error, and draft operations
   * Positioned as a fixed overlay in the top-right corner
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
   * Creates a default test case with empty values and standard settings
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
   * Prevents removal if only one test case remains (minimum requirement)
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
   * Resets the entire form to initial state
   * Also clears any draft state in the API hook
   */
  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setRewardPoints("");
    setDifficulty("");
    setProblemDescription("");
    setEstimatedTime("");
    setTags("");
    setSendNotifications(true);
    setTestCases([
      {
        id: "1",
        input: "",
        expectedOutput: "",
        explanation: "",
        isHidden: false,
        isExample: true,
        pointsWeight: 25.0,
      },
    ]);
    // Clear the draft state when resetting
    resetDraft();
  };

  /**
   * Collects all form data into a single object
   * Used for API calls (save draft and publish)
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
   * Handles saving the challenge as a draft
   * Shows success notification and maintains form state
   */
  const handleSaveDraft = async () => {
    const formData = getFormData();
    const result = await saveDraft(formData);

    if (result.success) {
      // Clear any previous notifications first to avoid overlap
      setShowNotification(false);

      // Set new notification with slight delay for smooth transition
      setTimeout(() => {
        setNotificationMessage(
          result.message || t("Challenge saved as draft successfully!")
        );
        setNotificationType("draft");
        setShowNotification(true);
      }, 100);
    }
    // Error handling is automatic via the useChallengeAPI hook
  };

  /**
   * Handles publishing the challenge
   * Shows success notification and resets form on successful publish
   */
  const handlePublish = async () => {
    const formData = getFormData();
    const result = await publishChallenge(formData);

    if (result.success) {
      // Clear any previous notifications first
      setShowNotification(false);

      // Set success notification and reset form
      setTimeout(() => {
        setNotificationMessage(
          result.message || t("Challenge published successfully!")
        );
        setNotificationType("success");
        setShowNotification(true);
        resetForm(); // Clear form after successful publish
      }, 100);
    }
    // Error handling is automatic via the useChallengeAPI hook
  };

  /**
   * Handles clearing the current draft
   * Shows confirmation dialog before proceeding
   */
  const handleClearDraft = () => {
    if (
      confirm(
        t("Are you sure you want to start over? This will clear your current draft and all unsaved changes.")
      )
    ) {
      resetForm();
      setShowNotification(false);
      setTimeout(() => {
        setNotificationMessage(
          t("Draft cleared. You can start creating a new challenge.")
        );
        setNotificationType("draft");
        setShowNotification(true);
      }, 100);
    }
  };

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
        {/* Page header with title and draft status indicator */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
              {t("Create New Challenge")}
              <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
            </h1>
            {/* Show draft badge when user has saved draft */}
            {hasDraft && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-3 py-1 text-sm font-medium">
                {t("Draft Saved")}
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {t("Design engaging coding challenges to inspire and educate students")}
            {/* Additional guidance when draft exists */}
            {hasDraft && (
              <span className="block text-sm text-amber-600 mt-1">
                {t("You have an unsaved draft. Click 'Publish Draft' to make it live or 'Update Draft' to save changes.")}
              </span>
            )}
          </p>
        </div>

        {/* Main form content */}
        <div className="space-y-6">
          {/* Challenge Details Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Hover effect overlay */}
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
                      <SelectValue placeholder={t("Select difficulty")} />
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
                  placeholder={t("Brief description of the challenge")}
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
                  placeholder={t("Describe the coding problem that students need to solve. Include examples, constraints, and any special requirements...")}
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
                  {t("Test Cases")}
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
                      {/* Test case header with badge and delete button */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 font-medium transition-colors duration-200">
                          {t("Test Case")} {index + 1}
                        </Badge>
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
                            placeholder={`${t("Enter test input")} (e.g., ["[1,3,5,7,9,11]", "7"])`}
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
                            placeholder={t("Enter expected output...")}
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
                            placeholder={t("Brief explanation of this test case...")}
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
              {isSubmitting
                ? t("Saving...")
                : hasDraft
                ? t("Update Draft")
                : t("Save as Draft")}
            </Button>

            {/* Publish button */}
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting
                ? t("Publishing...")
                : hasDraft
                ? t("Publish Draft")
                : t("Publish Challenge")}
            </Button>

            {/* Clear Draft button - only shown when draft exists */}
            {hasDraft && (
              <Button
                onClick={handleClearDraft}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-white/80 rounded-lg font-medium px-4 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                {t("Clear Draft")}
              </Button>
            )}
          </div>
        </div>
      </main>

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
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            explanation: tc.explanation,
            isHidden: tc.isHidden,
            isExample: tc.isExample,
          })),
        }}
      />

      {/* Notification overlay */}
      <Notification />
    </div>
  );
}
