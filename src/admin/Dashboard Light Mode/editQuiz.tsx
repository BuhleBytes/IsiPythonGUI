/**
 * EditQuiz Component
 *
 * This component provides a comprehensive interface for editing existing quizzes.
 * It can handle both draft quizzes (that haven't been published yet) and published
 * quizzes that need updates. The component loads the existing quiz data and
 * populates the form fields for editing.
 *
 * Key Features:
 * - Load and display existing quiz data for editing
 * - Support for both draft and published quiz editing
 * - Complete form interface matching the create quiz functionality
 * - Quiz settings management (notifications, randomization, results display, etc.)
 * - Dynamic instruction management (add, edit, remove instructions)
 * - Question management (add, edit, remove multiple-choice questions)
 * - Draft saving capabilities (update existing draft)
 * - Publishing functionality (publish draft or update published quiz)
 * - Comprehensive error handling and loading states
 * - Navigation back to draft/quiz lists
 * - API integration for quiz updates
 * - Visual status indicators (draft vs published)
 * - Notification system for user feedback
 *
 * The component integrates with custom hooks for:
 * - useQuizDetails: Fetching existing quiz data
 * - useQuizAPI: Handling save/publish operations
 *
 * @component
 */

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
  BookOpen,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings,
  Target,
  Timer,
  Trash2,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { QuizQuestion, useQuizAPI } from "../useQuizAPI";
import { useQuizDetails } from "../useQuizDetails";

/**
 * Props interface for the EditQuiz component
 * Allows parent components to control navigation and handle updates
 */
interface EditQuizProps {
  quizId: string; // ID of the quiz to edit
  onBackToList?: () => void; // Callback for navigating back to list
  onSave?: (updatedQuiz: any) => void; // Callback after successful save/publish
}

