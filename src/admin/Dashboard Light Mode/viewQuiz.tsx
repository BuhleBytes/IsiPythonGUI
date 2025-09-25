/**
 * ViewQuiz Component
 *
 * This component provides a read-only interface for viewing published quiz details.
 * It displays all quiz information in the same layout as the edit component but with
 * all fields disabled/read-only since published quizzes cannot be modified.
 *
 * Key Features:
 * - Read-only display of all quiz details (title, description, settings, etc.)
 * - Display of quiz questions with all options and correct answers
 * - Show quiz instructions in read-only format
 * - Visual status indicators showing published status
 * - Statistics and metadata display
 * - Navigation back to published quizzes list
 * - Same visual design as edit component but non-interactive
 * - Loading states and error handling
 *
 * The component uses the same useQuizDetails hook as the edit component
 * to fetch quiz data, ensuring consistency in data handling.
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
  Eye,
  FileText,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Settings,
  Shuffle,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { QuizQuestion } from "../useQuizAPI";
import { useQuizDetails } from "../useQuizDetails";
import { useTranslation } from "react-i18next";

/**
 * Props interface for the ViewQuiz component
 * Allows parent components to control navigation
 */
interface ViewQuizProps {
  quizId: string; // ID of the quiz to view
  onBackToList?: () => void; // Callback for navigating back to published quizzes list
}

