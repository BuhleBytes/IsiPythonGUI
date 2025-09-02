"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Loader2,
  Menu,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuizDetails } from "../../useQuizDetails";
import { useUser } from "../../useUser";

export function QuizReviewLight() {
  const { id } = useParams<{ id: string }>();
  console.log("👁️ REVIEW COMPONENT DEBUG - Quiz ID from route params:", id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId, isLoggedIn, loading: userLoading } = useUser();

  const {
    quiz,
    loading,
    fetchingResults,
    error,
    quizResults,
    fetchQuizResults,
    calculateScoreFromSubmission,
    retryFetch,
  } = useQuizDetails(id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    console.log("👁️ REVIEW DEBUG - Component mounted");
    console.log("👁️ REVIEW DEBUG - Quiz loaded:", !!quiz);
    console.log("👁️ REVIEW DEBUG - Quiz results loaded:", !!quizResults);

    if (quiz && !quizResults && !fetchingResults) {
      console.log("👁️ REVIEW DEBUG - Fetching quiz results...");
      fetchQuizResults();
    }
  }, [quiz, quizResults, fetchingResults, fetchQuizResults]);

  useEffect(() => {
    if (!quizResults) return;

    const totalQuestions = quizResults.questions.length;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (currentQuestionIndex > 0) {
            handlePreviousQuestion();
          }
          break;
        case "ArrowRight":
          if (currentQuestionIndex < totalQuestions - 1) {
            handleNextQuestion();
          }
          break;
        case "Escape":
          navigate("/dash", { state: { activeView: "quizzes" } });
          break;
        case "e":
        case "E":
          setShowExplanations(!showExplanations);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, quizResults, navigate, showExplanations]);

  const handleNextQuestion = () => {
    if (
      !quizResults ||
      currentQuestionIndex >= quizResults.questions.length - 1
    )
      return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
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

  const getAnswerStatus = (questionId: string) => {
    if (!quizResults) return null;

    const resultDetail = quizResults.submission.detailed_results.find(
      (r) => r.question_id === questionId
    );

    return {
      isCorrect: resultDetail?.is_correct || false,
      pointsEarned: resultDetail?.is_correct ? resultDetail.points_weight : 0,
      totalPoints: resultDetail?.points_weight || 0,
      userAnswer: quizResults.submission.answers[questionId] || "A",
    };
  };

  if (loading || userLoading || fetchingResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {userLoading
                ? t("Loading User Data")
                : fetchingResults
                ? t("Loading Quiz Results")
                : t("Loading Quiz")}
            </h3>
            <p className="text-gray-600">
              {userLoading
                ? t("Authenticating user...")
                : fetchingResults
                ? t("Fetching your quiz results...")
                : t("Loading quiz details...")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((error && !quiz && !loading) || (!userLoading && !isLoggedIn)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl w-full max-w-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {!isLoggedIn
                ? t("Login Required")
                : t("Failed to Load Quiz Results")}
            </h3>
            <p className="text-gray-600 mb-4">
              {!isLoggedIn
                ? "You must be logged in to review a quiz"
                : error || "Quiz results not found or failed to load"}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
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
                  {loading ? t("Retrying...") : t("Try Again")}
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
                {t("Back to Quizzes")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || !quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("Loading Quiz Results")}
            </h3>
            <p className="text-gray-600">t("Please wait...")</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizResults.questions[currentQuestionIndex];
  const totalQuestions = quizResults.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answerStatus = getAnswerStatus(currentQuestion.id);
  const scoreData = calculateScoreFromSubmission(quizResults.submission);

  const questionOptions = [
    currentQuestion.option_a,
    currentQuestion.option_b,
    currentQuestion.option_c,
    currentQuestion.option_d,
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="border-b border-white/20 p-2 sm:p-3 bg-white/30 backdrop-blur-xl z-20 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate("/dash", { state: { activeView: "quizzes" } })
              }
              className="text-gray-600 hover:text-cyan-600 hover:bg-white/50 backdrop-blur-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent truncate">
                {quiz.title} - {t("Review")}
              </h1>
              <p className="text-xs text-gray-600">
                {t("Question")} {currentQuestionIndex + 1} of {totalQuestions} •{" "}
                {t("Review Mode")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-gray-600 hover:text-cyan-600 hover:bg-white/50 backdrop-blur-sm"
            >
              {showSidebar ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-2 text-purple-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">{t("Review")}</span>
            </div>
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 text-xs">
              {scoreData.score}/{scoreData.total} ({scoreData.percentage}%)
            </Badge>
          </div>
        </div>

        <div className="mt-2">
          <Progress value={progress} className="h-1.5 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        <div className="flex-1 p-2 sm:p-4 flex flex-col overflow-hidden">
          <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                      answerStatus?.isCorrect
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-red-500 to-pink-600"
                    }`}
                  >
                    {answerStatus?.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <Badge
                      className={
                        answerStatus?.isCorrect
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {answerStatus?.isCorrect ? t("Correct") : t("Incorrect")}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("Points")}: {answerStatus?.pointsEarned}/
                      {answerStatus?.totalPoints}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {answerStatus?.pointsEarned}/{answerStatus?.totalPoints}
                  </div>
                  <p className="text-xs text-gray-500">{t("Points")}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-3 pb-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="space-y-2">
                {questionOptions.map((option, index) => {
                  const optionLetter = ["A", "B", "C", "D"][index];
                  const isUserAnswer =
                    answerStatus?.userAnswer === optionLetter;
                  const isCorrectAnswer =
                    currentQuestion.correct_answer === optionLetter;

                  let optionStyle = "border-gray-200 bg-white/50 text-gray-700";
                  let iconElement = null;

                  if (isCorrectAnswer) {
                    optionStyle =
                      "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700";
                    iconElement = (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    );
                  } else if (isUserAnswer && !answerStatus?.isCorrect) {
                    optionStyle =
                      "border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-700";
                    iconElement = <XCircle className="w-4 h-4 text-red-600" />;
                  }

                  return (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 rounded-lg border-2 ${optionStyle} transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-medium text-sm">
                            {optionLetter}.
                          </span>
                          {iconElement}
                        </div>
                        <span className="flex-1 text-sm">{option}</span>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {isUserAnswer && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              {t("Your Answer")}
                            </Badge>
                          )}
                          {isCorrectAnswer && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {t("Correct")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showExplanations && currentQuestion.explanation && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900 text-sm">
                      {t("Explanation")}:
                    </h4>
                  </div>
                  <p className="text-blue-800 text-xs leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-gray-600">
                        {t("Question")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {currentQuestionIndex + 1}/{totalQuestions}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-gray-600">
                        {t("Points")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {answerStatus?.pointsEarned}/{answerStatus?.totalPoints}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-cyan-600" />
                      <span className="text-xs text-gray-600">
                        {t("Status")}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-bold ${
                        answerStatus?.isCorrect
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {answerStatus?.isCorrect ? t("Correct") : t("Incorrect")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className={`
          ${showSidebar ? "fixed inset-y-0 right-0 z-30" : "hidden lg:block"} 
          lg:relative lg:static lg:z-10
          w-64 lg:w-72 border-l border-white/20 bg-white/30 backdrop-blur-xl p-2 sm:p-3 flex flex-col overflow-hidden
          ${showSidebar ? "shadow-2xl" : ""}
        `}
        >
          <div className="lg:hidden flex justify-end mb-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(false)}
              className="text-gray-600 hover:text-cyan-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {t("Question Navigation")}
              </h3>
              <div className="grid grid-cols-5 gap-1">
                {quizResults.questions.map((question, index) => {
                  const questionAnswerStatus = getAnswerStatus(question.id);

                  return (
                    <button
                      key={question.id}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setShowSidebar(false);
                      }}
                      className={`w-8 h-8 rounded-lg border text-xs font-medium transition-all hover:scale-110 relative ${
                        index === currentQuestionIndex
                          ? "border-purple-400 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 shadow-lg"
                          : questionAnswerStatus?.isCorrect
                          ? "border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-md"
                          : "border-red-400 bg-gradient-to-br from-red-100 to-pink-100 text-red-700 shadow-md"
                      }`}
                    >
                      {index + 1}
                      {questionAnswerStatus?.isCorrect ? (
                        <CheckCircle className="w-2 h-2 text-green-600 absolute -top-1 -right-1" />
                      ) : (
                        <XCircle className="w-2 h-2 text-red-600 absolute -top-1 -right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded border-purple-400 bg-gradient-to-br from-purple-100 to-indigo-100"></div>
                <span className="text-gray-600">{t("Current")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded border-green-400 bg-gradient-to-br from-green-100 to-emerald-100"></div>
                <span className="text-gray-600">{t("Correct")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded border-red-400 bg-gradient-to-br from-red-100 to-pink-100"></div>
                <span className="text-gray-600">{t("Incorrect")}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {t("Quiz Summary")}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  {t("Total Questions")}: {totalQuestions}
                </p>
                <p>
                  {t("Correct")}: {scoreData.score}
                </p>
                <p>
                  {t("Incorrect")}: {scoreData.total - scoreData.score}
                </p>
                <p>
                  {t("Score")}: {scoreData.percentage}%
                </p>
                <p>
                  {t("Points")}: {scoreData.pointsEarned}/
                  {scoreData.totalPoints}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm text-xs"
              >
                {showExplanations ? t("Hide") : t("Show")} {t("Explanations")}
              </Button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t("Shortcuts")}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>← → {t("Navigate")}</p>
                <p>E {t("Toggle explanations")}</p>
                <p>Esc {t("Back to home")}</p>
              </div>
            </div>
          </div>
        </div>

        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      <div className="border-t border-white/20 p-2 bg-white/30 backdrop-blur-xl z-20 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm disabled:opacity-50 px-3 py-1.5 text-xs"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            {t("Previous")}
          </Button>

          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200 px-2 py-1 text-xs">
              {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
            <div className="text-xs text-gray-500 hidden sm:block">← →</div>
          </div>

          <Button
            variant="outline"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm disabled:opacity-50 px-3 py-1.5 text-xs"
          >
            {t("Next")}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