export default function EditQuiz({
  quizId,
  onBackToList,
  onSave,
}: EditQuizProps) {
  // Custom hook to fetch existing quiz details
  const { quiz, loading, error, refetch } = useQuizDetails(quizId || "");

  // Custom hook for API operations (same as create quiz for consistency)
  const {
    isSubmitting,
    error: apiError,
    saveDraft,
    publishQuiz,
    clearError,
  } = useQuizAPI();

  // Form state - initialized empty and populated when quiz data loads
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");

  // Quiz configuration settings
  const [sendNotifications, setSendNotifications] = useState(true);
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(true);

  // Quiz content arrays
  const [instructions, setInstructions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // UI state for notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "draft" | "error"
  >("success");

  /**
   * Effect to populate form fields when quiz data is loaded
   * Converts API response format to form state format
   * Provides fallback defaults for instructions and questions if empty
   */
  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setDescription(quiz.description);
      setDueDate(quiz.dueDate);
      setTimeLimit(quiz.timeLimit.toString());
      setSendNotifications(quiz.sendNotifications);
      setRandomizeOrder(quiz.randomizeQuestions);
      setShowResultsImmediately(quiz.showResultsImmediately);
      setAllowMultipleAttempts(quiz.allowMultipleAttempts);

      // Set instructions with fallback to default set if empty
      setInstructions(
        quiz.instructions.length > 0
          ? quiz.instructions
          : [
              "This quiz contains multiple-choice questions",
              "Each question has only one correct answer",
              "You can flag questions for review and return to them later",
              "Make sure to submit your quiz before the due date",
            ]
      );

      // Set questions with fallback to single empty question if none exist
      setQuestions(
        quiz.questions.length > 0
          ? quiz.questions
          : [
              {
                id: "1",
                question_text: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_answer: "A",
                explanation: "",
                points_weight: 10,
              },
            ]
      );
    }
  }, [quiz]);

  /**
   * Effect to handle API errors and display them as notifications
   * Same pattern as create quiz for consistency
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
   * Same implementation as create quiz for consistency
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
   * Adds a new question to the questions array
   * Creates a default multiple-choice question with empty values
   */
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(), // Use timestamp as unique ID
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A", // Default to option A
      explanation: "",
      points_weight: 10, // Default point value
    };
    setQuestions([...questions, newQuestion]);
  };

  /**
   * Removes a question from the questions array
   * Prevents removal if only one question remains (minimum requirement)
   */
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  /**
   * Updates a specific field of a question
   * Uses the question ID to identify which question to update
   */
  const updateQuestion = (
    id: string,
    field: keyof Omit<QuizQuestion, "id">,
    value: string | number
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  /**
   * Adds a new instruction to the instructions array
   * New instruction is added as an empty string for user input
   */
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  /**
   * Removes an instruction from the instructions array
   * Prevents removal if only one instruction remains (minimum requirement)
   */
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  /**
   * Updates an instruction at a specific index
   * Replaces the instruction text while maintaining array order
   */
  const updateInstruction = (index: number, value: string) => {
    setInstructions(
      instructions.map((inst, i) => (i === index ? value : inst))
    );
  };

  /**
   * Collects all form data into a single object for API submission
   * Maps frontend field names to expected backend field names
   */
  const getFormData = () => ({
    title,
    description,
    due_date: dueDate,
    time_limit_minutes: timeLimit,
    send_notifications: sendNotifications,
    randomize_question_order: randomizeOrder,
    show_results_immediately: showResultsImmediately,
    allow_multiple_attempts: allowMultipleAttempts,
    instructions,
    questions,
  });

  /**
   * Custom API submission function for editing quizzes
   * Handles both save draft and publish actions for existing quizzes
   * Different from create quiz because it includes the existing quiz ID
   */
  const submitEditQuiz = async (action: "save_draft" | "publish") => {
    const formData = getFormData();

    try {
      const apiBaseUrl = "https://isipython-dev.onrender.com";
      const endpoint = `${apiBaseUrl}/api/admin/quizzes`;

      // Format data according to API requirements
      // Key difference: always include the existing quiz ID
      const requestBody = {
        id: quizId, // Include the existing quiz ID
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date
          ? new Date(formData.due_date).toISOString().replace(/\.\d{3}Z$/, "Z")
          : "",
        time_limit_minutes: parseInt(formData.time_limit_minutes) || 30,
        send_notifications: formData.send_notifications,
        randomize_question_order: formData.randomize_question_order,
        show_results_immediately: formData.show_results_immediately,
        allow_multiple_attempts: formData.allow_multiple_attempts,
        instructions: formData.instructions.filter(
          (inst) => inst.trim().length > 0
        ),
        questions: formData.questions.map((question, index) => ({
          question_order_idx: index + 1,
          question_text: question.question_text.trim(),
          option_a: question.option_a.trim(),
          option_b: question.option_b.trim(),
          option_c: question.option_c.trim(),
          option_d: question.option_d.trim(),
          correct_answer: question.correct_answer,
          explanation: question.explanation.trim(),
          points_weight: question.points_weight || 10,
        })),
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
        } quiz: ${specificError}`;

        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      throw new Error(errorMessage);
    }
  };

  /**
   * Handles saving the quiz as a draft
   * Updates the existing quiz while keeping it as draft status
   */
  const handleSaveDraft = async () => {
    try {
      const result = await submitEditQuiz("save_draft");

      if (result.success) {
        // Clear previous notifications
        setShowNotification(false);

        setTimeout(() => {
          setNotificationMessage("Quiz draft updated successfully!");
          setNotificationType("draft");
          setShowNotification(true);
        }, 100);

        // Call onSave callback if provided
        if (onSave) {
          onSave(result.data);
        }

        // Refetch quiz data to ensure UI is synchronized
        if (refetch) {
          await refetch();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update quiz draft";
      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  /**
   * Handles publishing the quiz
   * Either publishes a draft or updates a published quiz
   */
  const handlePublish = async () => {
    try {
      const result = await submitEditQuiz("publish");

      if (result.success) {
        // Clear previous notifications
        setShowNotification(false);

        setTimeout(() => {
          setNotificationMessage(
            quiz?.status === "draft"
              ? "Draft quiz published successfully! Students can now access and take this quiz."
              : "Quiz updated and published successfully!"
          );
          setNotificationType("success");
          setShowNotification(true);
        }, 100);

        // Call onSave callback if provided
        if (onSave) {
          onSave(result.data);
        }

        // Refetch quiz data to ensure UI is synchronized
        if (refetch) {
          await refetch();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish quiz";
      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  /**
   * Handles navigation back to the quiz/draft list
   * Calls the parent component's callback function
   */
  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  /**
   * Invalid Quiz ID State
   * Displayed when no quiz ID is provided
   */
  if (!quizId) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Invalid Quiz ID
          </div>
          <div className="text-sm text-gray-500">No quiz ID was provided.</div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drafts
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Loading State Component
   * Displayed while quiz details are being fetched
   */
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Loading Quiz Details...
          </div>
          <div className="text-sm text-gray-500">
            Fetching quiz information and questions
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State Component
   * Displayed when there's an error fetching quiz details
   */
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Failed to Load Quiz Details
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
              Back to Drafts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Quiz Not Found State
   * Displayed when the quiz doesn't exist or has been deleted
   */
  if (!quiz) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Quiz Not Found
          </div>
          <div className="text-sm text-gray-500">
            The quiz you're looking for doesn't exist or has been deleted.
          </div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drafts
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
              Back to Drafts
            </Button>
          </div>

          {/* Page title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            Edit Quiz
            <Edit3 className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Update and refine your quiz before publishing
          </p>

          {/* Quiz status badges */}
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800 hover:border-amber-300 font-medium transition-all duration-200">
              {quiz.status === "draft" ? "Draft Quiz" : "Published Quiz"}
            </Badge>

            <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300 font-medium transition-all duration-200">
              Last Modified: {quiz.lastModified}
            </Badge>
          </div>
        </div>

        {/* Main form content - Same structure as createQuiz for consistency */}
        <div className="space-y-6">
          {/* Quiz Details Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Quiz Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Title and Time Limit row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-cyan-500" />
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Python Fundamentals Quiz"
                    className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="timeLimit"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Timer className="w-4 h-4 text-purple-500" />
                    Time Limit (minutes)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="e.g., 45"
                    className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-semibold"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the quiz content and purpose..."
                  rows={3}
                  className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 resize-none backdrop-blur-sm shadow-sm"
                />
              </div>

              {/* Due date field */}
              <div className="space-y-2">
                <Label
                  htmlFor="dueDate"
                  className="text-gray-700 font-semibold flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Quiz Settings
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4 relative z-10">
              {/* Two-column layout for settings checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Send notifications checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="notifications"
                      checked={sendNotifications}
                      onCheckedChange={setSendNotifications}
                    />
                    <Label
                      htmlFor="notifications"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4 text-green-500" />
                      Send notifications to students
                    </Label>
                  </div>

                  {/* Randomize question order checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="randomize"
                      checked={randomizeOrder}
                      onCheckedChange={setRandomizeOrder}
                    />
                    <Label
                      htmlFor="randomize"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-orange-500" />
                      Randomize question order
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Show results immediately checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="showResults"
                      checked={showResultsImmediately}
                      onCheckedChange={setShowResultsImmediately}
                    />
                    <Label
                      htmlFor="showResults"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                      Show results immediately
                    </Label>
                  </div>

                  {/* Allow multiple attempts checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="multipleAttempts"
                      checked={allowMultipleAttempts}
                      onCheckedChange={setAllowMultipleAttempts}
                    />
                    <Label
                      htmlFor="multipleAttempts"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Allow multiple attempts
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Quiz Instructions
                </CardTitle>
                <Button
                  onClick={addInstruction}
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Instruction
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 relative z-10">
              {/* Render each instruction with input field and delete button */}
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Enter instruction..."
                    className="flex-1 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                  {/* Only show delete button if more than one instruction exists */}
                  {instructions.length > 1 && (
                    <Button
                      onClick={() => removeInstruction(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-t-xl relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  Quiz Questions ({questions.length})
                </CardTitle>
                <Button
                  onClick={addQuestion}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                {/* Render each question */}
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      {/* Question header with badge and delete button */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 font-medium transition-colors duration-200">
                          Question {index + 1}
                        </Badge>
                        {/* Only show delete button if more than one question exists */}
                        {questions.length > 1 && (
                          <Button
                            onClick={() => removeQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Question text field */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            Question Text
                          </Label>
                          <Textarea
                            value={question.question_text}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                "question_text",
                                e.target.value
                              )
                            }
                            placeholder="Enter the question..."
                            rows={3}
                            className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 resize-none backdrop-blur-sm shadow-sm"
                          />
                        </div>

                        {/* Multiple choice options grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Option A
                            </Label>
                            <Input
                              value={question.option_a}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "option_a",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option A..."
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Option B
                            </Label>
                            <Input
                              value={question.option_b}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "option_b",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option B..."
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Option C
                            </Label>
                            <Input
                              value={question.option_c}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "option_c",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option C..."
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Option D
                            </Label>
                            <Input
                              value={question.option_d}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "option_d",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option D..."
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Correct answer and points weight row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Correct Answer
                            </Label>
                            <Select
                              value={question.correct_answer}
                              onValueChange={(value: "A" | "B" | "C" | "D") =>
                                updateQuestion(
                                  question.id,
                                  "correct_answer",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                                <SelectItem
                                  value="A"
                                  className="text-gray-900 hover:bg-green-50"
                                >
                                  Option A
                                </SelectItem>
                                <SelectItem
                                  value="B"
                                  className="text-gray-900 hover:bg-green-50"
                                >
                                  Option B
                                </SelectItem>
                                <SelectItem
                                  value="C"
                                  className="text-gray-900 hover:bg-green-50"
                                >
                                  Option C
                                </SelectItem>
                                <SelectItem
                                  value="D"
                                  className="text-gray-900 hover:bg-green-50"
                                >
                                  Option D
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              Points Weight
                            </Label>
                            <Input
                              type="number"
                              value={question.points_weight}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "points_weight",
                                  parseInt(e.target.value) || 10
                                )
                              }
                              placeholder="10"
                              className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Explanation field */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            Explanation
                          </Label>
                          <Input
                            value={question.explanation}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                "explanation",
                                e.target.value
                              )
                            }
                            placeholder="Brief explanation of the correct answer..."
                            className="bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                          />
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
            {/* Save Draft button */}
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Draft"}
            </Button>

            {/* Publish button - Dynamic text based on current quiz status */}
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Publishing..."
                : quiz?.status === "draft"
                ? "Publish Draft"
                : "Publish Update"}
            </Button>
          </div>
        </div>
      </main>

      {/* Notification overlay */}
      <Notification />
    </div>
  );
}