export default function ViewQuiz({ quizId, onBackToList }: ViewQuizProps) {
  // Custom hook to fetch existing quiz details
  const { quiz, loading, error, refetch } = useQuizDetails(quizId || "");

  // Form state - populated when quiz data loads (read-only)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");

  // Quiz configuration settings (read-only)
  const [sendNotifications, setSendNotifications] = useState(true);
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(true);

  // Quiz content arrays (read-only)
  const [instructions, setInstructions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const {t} = useTranslation();

  /**
   * Effect to populate form fields when quiz data is loaded
   * Converts API response format to display format
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
              t("This quiz contains multiple-choice questions"),
              t("Each question has only one correct answer"),
              t("Make sure to submit your quiz before the timer ends"),
            ]
      );

      // Set questions
      setQuestions(quiz.questions);
    }
  }, [quiz]);

  /**
   * Handles navigation back to the published quizzes list
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
            {t("Back to Published Quizzes")}
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
            {t("Loading Quiz Details...")}
          </div>
          <div className="text-sm text-gray-500">
            {t("Fetching published quiz information")}
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
            {t("Failed to Load Quiz Details")}
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
              {t("Back to Published Quizzes")}
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
            {t("Quiz Not Found")}
          </div>
          <div className="text-sm text-gray-500">
            {t("The quiz you're looking for doesn't exist or has been deleted.")}
          </div>
          <Button onClick={handleBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Published Quizzes")}
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
              {t("Back to Published Quizzes")}
            </Button>
          </div>

          {/* Page title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            {t("View Quiz Details")}
            <Eye className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            {t("Review published quiz details and configuration")}
          </p>

          {/* Quiz status badges */}
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 hover:border-green-300 font-medium transition-all duration-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t("Published Quiz")}
            </Badge>

            <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300 font-medium transition-all duration-200">
              {t("Last Modified")}: {quiz.lastModified}
            </Badge>
          </div>
        </div>

        {/* Main content - Same structure as editQuiz but read-only */}
        <div className="space-y-6">
          {/* Quiz Details Section - Read Only */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                {t("Quiz Details")}
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
                    {t("Quiz Title")}
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    disabled
                    className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="timeLimit"
                    className="text-gray-700 font-semibold flex items-center gap-2"
                  >
                    <Timer className="w-4 h-4 text-purple-500" />
                    {t("Time Limit")} ({t("minutes")})
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    disabled
                    className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-semibold"
                >
                  {t("Description")}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  disabled
                  rows={3}
                  className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed resize-none"
                />
              </div>

              {/* Due date field */}
              <div className="space-y-2">
                <Label
                  htmlFor="dueDate"
                  className="text-gray-700 font-semibold flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                  {t("Due Date")}
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  disabled
                  className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings Section - Read Only */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                {t("Quiz Settings")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4 relative z-10">
              {/* Two-column layout for settings checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Send notifications checkbox - read only */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="notifications"
                      checked={sendNotifications}
                      disabled
                      className="cursor-not-allowed"
                    />
                    <Label
                      htmlFor="notifications"
                      className="text-sm text-gray-700 flex items-center gap-2 cursor-not-allowed"
                    >
                      <Bell className="w-4 h-4 text-green-500" />
                      Send notifications to students
                    </Label>
                  </div>

                  {/* Randomize question order checkbox - read only */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="randomize"
                      checked={randomizeOrder}
                      disabled
                      className="cursor-not-allowed"
                    />
                    <Label
                      htmlFor="randomize"
                      className="text-sm text-gray-700 flex items-center gap-2 cursor-not-allowed"
                    >
                      <Shuffle className="w-4 h-4 text-orange-500" />
                      {t("Randomize question order")}
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Show results immediately checkbox - read only */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="showResults"
                      checked={showResultsImmediately}
                      disabled
                      className="cursor-not-allowed"
                    />
                    <Label
                      htmlFor="showResults"
                      className="text-sm text-gray-700 flex items-center gap-2 cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                      {t("Show results immediately")}
                    </Label>
                  </div>

                  {/* Allow multiple attempts checkbox - read only */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="multipleAttempts"
                      checked={allowMultipleAttempts}
                      disabled
                      className="cursor-not-allowed"
                    />
                    <Label
                      htmlFor="multipleAttempts"
                      className="text-sm text-gray-700 flex items-center gap-2 cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4 text-yellow-500" />
                      {t("Allow multiple attempts")}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section - Read Only */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {t("Quiz Instructions")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4 relative z-10">
              {/* Render each instruction as read-only */}
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={instruction}
                    disabled
                    className="flex-1 bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Questions Section - Read Only */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                {t("Quiz Questions")} ({questions.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                {/* Render each question as read-only */}
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      {/* Question header */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium hover:!bg-purple-200 hover:!text-purple-800 transition-colors duration-200">
                          {t("Question")} {index + 1}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {/* Question text field - read only */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Question Text")}
                          </Label>
                          <Textarea
                            value={question.question_text}
                            disabled
                            rows={3}
                            className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed resize-none"
                          />
                        </div>

                        {/* Multiple choice options grid - read only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Option")} A {question.correct_answer === "A" && 
                              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium hover:!bg-green-200 hover:!text-green-800 transition-colors duration-200">
                                <CheckCircle className="w-3 h-3 mr-1" />{t("Correct")}
                              </Badge>
                              }
                            </Label>
                            <Input
                              value={question.option_a}
                              disabled
                              className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Option")} B {question.correct_answer === "B" && 
                              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium hover:!bg-green-200 hover:!text-green-800 transition-colors duration-200">
                                <CheckCircle className="w-3 h-3 mr-1" />{t("Correct")}
                              </Badge>}
                            </Label>
                            <Input
                              value={question.option_b}
                              disabled
                              className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Option")} C {question.correct_answer === "C" && 
                              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium hover:!bg-green-200 hover:!text-green-800 transition-colors duration-200">
                                <CheckCircle className="w-3 h-3 mr-1" />{t("Correct")}
                              </Badge>}
                            </Label>
                            <Input
                              value={question.option_c}
                              disabled
                              className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Option")} D {question.correct_answer === "D" && 
                              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium hover:!bg-green-200 hover:!text-green-800 transition-colors duration-200">
                                <CheckCircle className="w-3 h-3 mr-1" />{t("Correct")}
                              </Badge>}
                            </Label>
                            <Input
                              value={question.option_d}
                              disabled
                              className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Correct answer and points weight row - read only */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Correct Answer")}
                            </Label>
                            <Select value={question.correct_answer} disabled>
                              <SelectTrigger className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">{t("Option A")}</SelectItem>
                                <SelectItem value="B">{t("Option B")}</SelectItem>
                                <SelectItem value="C">{t("Option C")}</SelectItem>
                                <SelectItem value="D">{t("Option D")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Points Weight")}
                            </Label>
                            <Input
                              type="number"
                              value={question.points_weight}
                              disabled
                              className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Explanation field - read only */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Explanation")}
                          </Label>
                          <Input
                            value={question.explanation}
                            disabled
                            className="bg-gray-50/70 border-gray-300/50 text-gray-900 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Summary Statistics */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                {t("Quiz Summary")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {quiz.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">{t("Total Questions")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {quiz.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">{t("Total Points")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {timeLimit}
                  </div>
                  <div className="text-sm text-gray-600">{t("Minutes")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
