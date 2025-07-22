"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
  Target,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  totalMarks: number;
  duration: number; // in minutes
  questions: QuizQuestion[];
}

const sampleQuiz: Quiz = {
  id: 1,
  title: "Python Fundamentals Quiz",
  description:
    "Test your knowledge of Python basics including variables, data types, and operators.",
  totalMarks: 10,
  duration: 15,
  questions: [
    {
      id: 1,
      question:
        "Which of the following is the correct way to declare a variable in Python?",
      options: ["var x = 5", "int x = 5", "x = 5", "declare x = 5"],
      correctAnswer: 2,
      difficulty: "Easy",
      topic: "Variables",
      explanation:
        "In Python, variables are declared by simply assigning a value to them without specifying a data type.",
    },
    {
      id: 2,
      question:
        "What is the output of the following code?\n\nprint(type(3.14))",
      options: [
        "<class 'int'>",
        "<class 'float'>",
        "<class 'double'>",
        "<class 'number'>",
      ],
      correctAnswer: 1,
      difficulty: "Easy",
      topic: "Data Types",
      explanation:
        "3.14 is a floating-point number, so its type is 'float' in Python.",
    },
    {
      id: 3,
      question: "Which operator is used for exponentiation in Python?",
      options: ["^", "**", "exp()", "pow()"],
      correctAnswer: 1,
      difficulty: "Easy",
      topic: "Operators",
      explanation:
        "The ** operator is used for exponentiation in Python. For example, 2**3 equals 8.",
    },
    {
      id: 4,
      question:
        "What will be the output of the following code?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))",
      options: ["3", "4", "Error", "None"],
      correctAnswer: 1,
      difficulty: "Medium",
      topic: "Lists",
      explanation:
        "Since y is assigned to x, both variables reference the same list object. When we append to y, x is also affected.",
    },
    {
      id: 5,
      question: "Which of the following is NOT a valid Python identifier?",
      options: ["_variable", "variable1", "1variable", "__init__"],
      correctAnswer: 2,
      difficulty: "Easy",
      topic: "Variables",
      explanation:
        "Python identifiers cannot start with a number. '1variable' is invalid because it starts with '1'.",
    },
    {
      id: 6,
      question: "What is the correct way to create a comment in Python?",
      options: [
        "// This is a comment",
        "/* This is a comment */",
        "# This is a comment",
        "<!-- This is a comment -->",
      ],
      correctAnswer: 2,
      difficulty: "Easy",
      topic: "Syntax",
      explanation: "In Python, single-line comments start with the # symbol.",
    },
    {
      id: 7,
      question:
        "Which method is used to add an element to the end of a list in Python?",
      options: ["add()", "append()", "insert()", "push()"],
      correctAnswer: 1,
      difficulty: "Easy",
      topic: "Lists",
      explanation:
        "The append() method adds an element to the end of a list in Python.",
    },
    {
      id: 8,
      question: "What is the output of: print(10 // 3)",
      options: ["3.33", "3", "4", "3.0"],
      correctAnswer: 1,
      difficulty: "Medium",
      topic: "Operators",
      explanation:
        "The // operator performs floor division, which returns the largest integer less than or equal to the result.",
    },
    {
      id: 9,
      question:
        "Which of the following is used to handle exceptions in Python?",
      options: ["try-catch", "try-except", "catch-throw", "handle-error"],
      correctAnswer: 1,
      difficulty: "Medium",
      topic: "Error Handling",
      explanation:
        "Python uses try-except blocks to handle exceptions, not try-catch like some other languages.",
    },
    {
      id: 10,
      question:
        "What does the 'len()' function return when applied to a string?",
      options: [
        "The memory size of the string",
        "The number of characters in the string",
        "The number of words in the string",
        "The ASCII value of the first character",
      ],
      correctAnswer: 1,
      difficulty: "Easy",
      topic: "Strings",
      explanation:
        "The len() function returns the number of characters (including spaces) in a string.",
    },
  ],
};

export function QuizTakerLight() {
  const { id } = useParams<{ id: string }>(); //Extracting the ID;
  console.log("Quiz ID from route params:", id);
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [timeRemaining, setTimeRemaining] = useState(sampleQuiz.duration * 60); // Convert to seconds
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showResults, setShowResults] = useState(false);
  const currentQuestion = sampleQuiz.questions[currentQuestionIndex];
  const totalQuestions = sampleQuiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsQuizCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizStarted, isQuizCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitQuiz = () => {
    setIsQuizCompleted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getTimeWarningColor = () => {
    const percentage = (timeRemaining / (sampleQuiz.duration * 60)) * 100;
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
              {sampleQuiz.title}
            </CardTitle>
            <p className="text-gray-600">{sampleQuiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50">
                <Timer className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-bold text-gray-900">
                  {sampleQuiz.duration} minutes
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
                  {sampleQuiz.totalMarks}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Instructions
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  Each question has only one correct answer
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  You can flag questions for review and return to them later
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  The quiz will auto-submit when time runs out
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  Make sure to submit your quiz before the timer expires
                </li>
              </ul>
            </div>

            <Button
              onClick={() => setIsQuizStarted(true)}
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

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);

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
                percentage >= 70
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : percentage >= 50
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
                {score}/{totalQuestions}
              </div>
              <div className="text-2xl font-semibold text-cyan-600 mb-4">
                {percentage}%
              </div>
              <Badge
                className={
                  percentage >= 70
                    ? "bg-green-100 text-green-700 border-green-200"
                    : percentage >= 50
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }
              >
                {percentage >= 70
                  ? "Excellent!"
                  : percentage >= 50
                  ? "Good Job!"
                  : "Keep Practicing!"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-lg p-4 text-center border border-green-200/50">
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-green-600">{score}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm rounded-lg p-4 text-center border border-red-200/50">
                <p className="text-sm text-gray-600">Incorrect Answers</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalQuestions - score}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 backdrop-blur-sm"
              >
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
              className="text-gray-600 hover:text-cyan-600 hover:bg-white/50 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {sampleQuiz.title}
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
                {sampleQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all hover:scale-110 relative ${
                      index === currentQuestionIndex
                        ? "border-cyan-400 bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700 shadow-lg"
                        : selectedAnswers[sampleQuiz.questions[index].id] !==
                          undefined
                        ? "border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-md"
                        : "border-gray-300 bg-white/50 text-gray-600 hover:border-gray-400 backdrop-blur-sm"
                    }`}
                  >
                    {index + 1}
                    {flaggedQuestions.has(sampleQuiz.questions[index].id) && (
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
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Quiz
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
