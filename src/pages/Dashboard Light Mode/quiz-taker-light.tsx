"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flag,
  Loader2,
  RefreshCw,
  Send,
  Target,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuizDetails } from "../../useQuizDetails";
import { useUser } from "../../useUser";

export function QuizTakerLight() {
  const { id } = useParams<{ id: string }>();
  console.log("🎯 COMPONENT DEBUG - Quiz ID from route params:", id);
  const navigate = useNavigate();

  // Get user information
  const { userId, isLoggedIn, loading: userLoading } = useUser();

  // Use the custom hook for quiz management
  const {
    quiz,
    loading,
    submitting,
    fetchingResults,
    error,
    submission,
    quizResults,
    submitQuiz,
    fetchQuizResults,
    calculateScoreFromSubmission,
    retryFetch,
    indexToLetter,
  } = useQuizDetails(id);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSubmissionWarning, setShowSubmissionWarning] = useState(false);

  // Use either hook error or local error for display
  const displayError = error || localError;
  const setError = (err: string | null) => setLocalError(err);

  // Initialize timer when quiz is loaded
  useEffect(() => {
    if (quiz && !isQuizStarted) {
      setTimeRemaining(quiz.duration * 60); // Convert minutes to seconds
    }
  }, [quiz, isQuizStarted]);

  // Timer effect
  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizStarted, isQuizCompleted, timeRemaining]);

  // Auto-submit when time runs out
  const handleAutoSubmit = async () => {
    if (!quiz || isQuizCompleted) return;

    console.log("⏰ DEBUG - Auto-submitting quiz due to timeout");
    const timeTaken = quiz.duration * 60; // Full duration since time ran out
    await handleQuizSubmission(timeTaken, true); // true indicates auto-submit
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    if (!quiz) return false;
    return quiz.questions.every((question) => question.id in selectedAnswers);
  };

  // Get unanswered questions
  const getUnansweredQuestions = () => {
    if (!quiz) return [];
    return quiz.questions.filter(
      (question) => !(question.id in selectedAnswers)
    );
  };

  // Handle quiz submission with enhanced validation
  const handleQuizSubmission = async (
    timeTakenInSeconds: number,
    isAutoSubmit = false
  ) => {
    if (!quiz) return;

    console.log("📤 COMPONENT DEBUG - Starting quiz submission...");
    console.log("📤 COMPONENT DEBUG - Is auto-submit:", isAutoSubmit);
    console.log("📤 COMPONENT DEBUG - Quiz ID:", id);
    console.log("📤 COMPONENT DEBUG - User ID:", userId);
    console.log("📤 COMPONENT DEBUG - Selected answers:", selectedAnswers);
    console.log("📤 COMPONENT DEBUG - Time taken:", timeTakenInSeconds);

    // Check if all questions are answered
    const allAnswered = areAllQuestionsAnswered();
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = quiz.questions.length;

    console.log("📊 COMPONENT DEBUG - Answer status:");
    console.log("📊 COMPONENT DEBUG - Total questions:", totalQuestions);
    console.log("📊 COMPONENT DEBUG - Answered questions:", answeredCount);
    console.log("📊 COMPONENT DEBUG - All answered:", allAnswered);

    // If not auto-submit and not all questions answered, show warning
    if (!isAutoSubmit && !allAnswered) {
      const unanswered = getUnansweredQuestions();
      console.log(
        "⚠️ COMPONENT DEBUG - Unanswered questions:",
        unanswered.map((q) => ({
          id: q.id,
          question: q.question.substring(0, 50),
        }))
      );

      if (!showSubmissionWarning) {
        setShowSubmissionWarning(true);
        setError(
          `You have ${unanswered.length} unanswered question(s). Click submit again to proceed with unanswered questions.`
        );
        return;
      }
    }

    // Clear any warnings
    setShowSubmissionWarning(false);
    setError(null);

    // Validate minimum requirements
    if (answeredCount === 0) {
      console.log("❌ COMPONENT DEBUG - No answers provided");
      setError("Please answer at least one question before submitting");
      return;
    }

    const result = await submitQuiz(selectedAnswers, timeTakenInSeconds);

    if (result.success) {
      setIsQuizCompleted(true);
      setShowResults(true);
      console.log("✅ COMPONENT DEBUG - Quiz submission successful");
    } else {
      console.error(
        "❌ COMPONENT DEBUG - Quiz submission failed:",
        result.error
      );
      setError(result.error || "Failed to submit quiz");
    }
  };

  // Start quiz
  const handleStartQuiz = () => {
    if (!quiz) return;

    // Clear any previous errors
    setError(null);
    setShowSubmissionWarning(false);

    setIsQuizStarted(true);
    setQuizStartTime(new Date());
    console.log("🚀 COMPONENT DEBUG - Quiz started at:", new Date());
  };

  // Submit quiz manually
  const handleSubmitQuiz = async () => {
    if (!quiz || !quizStartTime) return;

    const currentTime = new Date();
    const timeTakenInSeconds = Math.floor(
      (currentTime.getTime() - quizStartTime.getTime()) / 1000
    );

    console.log("📤 COMPONENT DEBUG - Manual quiz submission");
    console.log("📤 COMPONENT DEBUG - Time taken:", timeTakenInSeconds);

    await handleQuizSubmission(timeTakenInSeconds, false);
  };

  // Review answers
  const handleReviewAnswers = async () => {
    console.log("👁️ DEBUG - Fetching quiz results for review");
    const result = await fetchQuizResults();

    if (result.success) {
      setShowReview(true);
      console.log("✅ DEBUG - Quiz results loaded for review");
    } else {
      console.error("❌ DEBUG - Failed to load quiz results:", result.error);
      setError(result.error || "Failed to load quiz results");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Clear any previous errors when user interacts
    if (displayError) {
      setError(null);
      setShowSubmissionWarning(false);
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));

    console.log("🔍 COMPONENT DEBUG - Answer selected:", {
      questionId: currentQuestion.id,
      answerIndex: optionIndex,
      answerText: currentQuestion.options[optionIndex],
      totalAnswersNow: Object.keys({
        ...selectedAnswers,
        [currentQuestion.id]: optionIndex,
      }).length,
    });
  };

  const handleNextQuestion = () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleFlagQuestion = () => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const newFlagged = new Set(flaggedQuestions);

    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const getTimeWarningColor = () => {
    if (!quiz) return "text-cyan-600";
    const percentage = (timeRemaining / (quiz.duration * 60)) * 100;
    if (percentage <= 10) return "text-red-500";
    if (percentage <= 25) return "text-orange-500";
    return "text-cyan-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Loading state
  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {userLoading ? "Loading User Data" : "Loading Quiz"}
            </h3>
            <p className="text-gray-600">
              {userLoading
                ? "Authenticating user..."
                : "Fetching quiz details..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if ((displayError && !quiz && !loading) || (!userLoading && !isLoggedIn)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {!isLoggedIn ? "Login Required" : "Failed to Load Quiz"}
            </h3>
            <p className="text-gray-600 mb-4">
              {!isLoggedIn
                ? "You must be logged in to take a quiz"
                : displayError || "Quiz not found or failed to load"}
            </p>

            <div className="flex gap-2">
              {!isLoggedIn ? (
                <Button
                  onClick={() => navigate("/login")}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  Go to Login
                </Button>
              ) : (
                <Button
                  onClick={retryFetch}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Retrying..." : "Try Again"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/dash", { state: { activeView: "quizzes" } })
                }
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Quiz
            </h3>
            <p className="text-gray-600">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Quiz start screen
  if (!isQuizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl w-full max-w-2xl z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {quiz.title}
            </CardTitle>
            <p className="text-gray-600">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50">
                <Timer className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-bold text-gray-900">
                  {quiz.duration} minutes
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-200/50">
                <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalQuestions}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-lg p-4 text-center border border-green-200/50">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="text-lg font-bold text-gray-900">
                  {quiz.totalMarks}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Instructions
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {quiz.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Quiz
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (showResults && submission) {
    const scoreData = calculateScoreFromSubmission(submission);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl w-full max-w-2xl z-10">
          <CardHeader className="text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                scoreData.percentage >= 70
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : scoreData.percentage >= 50
                  ? "bg-gradient-to-br from-orange-400 to-yellow-500"
                  : "bg-gradient-to-br from-red-400 to-pink-500"
              }`}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Quiz Completed!
            </CardTitle>
            <p className="text-gray-600">Here are your results</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {scoreData.score}/{scoreData.total}
              </div>
              <div className="text-2xl font-semibold text-cyan-600 mb-4">
                {scoreData.percentage}%
              </div>
              <Badge
                className={
                  scoreData.percentage >= 70
                    ? "bg-green-100 text-green-700 border-green-200"
                    : scoreData.percentage >= 50
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }
              >
                {scoreData.percentage >= 70
                  ? "Excellent!"
                  : scoreData.percentage >= 50
                  ? "Good Job!"
                  : "Keep Practicing!"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-lg p-4 text-center border border-green-200/50">
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-green-600">
                  {scoreData.score}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm rounded-lg p-4 text-center border border-red-200/50">
                <p className="text-sm text-gray-600">Incorrect Answers</p>
                <p className="text-2xl font-bold text-red-600">
                  {scoreData.total - scoreData.score}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50">
              <p className="text-sm text-gray-600 mb-1">Points Earned</p>
              <p className="text-2xl font-bold text-cyan-600">
                {scoreData.pointsEarned}/{scoreData.totalPoints}
              </p>
              <p className="text-xs text-gray-500">
                Time Taken: {Math.floor(submission.time_taken / 60)}m{" "}
                {submission.time_taken % 60}s
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReviewAnswers}
                disabled={fetchingResults}
                className="flex-1 bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm"
              >
                {fetchingResults ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Review Answers
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  navigate("/dash", { state: { activeView: "quizzes" } });
                }}
              >
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review screen
  if (showReview && quizResults) {
    const { questions, submission: submissionResults } = quizResults;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/20 p-4 bg-white/30 backdrop-blur-xl z-20 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReview(false)}
                className="text-gray-600 hover:text-cyan-600 hover:bg-white/50 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {quiz.title} - Review
                </h1>
                <p className="text-sm text-gray-600">
                  Score: {submissionResults.questions_correct}/
                  {submissionResults.questions_total} (
                  {Math.round(submissionResults.percentage)}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {questions.map((question, index) => {
            const userAnswer = submissionResults.answers[question.id];
            const resultDetail = submissionResults.detailed_results.find(
              (r) => r.question_id === question.id
            );
            const isCorrect = resultDetail?.is_correct || false;

            return (
              <Card
                key={question.id}
                className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                          isCorrect
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-red-500 to-pink-600"
                        }`}
                      >
                        <span className="text-white font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <Badge
                        className={
                          isCorrect
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-bold text-gray-900">
                        {isCorrect ? resultDetail.points_weight : 0}/
                        {resultDetail.points_weight}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {question.question_text}
                  </h3>

                  <div className="space-y-2">
                    {[
                      question.option_a,
                      question.option_b,
                      question.option_c,
                      question.option_d,
                    ].map((option, optionIndex) => {
                      const optionLetter = ["A", "B", "C", "D"][optionIndex];
                      const isUserAnswer = userAnswer === optionLetter;
                      const isCorrectAnswer =
                        question.correct_answer === optionLetter;

                      let optionStyle =
                        "border-gray-200 bg-white/50 text-gray-700";

                      if (isCorrectAnswer) {
                        optionStyle =
                          "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700";
                      } else if (isUserAnswer && !isCorrect) {
                        optionStyle =
                          "border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-700";
                      }

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {optionLetter}.
                              </span>
                              {isCorrectAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {isUserAnswer && !isCorrect && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Explanation:
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Main quiz taking interface
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="border-b border-white/20 p-4 bg-white/30 backdrop-blur-xl z-20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate("/dash", { state: { activeView: "quizzes" } })
              }
              className="text-gray-600 hover:text-cyan-600 hover:bg-white/50 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${getTimeWarningColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex z-10">
        {/* Main Question Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <div>
                    <Badge
                      className={getDifficultyColor(currentQuestion.difficulty)}
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentQuestion.topic}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFlagQuestion}
                  className={`${
                    flaggedQuestions.has(currentQuestion.id)
                      ? "text-orange-500 hover:text-orange-600"
                      : "text-gray-400 hover:text-orange-500"
                  } hover:bg-white/50 backdrop-blur-sm`}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${
                      selectedAnswers[currentQuestion.id] === index
                        ? "border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 shadow-lg"
                        : "border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300 hover:bg-white/70 backdrop-blur-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers[currentQuestion.id] === index
                            ? "border-cyan-500 bg-cyan-500"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedAnswers[currentQuestion.id] === index && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="w-80 border-l border-white/20 bg-white/30 backdrop-blur-xl p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Question Navigation
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all hover:scale-110 relative ${
                      index === currentQuestionIndex
                        ? "border-cyan-400 bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700 shadow-lg"
                        : selectedAnswers[question.id] !== undefined
                        ? "border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-md"
                        : "border-gray-300 bg-white/50 text-gray-600 hover:border-gray-400 backdrop-blur-sm"
                    }`}
                  >
                    {index + 1}
                    {flaggedQuestions.has(question.id) && (
                      <Flag className="w-2 h-2 text-orange-500 absolute -top-1 -right-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded border-cyan-400 bg-gradient-to-br from-cyan-100 to-blue-100"></div>
                <span className="text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded border-green-400 bg-gradient-to-br from-green-100 to-emerald-100"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded border-gray-300 bg-white/50"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
            </div>

            {/* Quiz Progress Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Progress Summary
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  Answered: {Object.keys(selectedAnswers).length}/
                  {totalQuestions}
                </p>
                <p>Flagged: {flaggedQuestions.size}</p>
                <p>
                  Remaining:{" "}
                  {totalQuestions - Object.keys(selectedAnswers).length}
                </p>
              </div>
            </div>

            {flaggedQuestions.size > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Flagged Questions
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {flaggedQuestions.size} question(s) flagged for review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-white/20 p-4 bg-white/30 backdrop-blur-xl z-20 shadow-lg">
        {/* Error/Warning message display */}
        {displayError && (
          <div
            className={`mb-4 p-3 border rounded-lg ${
              showSubmissionWarning
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {showSubmissionWarning ? (
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    showSubmissionWarning ? "text-yellow-700" : "text-red-700"
                  }`}
                >
                  {showSubmissionWarning ? "Submission Warning" : "Error"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    showSubmissionWarning ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {displayError}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    setShowSubmissionWarning(false);
                  }}
                  className={`text-xs underline mt-1 ${
                    showSubmissionWarning
                      ? "text-yellow-500 hover:text-yellow-700"
                      : "text-red-500 hover:text-red-700"
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
