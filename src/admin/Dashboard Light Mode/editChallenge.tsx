"use client";

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
import { useChallengeDetails } from "../useChallengeDetails";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string;
  isHidden: boolean;
  isExample: boolean;
  pointsWeight: number;
}

interface EditChallengeProps {
  challengeId: string;
  onBackToList?: () => void;
  onSave?: (updatedChallenge: any) => void;
}

export default function EditChallenge({
  challengeId,
  onBackToList,
  onSave,
}: EditChallengeProps) {
  // Use the custom hook to fetch challenge details
  const { challenge, loading, error, refetch } =
    useChallengeDetails(challengeId);

  const [title, setTitle] = useState("");
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

  const [showPreview, setShowPreview] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "draft" | "error"
  >("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when challenge is loaded
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

  // Inline Notification Component
  const Notification = () => {
    if (!showNotification) return null;

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

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      explanation: "",
      isHidden: false,
      isExample: false,
      pointsWeight: 25.0,
    };
    setTestCases([...testCases, newTestCase]);
  };

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((tc) => tc.id !== id));
    }
  };

  const updateTestCase = (
    id: string,
    field: keyof Omit<TestCase, "id">,
    value: string | boolean | number
  ) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const getFormData = () => ({
    id: challengeId,
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

  const handleSaveDraft = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setNotificationMessage("Challenge draft updated successfully!");
      setNotificationType("draft");
      setShowNotification(true);
      setIsSubmitting(false);

      if (onSave) {
        onSave(getFormData());
      }
    }, 1000);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setNotificationMessage(
        "Challenge published successfully! Students can now access and solve this challenge."
      );
      setNotificationType("success");
      setShowNotification(true);
      setIsSubmitting(false);

      if (onSave) {
        onSave({ ...getFormData(), status: "published" });
      }
    }, 1000);
  };

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Loading Challenge Details...
          </div>
          <div className="text-sm text-gray-500">
            Fetching challenge information and test cases
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Failed to Load Challenge Details
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          <div className="flex gap-3 justify-center">
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No challenge data
  if (!challenge) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Challenge Not Found
          </div>
          <div className="text-sm text-gray-500">
            The challenge you're looking for doesn't exist or has been deleted.
          </div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drafts
            </Button>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            Edit Challenge
            <Edit3 className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Update and refine your coding challenge before publishing
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
              {challenge.status === "draft"
                ? "Draft Challenge"
                : "Published Challenge"}
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
              ID: {challenge.id}
            </Badge>
            <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
              Last Modified: {challenge.lastModified}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Challenge Details */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Code className="w-5 h-5 text-white" />
                </div>
                Challenge Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-cyan-500" />
                    Challenge Title
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
                    Difficulty Level
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

              <div className="space-y-2">
                <Label
                  htmlFor="shortDesc"
                  className="text-gray-700 font-semibold"
                >
                  Short Description
                </Label>
                <Input
                  id="shortDesc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description of the challenge"
                  className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="points"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-md flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                    Reward Points
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
                    Estimated Time (minutes)
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

              <div className="space-y-2">
                <Label
                  htmlFor="tags"
                  className="text-gray-700 font-semibold flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Tags (comma-separated)
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

          {/* Problem Description */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Problem Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="space-y-2">
                <Label
                  htmlFor="problemDesc"
                  className="text-gray-700 font-semibold"
                >
                  Detailed Problem Statement
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

          {/* Test Cases */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  Test Cases ({testCases.length})
                </CardTitle>
                <Button
                  onClick={addTestCase}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                {testCases.map((testCase, index) => (
                  <Card
                    key={testCase.id}
                    className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 font-medium transition-colors duration-200">
                            Test Case {index + 1}
                          </Badge>
                          {testCase.isExample && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                              Example
                            </Badge>
                          )}
                          {testCase.isHidden && (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
                              Hidden
                            </Badge>
                          )}
                        </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            Input
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
                            Expected Output
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

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            Explanation
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Points Weight
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
                              Options
                            </Label>
                            <div className="flex items-center space-x-4 h-10">
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
                                  Example
                                </Label>
                              </div>
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
                                  Hidden
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Challenge
            </Button>
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Draft"}
            </Button>
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish Challenge"}
            </Button>
          </div>
        </div>
      </main>

      {/* Inline Notification */}
      <Notification />
    </div>
  );
}
