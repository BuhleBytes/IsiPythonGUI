"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from "@monaco-editor/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  Loader2,
  Play,
  Send,
  Target,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { registerIsiPython } from "../../languages/isiPython";
import { useUser } from "../../useUser";
import { useUserChallenges } from "../../useUserChallenges";

// Default starter code if none provided
const defaultStarterCode = `# Write your code here`;

export function ChallengeSolverLight() {
  const { id: challengeId } = useParams();
  const { userId } = useUser();
  const { getChallengeDetails } = useUserChallenges();
  const navigate = useNavigate();

  // Challenge data state
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor and execution state
  const [code, setCode] = useState(defaultStarterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [activeTab, setActiveTab] = useState("explanation");
  const [language, setLanguage] = useState("IsiPython");
  const [output, setOutput] = useState("");
  const [outputPanelHeight, setOutputPanelHeight] = useState(300);
  const [isResizingOutput, setIsResizingOutput] = useState(false);

  // Fetch challenge details when component mounts
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    let timeoutId;

    const fetchChallengeData = async () => {
      if (!challengeId || !userId) {
        if (isMounted) {
          setError(
            !challengeId ? "No challenge ID provided" : "User not authenticated"
          );
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
          setChallenge(null);
          setTestResults([]);
          setOutput("");
        }

        console.log("🚀 Fetching challenge with AbortController:", challengeId);

        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 200);
        });

        if (abortController.signal.aborted || !isMounted) {
          console.log("🚫 Request aborted during delay");
          return;
        }

        const challengeDetails = await getChallengeDetails(
          challengeId,
          userId,
          abortController.signal
        );

        if (abortController.signal.aborted || !isMounted) {
          console.log("🚫 Request aborted after API call");
          return;
        }

        if (challengeDetails.error) {
          if (isMounted) {
            setError(challengeDetails.error);
            setLoading(false);
          }
          return;
        }

        console.log("✅ Challenge loaded successfully!");

        if (isMounted) {
          setChallenge(challengeDetails);
          setCode(defaultStarterCode);
          setLoading(false);
        }
      } catch (err) {
        if (!abortController.signal.aborted && isMounted) {
          console.error("💥 Error fetching challenge:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load challenge"
          );
          setLoading(false);
        }
      }
    };

    if (challengeId && userId) {
      const randomDelay = 50 + Math.random() * 100;
      timeoutId = setTimeout(() => {
        if (!abortController.signal.aborted && isMounted) {
          fetchChallengeData();
        }
      }, randomDelay);
    } else {
      setLoading(false);
    }

    return () => {
      console.log("🧹 Aborting challenge request cleanup");
      isMounted = false;
      abortController.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [challengeId, userId, getChallengeDetails]);

  // Monaco Editor setup
  const handleEditorWillMount = useCallback((monaco) => {
    registerIsiPython(monaco);
  }, []);

  const goBack = useCallback(() => {
    navigate("/dash", { state: { activeView: "challenges" } });
  }, [navigate]);

  // Output panel resize functionality
  const handleOutputResizeStart = useCallback((e) => {
    setIsResizingOutput(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleOutputMouseMove = (e) => {
      if (!isResizingOutput) return;

      const container = document.querySelector(".challenge-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      const minHeight = 150;
      const maxHeight = containerRect.height * 0.6;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setOutputPanelHeight(newHeight);
      }
    };

    const handleOutputMouseUp = () => {
      setIsResizingOutput(false);
    };

    if (isResizingOutput) {
      document.addEventListener("mousemove", handleOutputMouseMove);
      document.addEventListener("mouseup", handleOutputMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleOutputMouseMove);
      document.removeEventListener("mouseup", handleOutputMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingOutput]);

  // Transform API test results to component format
  const transformTestResults = useCallback((visibleTests) => {
    return visibleTests.map((test, index) => ({
      id: index + 1,
      input: Array.isArray(test.input_data)
        ? test.input_data.join("\n")
        : test.input_data || "",
      expectedOutput: test.expected_output || "",
      actualOutput: test.actual_output || "",
      passed: test.status === "passed",
      explanation: test.explanation || "",
      status: test.status,
    }));
  }, []);

  // Transform API submissions to component format
  const transformSubmissions = useCallback((apiSubmissions) => {
    return apiSubmissions
      .map((submission) => ({
        id: submission.id,
        timestamp: new Date(submission.submitted_at),
        passed: submission.status === "passed",
        passedTests: submission.tests_passed,
        totalTests: submission.tests_total,
        code: submission.code,
        executionTime: Math.floor(Math.random() * 1000) + 100,
        score: submission.score,
        status: submission.status,
        submissionId: submission.id,
        challengeId: submission.challenge_id,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    if (!challengeId || !userId) return;

    setSubmissionsLoading(true);
    setSubmissionsError(null);

    try {
      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}/submissions/${userId}`;

      console.log("🌐 Fetching submissions from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const result = await response.json();
          if (result.error) {
            errorMessage = result.error;
          } else if (result.message) {
            errorMessage = result.message;
          }
        } catch (parseError) {
          console.error(
            "Error parsing submissions error response:",
            parseError
          );
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("📡 Submissions API Response:", result);

      if (result.data && Array.isArray(result.data)) {
        const transformedSubmissions = transformSubmissions(result.data);
        setSubmissions(transformedSubmissions);
        console.log(
          "✅ Submissions loaded successfully:",
          transformedSubmissions.length
        );
      } else {
        console.log("📝 No submissions found for this challenge");
        setSubmissions([]);
      }
    } catch (error) {
      console.error("💥 Error fetching submissions:", error);
      setSubmissionsError(
        error instanceof Error ? error.message : "Failed to load submissions"
      );
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [challengeId, userId, transformSubmissions]);

  // Handle tab change - fetch submissions when submissions tab is activated
  const handleTabChange = useCallback(
    (newTab) => {
      setActiveTab(newTab);

      if (newTab === "submissions" && challengeId && userId) {
        fetchSubmissions();
      }
    },
    [fetchSubmissions, challengeId, userId]
  );

  // Updated runCode function with real API integration
  const runCode = useCallback(async () => {
    if (isRunning || !challengeId || !userId) return;

    setIsRunning(true);
    setOutput(
      "🚀 Qalisa ukusebenza...\n⚡ Layisha i-Python interpreter...\n🔥 Thumela ikhowudi yakho...\n"
    );

    try {
      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}/submit`;

      console.log("🌐 Submitting code to:", apiUrl);
      console.log("📝 Code being submitted:", code);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          code: code,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const result = await response.json();
          if (result.validation_error) {
            errorMessage = result.validation_error;
          } else if (result.error) {
            errorMessage = result.error;
          } else if (result.message) {
            errorMessage = result.message;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(`❌ ${errorMessage}`);
      }

      const result = await response.json();
      console.log("📡 API Response:", result);

      if (result.test_results && result.test_results.visible_tests) {
        const transformedResults = transformTestResults(
          result.test_results.visible_tests
        );
        setTestResults(transformedResults);

        const passedCount = transformedResults.filter((r) => r.passed).length;
        const totalCount = transformedResults.length;

        const hiddenTests = result.test_results.hidden_tests;
        const hiddenPassedCount = hiddenTests ? hiddenTests.passed : 0;
        const hiddenTotalCount = hiddenTests ? hiddenTests.total : 0;

        const totalPassedTests = result.tests_passed || passedCount;
        const totalTests = result.tests_total || totalCount;

        let outputSummary = `✨ Iziphumo zowavano:\n\n`;

        transformedResults.forEach((test, index) => {
          outputSummary += `Uvavanyo ${index + 1}: ${
            test.passed ? "✅ KUPHUMELELE" : "❌ KUHLULEKILE"
          }\n`;
          if (test.input) {
            outputSummary += `Input: ${test.input}\n`;
          }
          outputSummary += `Okulindelwe: ${test.expectedOutput}\n`;
          outputSummary += `Okufunyenwe: ${test.actualOutput}\n`;
          if (test.explanation) {
            outputSummary += `Incazelo: ${test.explanation}\n`;
          }
          outputSummary += `\n`;
        });

        outputSummary += `📊 Isishwankathelo:\n`;
        outputSummary += `${totalPassedTests}/${totalTests} izivivinyo ziphumelele\n`;

        if (result.score !== undefined) {
          outputSummary += `🎯 Amaphuzu: ${result.score}\n`;
        }

        if (result.status) {
          outputSummary += `📋 Isimo: ${result.status}\n`;
        }

        if (hiddenTotalCount > 0) {
          outputSummary += `🔒 Izivivinyo ezifihlakeleyo: ${hiddenPassedCount}/${hiddenTotalCount} ziphumelele\n`;
        }

        setOutput(outputSummary);

        const newSubmission = {
          id: result.submission_id || `temp-${Date.now()}`,
          timestamp: new Date(),
          passed: result.status === "passed",
          passedTests: totalPassedTests,
          totalTests: totalTests,
          code: code,
          executionTime: Math.floor(Math.random() * 1000) + 100,
          score: result.score,
          status: result.status,
          submissionId: result.submission_id,
          challengeId: challengeId,
        };

        setSubmissions((prev) => [newSubmission, ...prev]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("💥 Error running code:", error);

      let errorMessage = "❌ Error running code: ";
      if (error instanceof Error) {
        if (error.message.startsWith("❌")) {
          errorMessage = error.message;
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Unknown error occurred";
      }

      errorMessage += "\n\n🔧 Khangela ikhowudi yakho uzame kwakhona!";

      setOutput(errorMessage);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, challengeId, userId, code, transformTestResults]);

  // Submit code function (same as runCode since the API handles both)
  const submitCode = useCallback(async () => {
    await runCode();
  }, [runCode]);

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }, []);

  const getSubmissionStatusColor = useCallback((passed) => {
    return passed
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Challenge...
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the challenge details
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Challenge
          </h3>
          <p className="text-gray-600 mb-4">{error || "Challenge not found"}</p>
          <Button
            onClick={goBack}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative overflow-hidden challenge-container">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/10 to-emerald-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-cyan-500 hover:bg-cyan-50"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  {challenge.title}
                </h1>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  {challenge.category && (
                    <>
                      <span>{challenge.category}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{challenge.difficulty}</span>
                  {challenge.points && (
                    <>
                      <span>•</span>
                      <span>{challenge.points} points</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
              <Zap className="w-3 h-3 mr-1" />
              SOLVING
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative z-10 min-h-0">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-200/50 flex flex-col bg-white/80 backdrop-blur-sm min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tab Headers */}
            <TabsList className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 rounded-none justify-start p-0 h-12 flex-shrink-0">
              <TabsTrigger
                value="explanation"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Explanation
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Submissions
                {submissions.length > 0 && (
                  <Badge className="ml-2 bg-cyan-100 text-cyan-700 text-xs px-1.5 py-0.5">
                    {submissions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="explanation" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
                      Problem Statement
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {challenge.problemStatement || challenge.description}
                    </p>
                  </div>

                  {challenge.testCases && challenge.testCases.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                        Examples
                      </h3>
                      <div className="space-y-4">
                        {challenge.testCases.map((testCase, index) => {
                          const inputDisplay = Array.isArray(
                            testCase.input_data
                          )
                            ? testCase.input_data.join(" ")
                            : testCase.input_data || "";

                          const hasInput = inputDisplay.trim().length > 0;

                          return (
                            <Card
                              key={index}
                              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {hasInput && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">
                                        Input:
                                      </div>
                                      <code className="block text-cyan-600 font-mono bg-cyan-50/50 px-3 py-2 rounded border border-cyan-200/50 whitespace-pre-line">
                                        {inputDisplay}
                                      </code>
                                    </div>
                                  )}

                                  {testCase.expected_output && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">
                                        Output:
                                      </div>
                                      <code className="block text-green-600 font-mono bg-green-50/50 px-3 py-2 rounded border border-green-200/50 whitespace-pre-line">
                                        {testCase.expected_output}
                                      </code>
                                    </div>
                                  )}

                                  {testCase.explanation && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">
                                        Explanation:
                                      </div>
                                      <div className="text-gray-700 whitespace-pre-line bg-gray-50/50 px-3 py-2 rounded border border-gray-200/50">
                                        {testCase.explanation}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {challenge.constraints &&
                    challenge.constraints.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                          Constraints
                        </h3>
                        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md">
                          <CardContent className="p-4">
                            <ul className="space-y-1">
                              {challenge.constraints.map(
                                (constraint, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-700 text-sm flex items-start gap-2"
                                  >
                                    <span className="text-cyan-600 mt-1">
                                      •
                                    </span>
                                    <span>{constraint}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                  {challenge.tags && challenge.tags.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {challenge.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-white/60 text-gray-700 border-gray-300/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6">
                  {submissionsLoading && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Loading Submissions...
                        </h3>
                        <p className="text-gray-600">
                          Fetching your submission history for this challenge
                        </p>
                      </div>
                    </div>
                  )}

                  {!submissionsLoading && submissionsError && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Failed to Load Submissions
                        </h3>
                        <p className="text-gray-600 mb-4">{submissionsError}</p>
                        <Button
                          onClick={fetchSubmissions}
                          variant="outline"
                          className="bg-white/80 border-gray-300/50 text-gray-900 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {!submissionsLoading &&
                    !submissionsError &&
                    submissions.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FileCheck className="w-8 h-8 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No submissions yet
                          </h3>
                          <p className="text-gray-600">
                            Write code & submit to see your submission history
                          </p>
                        </div>
                      </div>
                    )}

                  {!submissionsLoading &&
                    !submissionsError &&
                    submissions.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                            Submission History
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-gray-100 text-gray-700">
                              {submissions.length} submission
                              {submissions.length !== 1 ? "s" : ""}
                            </Badge>
                            <Button
                              onClick={fetchSubmissions}
                              variant="outline"
                              size="sm"
                              disabled={submissionsLoading}
                              className="bg-white/80 border-gray-300/50 text-gray-900 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700"
                            >
                              {submissionsLoading && (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              )}
                              Refresh
                            </Button>
                          </div>
                        </div>

                        {submissions.map((submission) => (
                          <Card
                            key={submission.id}
                            className={`bg-white/90 backdrop-blur-sm border shadow-md hover:shadow-lg transition-all duration-300 ${getSubmissionStatusColor(
                              submission.passed
                            )}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      submission.passed
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                    }`}
                                  >
                                    {submission.passed ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Submission
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(submission.timestamp)}
                                    </p>
                                    {submission.submissionId && (
                                      <p className="text-xs text-gray-500 font-mono">
                                        ID:{" "}
                                        {submission.submissionId.slice(0, 8)}...
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  className={`${
                                    submission.passed
                                      ? "bg-green-100 text-green-700 border-green-300"
                                      : "bg-red-100 text-red-700 border-red-300"
                                  }`}
                                >
                                  {submission.passed ? "Accepted" : "Failed"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Test Results:
                                  </span>
                                  <p className="font-medium">
                                    {submission.passedTests}/
                                    {submission.totalTests} passed
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Score:</span>
                                  <p className="font-medium">
                                    {submission.score || 0} points
                                  </p>
                                </div>
                              </div>

                              {submission.code && (
                                <div className="mt-3 p-3 bg-gray-50/50 rounded border border-gray-200/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                      Code
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setCode(submission.code)}
                                      className="text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 p-1 h-auto"
                                    >
                                      Load Code
                                    </Button>
                                  </div>
                                  <pre className="text-xs text-gray-700 font-mono bg-white/80 p-2 rounded border overflow-x-auto max-h-32 whitespace-pre-wrap">
                                    {submission.code}
                                  </pre>
                                </div>
                              )}

                              {!submission.passed && (
                                <div className="mt-3 p-2 bg-red-50/50 rounded border border-red-200/50">
                                  <p className="text-sm text-red-700">
                                    💡 Some test cases failed. Review your
                                    solution and try again.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-white/80 backdrop-blur-sm min-h-0">
          {/* Editor Header */}
          <div className="border-b border-gray-200/50 p-4 bg-white/90 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 bg-white/80 border-gray-300/50 text-gray-900 hover:bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    <SelectItem value="IsiPython">IsiPython</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="secondary"
                  className="bg-gray-200/80 text-gray-700 border-gray-300/50"
                >
                  Auto
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={runCode}
                  disabled={isRunning || isSubmitting}
                  variant="outline"
                  className="bg-white/80 border-gray-300/50 text-gray-900 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700 shadow-sm"
                >
                  {isRunning ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run
                    </>
                  )}
                </Button>
                <Button
                  onClick={submitCode}
                  disabled={isSubmitting || isRunning}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div
            className="flex-1 flex flex-col min-h-0"
            style={{ height: `calc(100% - ${outputPanelHeight}px)` }}
          >
            <div className="flex-1 relative min-w-0">
              <Editor
                height="100%"
                language="isipython"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="isipython-theme"
                beforeMount={handleEditorWillMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Resizable Output Panel */}
          <div
            className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex flex-col"
            style={{ height: `${outputPanelHeight}px` }}
          >
            {/* Resize Handle */}
            <div
              className="w-full h-1 bg-transparent hover:bg-cyan-400 cursor-row-resize transition-colors duration-200 flex-shrink-0"
              onMouseDown={handleOutputResizeStart}
              title="Drag to resize output panel"
            >
              <div className="w-full h-1 bg-gray-300 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Output Header */}
            <div className="bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  Test Case Outputs
                </h3>
                {(isRunning || isSubmitting) && (
                  <Activity className="w-4 h-4 text-green-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={`rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        result.passed
                          ? "bg-gradient-to-r from-green-50/90 to-emerald-50/90 border-green-200/60 hover:border-green-300/80"
                          : "bg-gradient-to-r from-red-50/90 to-rose-50/90 border-red-200/60 hover:border-red-300/80"
                      }`}
                    >
                      {/* Test Header */}
                      <div className="flex items-center justify-between p-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                              result.passed
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-red-500 text-white shadow-lg"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            Test {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-xs font-medium text-green-700 bg-green-100/70 px-2 py-1 rounded-full">
                                PASSED
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-xs font-medium text-red-700 bg-red-100/70 px-2 py-1 rounded-full">
                                FAILED
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Test Content */}
                      <div className="px-4 pb-4 space-y-3">
                        {/* Input Section */}
                        {result.input && (
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              Input
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                              <code className="block text-cyan-700 font-mono text-xs p-3 whitespace-pre-line leading-relaxed">
                                {result.input}
                              </code>
                            </div>
                          </div>
                        )}

                        {/* Output Comparison Grid - This is the key fix for alignment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Expected Output */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Expected Output
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-green-200/50 shadow-sm min-h-[60px] flex items-start">
                              <code className="block text-green-700 font-mono text-xs p-3 whitespace-pre-line leading-relaxed w-full">
                                {result.expectedOutput}
                              </code>
                            </div>
                          </div>

                          {/* Your Output */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Your Output
                            </div>
                            <div
                              className={`bg-white/80 backdrop-blur-sm rounded-lg border shadow-sm min-h-[60px] flex items-start ${
                                result.passed
                                  ? "border-green-200/50"
                                  : "border-red-200/50"
                              }`}
                            >
                              <code
                                className={`block font-mono text-xs p-3 whitespace-pre-line leading-relaxed w-full ${
                                  result.passed
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {result.actualOutput || "No output"}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Explanation Section */}
                        {result.explanation && (
                          <div className="mt-4 pt-3 border-t border-gray-200/50">
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              Explanation
                            </div>
                            <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                              <p className="text-gray-700 text-xs p-3 leading-relaxed">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Status Message for Failed Tests */}
                        {!result.passed && (
                          <div className="mt-3 p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-red-700 leading-relaxed">
                                <span className="font-semibold">
                                  Test Failed:
                                </span>{" "}
                                Your output doesn't match the expected result.
                                Check your logic and try again.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-purple-200/50">
                      <Terminal className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Test Your Code
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {!output
                        ? 'Click "Run" to execute your code and see detailed test results with comparisons.'
                        : "Review the test results above or run your code again."}
                    </p>
                    {output && (
                      <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3 mt-4">
                        <pre className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                          {output}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
