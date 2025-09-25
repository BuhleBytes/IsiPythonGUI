/**
 * useQuizDetails Custom Hook
 *
 * This comprehensive React custom hook manages all aspects of individual quiz interactions,
 * including fetching quiz data, handling quiz submissions, and retrieving results.
 * It provides a complete quiz-taking experience with proper state management and error handling.
 *
 * Key Features:
 * - Fetches detailed quiz information including questions, options, and metadata
 * - Transforms raw API data into UI-friendly format with enhanced properties
 * - Handles quiz submission with answer validation and time tracking
 * - Manages quiz results retrieval and score calculation
 * - Provides comprehensive error handling and loading states
 * - Supports multiple quiz states (loading, submitting, fetching results)
 * - Includes helper functions for answer format conversion (index ↔ letter)
 * - Automatically determines quiz difficulty and question topics
 * - Validates quiz completion and handles incomplete submissions
 * - Manages timeout scenarios and retry functionality
 *
 * Quiz Data Structure:
 * - Basic info: title, description, duration, total marks
 * - Questions: text, multiple choice options, correct answers, explanations
 * - Settings: multiple attempts, immediate results, question randomization
 * - Submission: user answers, time taken, score calculation
 * - Results: detailed breakdown with correct answers and explanations
 *
 * Answer Format Handling:
 * - UI uses 0-based indices (0=A, 1=B, 2=C, 3=D) for easy array access
 * - API expects letter format (A, B, C, D) for standardization
 * - Hook automatically converts between formats as needed
 *
 * Usage:
 * const {
 *   quiz, loading, submitting, error, submission, quizResults,
 *   submitQuiz, fetchQuizResults, retryFetch, calculateScoreFromSubmission
 * } = useQuizDetails(quizId);
 *
 * Dependencies:
 * - useUser hook for current user information
 * - External API endpoints for quiz data, submission, and results
 */

import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing individual quiz details, submission, and results
 * @param {string} quizId - The unique identifier of the quiz to manage
 * @returns {Object} Object containing quiz state, loading states, error states, and action functions
 */
