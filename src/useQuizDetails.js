import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

/**
 * Custom hook for managing individual quiz details and submission
 * @param {string} quizId - The ID of the quiz to fetch
 * @returns {Object} - Object containing quiz state and quiz operations
 */
export const useQuizDetails = (quizId) => {
  const { userId, isLoggedIn } = useUser();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  // Helper function to check if userId is valid
  const isValidUserId = (id) => {
    const isValid = id && typeof id === "string" && id.trim().length > 0;
    console.log("🔍 DEBUG - isValidUserId check:", { id, isValid });
    return isValid;
  };

  // Helper function to determine difficulty based on points and time
  const determineDifficulty = (totalPoints, timeLimit) => {
    if (totalPoints <= 30 && timeLimit <= 30) return "Easy";
    if (totalPoints <= 50 && timeLimit <= 60) return "Medium";
    return "Hard";
  };

  // Helper function to determine topic from question text
  const determineTopic = (questionText) => {
    const text = questionText.toLowerCase();

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

    return "Programming";
  };

  // Helper function to convert letter to index (A=0, B=1, C=2, D=3)
  const letterToIndex = useCallback((letter) => {
    if (!letter || typeof letter !== "string") {
      console.log("⚠️ DEBUG - Invalid letter for letterToIndex:", letter);
      return 0; // Default to A
    }
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    return letterMap[letter.toUpperCase()] || 0;
  }, []);

  // Helper function to convert index to letter (0=A, 1=B, 2=C, 3=D)
  const indexToLetter = useCallback((index) => {
    if (typeof index !== "number" || index < 0 || index > 3) {
      console.log("⚠️ DEBUG - Invalid index for indexToLetter:", index);
      return "A"; // Default to A
    }
    const indexMap = { 0: "A", 1: "B", 2: "C", 3: "D" };
    return indexMap[index] || "A";
  }, []);

  // Transform API quiz data to component format
  const transformQuizData = useCallback(
    (apiQuiz) => {
      console.log("🔄 DEBUG - Transforming quiz data:", apiQuiz);

      if (!apiQuiz) {
        console.log("❌ DEBUG - No quiz data to transform");
        throw new Error("No quiz data provided");
      }

      const difficulty = determineDifficulty(
        apiQuiz.total_points,
        apiQuiz.time_limit_minutes
      );

      // Transform questions
      const transformedQuestions =
        apiQuiz.questions?.map((apiQuestion, index) => {
          console.log(
            `🔄 DEBUG - Transforming question ${index + 1}:`,
            apiQuestion
          );

          const topic = determineTopic(apiQuestion.question_text);

          return {
            id: apiQuestion.id, // Keep original UUID for API calls
            question: apiQuestion.question_text || "",
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
            orderIndex: parseInt(apiQuestion.question_order_idx) || index + 1,
          };
        }) || [];

      // Sort questions by order index
      transformedQuestions.sort((a, b) => a.orderIndex - b.orderIndex);

      const transformedQuiz = {
        id: apiQuiz.id,
        title: apiQuiz.title || "Untitled Quiz",
        description: apiQuiz.description || "No description available",
        totalMarks: apiQuiz.total_points || 0,
        duration: apiQuiz.time_limit_minutes || 60,
        questions: transformedQuestions,
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
        allowMultipleAttempts: apiQuiz.allow_multiple_attempts || false,
        showResultsImmediately: apiQuiz.show_results_immediately || true,
        randomizeQuestionOrder: apiQuiz.randomize_question_order || false,
        dueDate: apiQuiz.due_date,
        status: apiQuiz.status || "published",
      };

      console.log("✅ DEBUG - Transformed quiz:", transformedQuiz);
      return transformedQuiz;
    },
    [letterToIndex]
  );

  // Fetch quiz details
  const fetchQuizDetails = useCallback(
    async (userIdToUse) => {
      console.log("🚀 =================================");
      console.log("🚀 FETCH QUIZ DETAILS CALLED");
      console.log("🚀 =================================");

      const targetUserId = userIdToUse || userId;

      console.log("🔍 DEBUG - Target User ID:", targetUserId);
      console.log("🔍 DEBUG - Quiz ID:", quizId);
      console.log("🔍 DEBUG - User ID type:", typeof targetUserId);
      console.log("🔍 DEBUG - User ID valid:", isValidUserId(targetUserId));

      if (!quizId) {
        console.log("❌ DEBUG - No quiz ID provided");
        setError("No quiz ID provided");
        setLoading(false);
        return;
      }

      if (!isValidUserId(targetUserId)) {
        console.log("❌ DEBUG - Invalid or missing userId");
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const quizUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}?user_id=${targetUserId}`;
        console.log("🌐 DEBUG - Quiz API URL:", quizUrl);

        console.log("📡 DEBUG - Making fetch request...");
        const response = await fetch(quizUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📡 DEBUG - Response received");
        console.log("📡 DEBUG - Response Status:", response.status);
        console.log("📡 DEBUG - Response OK:", response.ok);
        console.log("📡 DEBUG - Response Status Text:", response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ DEBUG - Response Error Text:", errorText);
          throw new Error(
            `Failed to fetch quiz: ${response.status} ${response.statusText}`
          );
        }

        console.log("📄 DEBUG - Parsing JSON response...");
        const result = await response.json();
        console.log("📄 DEBUG - Full API Response:", result);

        if (result && result.data) {
          console.log("✅ DEBUG - Valid response structure found");
          console.log("📄 DEBUG - Quiz data:", result.data);

          // Validate quiz data structure
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

          const transformedQuiz = transformQuizData(result.data);
          setQuiz(transformedQuiz);
          console.log("✅ DEBUG - Quiz details loaded successfully");
        } else {
          console.log("❌ DEBUG - Invalid response structure");
          console.log("❌ DEBUG - Result:", result);
          throw new Error("Invalid quiz response format - no data field");
        }
      } catch (error) {
        console.error("💥 DEBUG - Error in fetchQuizDetails:");
        console.error("💥 DEBUG - Error name:", error.name);
        console.error("💥 DEBUG - Error message:", error.message);
        console.error("💥 DEBUG - Error stack:", error.stack);

        // Provide more specific error messages
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
        setLoading(false);
        console.log("🏁 DEBUG - fetchQuizDetails completed");
      }
    },
    [quizId, userId, transformQuizData]
  );

  // Submit quiz answers
  const submitQuiz = useCallback(
    async (selectedAnswers, timeTaken) => {
      console.log("📤 =================================");
      console.log("📤 SUBMIT QUIZ CALLED");
      console.log("📤 =================================");
      console.log("📤 DEBUG - Quiz ID:", quizId);
      console.log("📤 DEBUG - User ID:", userId);
      console.log("📤 DEBUG - Selected answers:", selectedAnswers);
      console.log("📤 DEBUG - Time taken:", timeTaken);
      console.log(
        "📤 DEBUG - Quiz questions:",
        quiz?.questions?.map((q) => ({
          id: q.id,
          question: q.question.substring(0, 50) + "...",
        }))
      );

      // Enhanced validation
      if (!quizId) {
        console.log("❌ DEBUG - No quiz ID");
        return { success: false, error: "No quiz ID provided" };
      }

      if (!isValidUserId(userId)) {
        console.log("❌ DEBUG - Invalid user ID");
        return { success: false, error: "User not logged in" };
      }

      if (!quiz) {
        console.log("❌ DEBUG - No quiz data");
        return { success: false, error: "Quiz data not loaded" };
      }

      if (!selectedAnswers || Object.keys(selectedAnswers).length === 0) {
        console.log("❌ DEBUG - No answers provided");
        return { success: false, error: "Please answer at least one question" };
      }

      if (typeof timeTaken !== "number" || timeTaken < 0) {
        console.log("❌ DEBUG - Invalid time taken:", timeTaken);
        return { success: false, error: "Invalid time taken" };
      }

      // Check if all questions are answered (might be required by API)
      const totalQuestions = quiz.questions.length;
      const answeredQuestions = Object.keys(selectedAnswers).length;

      console.log("📊 DEBUG - Answer coverage:");
      console.log("📊 DEBUG - Total questions:", totalQuestions);
      console.log("📊 DEBUG - Answered questions:", answeredQuestions);

      if (answeredQuestions < totalQuestions) {
        console.log("⚠️ DEBUG - Not all questions answered, but proceeding...");

        // Create answers for unanswered questions (default to "A")
        const completeAnswers = { ...selectedAnswers };
        quiz.questions.forEach((question) => {
          if (!(question.id in completeAnswers)) {
            console.log(
              "➕ DEBUG - Adding default answer for question:",
              question.id
            );
            completeAnswers[question.id] = 0; // Default to "A"
          }
        });
        selectedAnswers = completeAnswers;
        console.log(
          "📤 DEBUG - Complete answers with defaults:",
          selectedAnswers
        );
      }

      try {
        setSubmitting(true);
        setError(null);

        // Convert selectedAnswers from index-based to letter-based format for API
        const apiAnswers = {};
        Object.entries(selectedAnswers).forEach(([questionId, answerIndex]) => {
          const letter = indexToLetter(answerIndex);
          apiAnswers[questionId] = letter;
          console.log(
            `🔄 DEBUG - Converting answer: ${questionId} -> ${answerIndex} -> ${letter}`
          );
        });

        const submitUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}/submit`;
        const submitData = {
          user_id: userId,
          time_taken: Math.round(timeTaken), // Ensure it's an integer
          answers: apiAnswers,
        };

        console.log("🌐 DEBUG - Submit URL:", submitUrl);
        console.log(
          "📤 DEBUG - Submit data:",
          JSON.stringify(submitData, null, 2)
        );

        // Validate the submit data structure
        console.log("🔍 DEBUG - Submit data validation:");
        console.log("🔍 DEBUG - user_id type:", typeof submitData.user_id);
        console.log("🔍 DEBUG - user_id value:", submitData.user_id);
        console.log(
          "🔍 DEBUG - time_taken type:",
          typeof submitData.time_taken
        );
        console.log("🔍 DEBUG - time_taken value:", submitData.time_taken);
        console.log("🔍 DEBUG - answers type:", typeof submitData.answers);
        console.log(
          "🔍 DEBUG - answers keys:",
          Object.keys(submitData.answers)
        );
        console.log(
          "🔍 DEBUG - answers values:",
          Object.values(submitData.answers)
        );

        const response = await fetch(submitUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        console.log("📡 DEBUG - Submit Response Status:", response.status);
        console.log("📡 DEBUG - Submit Response OK:", response.ok);
        console.log("📡 DEBUG - Submit Response Headers:", response.headers);

        let result;
        let responseText;

        try {
          responseText = await response.text();
          console.log("📄 DEBUG - Raw response text:", responseText);

          if (responseText) {
            result = JSON.parse(responseText);
            console.log("📄 DEBUG - Parsed response:", result);
          }
        } catch (parseError) {
          console.error("💥 DEBUG - Error parsing response:", parseError);
          console.log(
            "📄 DEBUG - Response text that failed to parse:",
            responseText
          );
          throw new Error(
            `Failed to parse response: ${
              responseText?.substring(0, 200) || "Empty response"
            }`
          );
        }

        if (!response.ok) {
          console.error("❌ DEBUG - HTTP Error Response:");
          console.error("❌ DEBUG - Status:", response.status);
          console.error("❌ DEBUG - Status Text:", response.statusText);
          console.error("❌ DEBUG - Response body:", result);

          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          if (result && result.error) {
            errorMessage += ` - ${result.error}`;
          } else if (result && result.message) {
            errorMessage += ` - ${result.message}`;
          }

          throw new Error(errorMessage);
        }

        if (result && result.data && result.data.submission) {
          console.log("✅ DEBUG - Quiz submitted successfully");
          console.log("📊 DEBUG - Submission data:", result.data.submission);

          setSubmission(result.data.submission);
          return { success: true, submission: result.data.submission };
        } else {
          console.error("❌ DEBUG - Invalid submission response format");
          console.error(
            "❌ DEBUG - Expected submission in result.data.submission"
          );
          console.error("❌ DEBUG - Actual result:", result);

          throw new Error(
            "Invalid submission response format - missing submission data"
          );
        }
      } catch (error) {
        console.error("💥 DEBUG - Error in submitQuiz:");
        console.error("💥 DEBUG - Error type:", error.constructor.name);
        console.error("💥 DEBUG - Error message:", error.message);
        console.error("💥 DEBUG - Error stack:", error.stack);

        let errorMessage = error.message;

        // Provide more user-friendly error messages
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
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setSubmitting(false);
        console.log("🏁 DEBUG - submitQuiz completed");
      }
    },
    [quizId, userId, quiz, indexToLetter]
  );

  // Fetch quiz results for review
  const fetchQuizResults = useCallback(async () => {
    console.log("📊 =================================");
    console.log("📊 FETCH QUIZ RESULTS CALLED");
    console.log("📊 =================================");
    console.log("📊 DEBUG - Quiz ID:", quizId);
    console.log("📊 DEBUG - User ID:", userId);

    if (!quizId || !isValidUserId(userId)) {
      console.log("❌ DEBUG - Cannot fetch results: missing required data");
      return { success: false, error: "Missing required data" };
    }

    try {
      setFetchingResults(true);
      setError(null);

      const resultsUrl = `https://isipython-dev.onrender.com/api/quizzes/${quizId}/results?user_id=${userId}`;
      console.log("🌐 DEBUG - Results URL:", resultsUrl);

      const response = await fetch(resultsUrl);
      console.log("📡 DEBUG - Results Response Status:", response.status);
      console.log("📡 DEBUG - Results Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ DEBUG - Results Error Response:", errorText);
        throw new Error(
          `Failed to fetch results: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("📄 DEBUG - Results API Response:", result);

      if (result.data) {
        // Transform and store the results
        const transformedResults = {
          quiz: result.data.quiz,
          questions: result.data.questions,
          submission: result.data.submission,
        };

        setQuizResults(transformedResults);
        console.log("✅ DEBUG - Quiz results loaded successfully");
        return { success: true, results: transformedResults };
      } else {
        console.log("❌ DEBUG - Invalid results response format");
        throw new Error("Invalid results response format");
      }
    } catch (error) {
      console.error("💥 DEBUG - Error fetching quiz results:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setFetchingResults(false);
      console.log("🏁 DEBUG - fetchQuizResults completed");
    }
  }, [quizId, userId]);

  // Calculate score from submission
  const calculateScoreFromSubmission = useCallback(
    (submissionData) => {
      if (!submissionData) return { score: 0, total: 0, percentage: 0 };

      return {
        score: submissionData.questions_correct || 0,
        total: submissionData.questions_total || 0,
        percentage: Math.round(submissionData.percentage || 0),
        pointsEarned: submissionData.score || 0,
        totalPoints: quiz?.totalMarks || 0,
      };
    },
    [quiz]
  );

  // Main effect - fetch data when quiz ID or user ID changes
  useEffect(() => {
    console.log("🔄 DEBUG - Quiz details useEffect triggered");
    console.log("🔄 DEBUG - quizId:", quizId);
    console.log("🔄 DEBUG - userId:", userId);
    console.log("🔄 DEBUG - isLoggedIn:", isLoggedIn);

    if (quizId && isValidUserId(userId) && isLoggedIn) {
      console.log("✅ DEBUG - Valid data found, fetching quiz details");
      fetchQuizDetails(userId);
    } else {
      console.log("⏳ DEBUG - Waiting for valid quizId and userId...");
      console.log("⏳ DEBUG - Missing:", {
        quizId: !quizId,
        userId: !isValidUserId(userId),
        isLoggedIn: !isLoggedIn,
      });

      // Set loading to false if we've been waiting too long without a valid userId
      const timeout = setTimeout(() => {
        if (!isValidUserId(userId) && !isLoggedIn) {
          console.log("⏰ DEBUG - Timeout waiting for user login");
          setError("Please log in to access this quiz");
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [quizId, userId, isLoggedIn, fetchQuizDetails]);

  // Manual retry function
  const retryFetch = useCallback(() => {
    console.log("🔄 DEBUG - Manual retry triggered");
    if (quizId && isValidUserId(userId)) {
      fetchQuizDetails(userId);
    } else {
      console.log("❌ DEBUG - Cannot retry: missing quizId or userId");
      setError("Cannot retry: missing quiz ID or user not logged in");
    }
  }, [quizId, userId, fetchQuizDetails]);

  return {
    // State
    quiz,
    loading,
    submitting,
    fetchingResults,
    error,
    submission,
    quizResults,

    // Actions
    fetchQuizDetails,
    retryFetch,
    submitQuiz,
    fetchQuizResults,

    // Utilities
    calculateScoreFromSubmission,
    letterToIndex,
    indexToLetter,
  };
};