export const useQuizDetails = (quizId) => {
  // Get current user information from the useUser hook
  const { userId, isLoggedIn } = useUser();

  // Main quiz data state containing all quiz information and questions
  const [quiz, setQuiz] = useState(null);

  // Loading state for initial quiz data fetching
  const [loading, setLoading] = useState(true);

  // Submitting state specifically for quiz submission process
  const [submitting, setSubmitting] = useState(false);

  // Loading state for fetching quiz results after submission
  const [fetchingResults, setFetchingResults] = useState(false);

  // Error state to store any errors that occur during operations
  const [error, setError] = useState(null);

  // Submission data returned from the API after quiz submission
  const [submission, setSubmission] = useState(null);

  // Quiz results data containing detailed breakdown of answers and scores
  const [quizResults, setQuizResults] = useState(null);

  /**
   * Helper function to validate if a user ID is valid and usable
   * Ensures the ID exists, is a string, and contains meaningful content
   * @param {*} id - The user ID to validate
   * @returns {boolean} True if the user ID is valid, false otherwise
   */
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    return isValid;
  };

  /**
   * Helper function to determine quiz difficulty based on points and time limit
   * Uses simple heuristics to categorize quiz complexity
   * @param {number} totalPoints - Total points available in the quiz
   * @param {number} timeLimit - Time limit in minutes
   * @returns {string} Difficulty level: "Easy", "Medium", or "Hard"
   */
  const determineDifficulty = (totalPoints, timeLimit) => {
    // Easy quizzes: low points and short time
    if (totalPoints <= 30 && timeLimit <= 30) return "Easy";
    // Medium quizzes: moderate points and time
    if (totalPoints <= 50 && timeLimit <= 60) return "Medium";
    // Hard quizzes: high points or long time
    return "Hard";
  };

  /**
   * Helper function to determine question topic based on question text content
   * Uses keyword matching to categorize questions into programming topics
   * @param {string} questionText - The text content of the question
   * @returns {string} The determined topic category
   */
  const determineTopic = (questionText) => {
    const text = questionText.toLowerCase();

    // Check for various programming concepts and keywords
    if (text.includes("variable") || text.includes("declare"))
      return "Variables";
    if (
      text.includes("function") ||
      text.includes("chaza") ||
      text.includes("umsebenzi")
    )
      return "Functions";
    if (
      text.includes("conditional") ||
      text.includes("ukuba") ||
      text.includes("if")
    )
      return "Conditionals";
    if (
      text.includes("loop") ||
      text.includes("ngexesha") ||
      text.includes("while")
    )
      return "Loops";
    if (text.includes("return") || text.includes("buyisela"))
      return "Return Statements";
    if (text.includes("list") || text.includes("array"))
      return "Data Structures";
    if (text.includes("string") || text.includes("text")) return "Strings";
    if (text.includes("operator") || text.includes("math")) return "Operators";
    if (text.includes("type") || text.includes("uhlobo")) return "Data Types";
    if (text.includes("isixhosa") || text.includes("xhosa")) return "IsiXhosa";

    // Default fallback topic
    return "Programming";
  };

  /**
   * Helper function to convert letter format to array index
   * Converts A,B,C,D to 0,1,2,3 for easier array manipulation in UI
   * @param {string} letter - The letter to convert (A, B, C, or D)
   * @returns {number} The corresponding array index (0, 1, 2, or 3)
   */
  const letterToIndex = useCallback((letter) => {
    // Validate input parameter
    if (!letter || typeof letter !== "string") {
      return 0; // Default to A (index 0)
    }
    // Map letters to indices
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    return letterMap[letter.toUpperCase()] || 0;
  }, []);

  /**
   * Helper function to convert array index to letter format
   * Converts 0,1,2,3 to A,B,C,D for API communication
   * @param {number} index - The array index to convert (0, 1, 2, or 3)
   * @returns {string} The corresponding letter (A, B, C, or D)
   */
  const indexToLetter = useCallback((index) => {
    // Validate input parameter
    if (typeof index !== "number" || index < 0 || index > 3) {
      return "A"; // Default to A
    }
    // Map indices to letters
    const indexMap = { 0: "A", 1: "B", 2: "C", 3: "D" };
    return indexMap[index] || "A";
  }, []);

  /**
   * Transforms raw API quiz data into UI-friendly format
   * Enhances data with calculated properties, consistent structure, and UI elements
   * @param {Object} apiQuiz - Raw quiz data from the API
   * @returns {Object} Transformed quiz data optimized for UI consumption
   */
  const transformQuizData = useCallback(
    (apiQuiz) => {
      // Validate input data
      if (!apiQuiz) {
        throw new Error("No quiz data provided");
      }

      // Calculate quiz difficulty based on points and time
      const difficulty = determineDifficulty(
        apiQuiz.total_points,
        apiQuiz.time_limit_minutes
      );

      // Transform questions array with enhanced properties
      const transformedQuestions =
        apiQuiz.questions?.map((apiQuestion, index) => {
          // Determine topic category for the question
          const topic = determineTopic(apiQuestion.question_text);

          return {
            id: apiQuestion.id, // Keep original UUID for API calls
            question: apiQuestion.question_text || "",
            // Structure options as array for easier UI iteration
            options: [
              apiQuestion.option_a || "",
              apiQuestion.option_b || "",
              apiQuestion.option_c || "",
              apiQuestion.option_d || "",
            ],
            // Don't include correct answer during quiz taking (only available in results)
            correctAnswer: null, // Will be populated during results review
            correctAnswerLetter: null, // Will be populated during results review
            explanation: apiQuestion.explanation || "",
            difficulty: difficulty,
            topic: topic,
            points: apiQuestion.points_weight || 0,
            // Ensure questions are displayed in correct order
            orderIndex: parseInt(apiQuestion.question_order_idx) || index + 1,
          };
        }) || [];

      // Sort questions by their designated order
      transformedQuestions.sort((a, b) => a.orderIndex - b.orderIndex);

      // Create comprehensive quiz object with all necessary properties
      const transformedQuiz = {
        id: apiQuiz.id,
        title: apiQuiz.title || "Untitled Quiz",
        description: apiQuiz.description || "No description available",
        totalMarks: apiQuiz.total_points || 0,
        duration: apiQuiz.time_limit_minutes || 60,
        questions: transformedQuestions,
        // Generate default instructions if none provided
        instructions: apiQuiz.instructions || [
          "This quiz contains multiple-choice questions",
          "Each question has only one correct answer",
          `You have ${
            apiQuiz.time_limit_minutes || 60
          } minutes to complete all questions`,
          "You can flag questions for review and return to them later",
          "The quiz will auto-submit when time runs out",
          "Make sure to submit your quiz before the timer expires",
          "Your score will be calculated based on correct answers",
          "Review your answers carefully before final submission",
        ],
        // Quiz configuration settings
        allowMultipleAttempts: apiQuiz.allow_multiple_attempts || false,
        showResultsImmediately: apiQuiz.show_results_immediately || true,
        randomizeQuestionOrder: apiQuiz.randomize_question_order || false,
        dueDate: apiQuiz.due_date,
        status: apiQuiz.status || "published",
      };

      return transformedQuiz;
    },
    [letterToIndex] // Dependencies for callback recreation
  );

  /**
   * Fetches detailed quiz information from the API
   * Handles the complete request lifecycle with validation and error handling
   * @param {string} userIdToUse - Optional user ID to use instead of the hook's userId
   */
  const fetchQuizDetails = useCallback(
    async (userIdToUse) => {
      // Determine which user ID to use
      const targetUserId = userIdToUse || userId;

      // Validate required parameters
      if (!quizId) {
        setError("No quiz ID provided");
        setLoading(false);
        return;
      }

      if (!isValidUserId(targetUserId)) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        // Set loading state and clear previous errors
        setLoading(true);
        setError(null);

        // Construct API URL for quiz details
        const quizUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}?user_id=${targetUserId}`;

        // Make API request with proper headers
        const response = await fetch(quizUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if request was successful
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch quiz: ${response.status} ${response.statusText}`
          );
        }

        // Parse JSON response
        const result = await response.json();

        // Validate response structure
        if (result && result.data) {
          // Additional validation for quiz data completeness
          if (!result.data.id) {
            throw new Error("Invalid quiz data: missing quiz ID");
          }

          if (!result.data.questions || !Array.isArray(result.data.questions)) {
            throw new Error(
              "Invalid quiz data: missing or invalid questions array"
            );
          }

          if (result.data.questions.length === 0) {
            throw new Error("This quiz has no questions");
          }

          // Transform and store the quiz data
          const transformedQuiz = transformQuizData(result.data);
          setQuiz(transformedQuiz);
        } else {
          throw new Error("Invalid quiz response format - no data field");
        }
      } catch (error) {
        // Provide more specific error messages based on error type
        let errorMessage = error.message;
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage =
            "Network error - please check your internet connection";
        } else if (error.message.includes("404")) {
          errorMessage = "Quiz not found";
        } else if (error.message.includes("403")) {
          errorMessage =
            "Access denied - you may not have permission to view this quiz";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error - please try again later";
        }

        setError(errorMessage);
      } finally {
        // Always set loading to false when operation completes
        setLoading(false);
      }
    },
    [quizId, userId, transformQuizData] // Dependencies for callback recreation
  );

  /**
   * Submits quiz answers to the API with comprehensive validation and error handling
   * @param {Object} selectedAnswers - Object mapping question IDs to selected answer indices
   * @param {number} timeTaken - Time taken to complete the quiz in seconds
   * @returns {Object} Result object with success status and submission data or error message
   */
  const submitQuiz = useCallback(
    async (selectedAnswers, timeTaken) => {
      // Enhanced validation of required parameters
      if (!quizId) {
        return { success: false, error: "No quiz ID provided" };
      }

      if (!isValidUserId(userId)) {
        return { success: false, error: "User not logged in" };
      }

      if (!quiz) {
        return { success: false, error: "Quiz data not loaded" };
      }

      if (!selectedAnswers || Object.keys(selectedAnswers).length === 0) {
        return { success: false, error: "Please answer at least one question" };
      }

      if (typeof timeTaken !== "number" || timeTaken < 0) {
        return { success: false, error: "Invalid time taken" };
      }

      // Validate time taken against quiz duration limits
      const maxTimeInSeconds = quiz.duration * 60;
      if (timeTaken > maxTimeInSeconds) {
        // Cap the time at the quiz duration to prevent API rejection
        timeTaken = maxTimeInSeconds;
      }

      // Check answer coverage and fill in missing answers
      const totalQuestions = quiz.questions.length;
      const answeredQuestions = Object.keys(selectedAnswers).length;

      if (answeredQuestions < totalQuestions) {
        // Create complete answers set with defaults for unanswered questions
        const completeAnswers = { ...selectedAnswers };
        quiz.questions.forEach((question) => {
          if (!(question.id in completeAnswers)) {
            // Default unanswered questions to "A" (index 0)
            completeAnswers[question.id] = 0;
          }
        });
        selectedAnswers = completeAnswers;
      }

      try {
        // Set submitting state and clear errors
        setSubmitting(true);
        setError(null);

        // Convert selectedAnswers from index-based to letter-based format for API
        const apiAnswers = {};
        Object.entries(selectedAnswers).forEach(([questionId, answerIndex]) => {
          const letter = indexToLetter(answerIndex);
          apiAnswers[questionId] = letter;
        });

        // Prepare submission data
        const submitUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}/submit`;
        const submitData = {
          user_id: userId,
          // Ensure time is a positive integer within limits
          time_taken: Math.round(
            Math.max(1, Math.min(timeTaken, maxTimeInSeconds))
          ),
          answers: apiAnswers,
        };

        // Make submission request
        const response = await fetch(submitUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        // Handle response parsing
        let result;
        let responseText;

        try {
          responseText = await response.text();
          if (responseText) {
            result = JSON.parse(responseText);
          }
        } catch (parseError) {
          throw new Error(
            `Failed to parse response: ${
              responseText?.substring(0, 200) || "Empty response"
            }`
          );
        }

        // Check if submission was successful
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          if (result && result.error) {
            errorMessage += ` - ${result.error}`;
          } else if (result && result.message) {
            errorMessage += ` - ${result.message}`;
          }
          throw new Error(errorMessage);
        }

        // Validate response structure and extract submission data
        if (result && result.data && result.data.submission) {
          setSubmission(result.data.submission);
          return { success: true, submission: result.data.submission };
        } else {
          throw new Error(
            "Invalid submission response format - missing submission data"
          );
        }
      } catch (error) {
        // Provide user-friendly error messages
        let errorMessage = error.message;

        if (error.message.includes("400")) {
          errorMessage =
            "Invalid quiz submission data. Please check your answers and try again.";
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.message.includes("403")) {
          errorMessage = "You don't have permission to submit this quiz.";
        } else if (error.message.includes("404")) {
          errorMessage = "Quiz not found. Please try again.";
        } else if (error.message.includes("Network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (
          error.message.includes("Time taken cannot exceed time limit")
        ) {
          errorMessage =
            "Submission time exceeded. The quiz has been auto-submitted.";
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        // Always reset submitting state
        setSubmitting(false);
      }
    },
    [quizId, userId, quiz, indexToLetter] // Dependencies for callback recreation
  );

  /**
   * Fetches detailed quiz results including correct answers and explanations
   * Used for post-submission review and analysis
   * @returns {Object} Result object with success status and results data or error message
   */
  const fetchQuizResults = useCallback(async () => {
    // Validate required parameters
    if (!quizId || !isValidUserId(userId)) {
      return { success: false, error: "Missing required data" };
    }

    try {
      // Set loading state for results
      setFetchingResults(true);
      setError(null);

      // Construct results API URL
      const resultsUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}/results?user_id=${userId}`;

      // Make API request
      const response = await fetch(resultsUrl);

      // Check if request was successful
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch results: ${response.status} ${response.statusText}`
        );
      }

      // Parse and validate response
      const result = await response.json();

      if (result.data) {
        // Transform and store the results data
        const transformedResults = {
          quiz: result.data.quiz,
          questions: result.data.questions,
          submission: result.data.submission,
        };

        setQuizResults(transformedResults);
        return { success: true, results: transformedResults };
      } else {
        throw new Error("Invalid results response format");
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      // Always reset loading state
      setFetchingResults(false);
    }
  }, [quizId, userId]); // Dependencies for callback recreation

  /**
   * Calculates score metrics from submission data
   * Provides comprehensive score breakdown for display
   * @param {Object} submissionData - The submission data object from API
   * @returns {Object} Score metrics including raw scores, percentages, and points
   */
  const calculateScoreFromSubmission = useCallback(
    (submissionData) => {
      // Handle case where no submission data is available
      if (!submissionData) return { score: 0, total: 0, percentage: 0 };

      // Extract and calculate score metrics
      return {
        score: submissionData.questions_correct || 0,
        total: submissionData.questions_total || 0,
        percentage: Math.round(submissionData.percentage || 0),
        pointsEarned: submissionData.score || 0,
        totalPoints: quiz?.totalMarks || 0,
      };
    },
    [quiz] // Dependencies for callback recreation
  );

  /**
   * Main effect hook that triggers quiz data fetching when dependencies change
   * Only fetches when all required data is available
   */
  useEffect(() => {
    // Check if all required conditions are met
    if (quizId && isValidUserId(userId) && isLoggedIn) {
      // Valid data found, proceed with fetching quiz details
      fetchQuizDetails(userId);
    } else {
      // Set timeout to handle cases where user never logs in
      const timeout = setTimeout(() => {
        if (!isValidUserId(userId) && !isLoggedIn) {
          setError("Please log in to access this quiz");
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      // Cleanup function to prevent memory leaks
      return () => clearTimeout(timeout);
    }
  }, [quizId, userId, isLoggedIn, fetchQuizDetails]); // Dependencies for effect

  /**
   * Manual retry function for failed operations
   * Allows users to retry fetching quiz data after errors
   */
  const retryFetch = useCallback(() => {
    // Validate that retry is possible
    if (quizId && isValidUserId(userId)) {
      fetchQuizDetails(userId);
    } else {
      setError("Cannot retry: missing quiz ID or user not logged in");
    }
  }, [quizId, userId, fetchQuizDetails]); // Dependencies for callback recreation

  // Return the hook's public API
  return {
    // State values that components can read
    quiz, // The complete quiz data with questions and settings
    loading, // Whether initial quiz data is being loaded
    submitting, // Whether a quiz submission is in progress
    fetchingResults, // Whether quiz results are being fetched
    error, // Any error that occurred during operations
    submission, // Submission data returned after quiz completion
    quizResults, // Detailed results with correct answers and analysis

    // Action functions that components can call
    fetchQuizDetails, // Function to fetch quiz data for a specific user
    retryFetch, // Function to retry failed operations
    submitQuiz, // Function to submit quiz answers
    fetchQuizResults, // Function to fetch detailed results

    // Utility functions for data manipulation
    calculateScoreFromSubmission, // Function to calculate score metrics
    letterToIndex, // Helper to convert letters to indices
    indexToLetter, // Helper to convert indices to letters
  };
};
