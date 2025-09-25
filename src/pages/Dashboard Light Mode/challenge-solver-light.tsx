// path: challenge-solver-light.tsx
/**
 * ChallengeSolverLight
 *
 * What this file does:
 * - Presents a "lightweight" challenge-solving workspace.
 * - Fetches a coding challenge for the current user, renders its details, and provides a Monaco editor (IsiPython).
 * - Submits code to a remote API, displays visible test results, tracks hidden test stats, and lists submission history.
 * - Offers a resizable output panel to review test outputs alongside the editor.
 *
 * Why it exists:
 * - Creates a focused solve-and-iterate flow: read problem -> write code -> run -> inspect results -> iterate.
 * - Minimizes navigation overhead by embedding everything (problem, editor, output, submissions) in one screen.
 *
 * Notes on decisions:
 * - AbortController + "isMounted" guards prevent state updates after unmount (race conditions).
 * - We transform API payloads into view-friendly shapes for consistent rendering.
 * - We avoid changing functionality; only removed emojis and console statements, and added comments for clarity.
 */

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
  Target,
  Terminal,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { registerIsiPython } from "../../languages/isiPython";
import { useUser } from "../../useUser";
import { useUserChallenges } from "../../useUserChallenges";

export function ChallengeSolverLight() {
  // URL params and user/context hooks
  const { id: challengeId } = useParams();
  const { userId } = useUser();
  const { getChallengeDetails } = useUserChallenges();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Starter code: falls back to a localized prompt when the challenge has no template
  const defaultStarterCode = `${t("# Write your code here")}`;

  /**
   * Data and UI state
   * - challenge/load/error: controls problem fetching lifecycle.
   * - editor+execution: code text, running/submitting flags, results + output text.
   * - submissions panel: list, loading, error.
   * - activeTab: explanation vs submissions.
   * - language: future-proofing, even if only IsiPython is present now.
   * - output panel sizing: height and drag state.
   * - hiddenTestStats: summarized hidden tests returned by backend.
   */
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string>(defaultStarterCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"explanation" | "submissions">(
    "explanation"
  );
  const [language, setLanguage] = useState<string>("IsiPython");
  const [output, setOutput] = useState<string>("");
  const [outputPanelHeight, setOutputPanelHeight] = useState<number>(300);
  const [isResizingOutput, setIsResizingOutput] = useState<boolean>(false);

  const [hiddenTestStats, setHiddenTestStats] = useState<{
    passed: number;
    failed: number;
    total: number;
  }>({
    passed: 0,
    failed: 0,
    total: 0,
  });

  /**
   * Fetch challenge details on mount/param change.
   * Why: centralizes initial page data; guards handle aborts during rapid nav.
   */
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

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

        // Small artificial delay to smooth UI transitions; harmless if aborted
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 200);
        });
        if (abortController.signal.aborted || !isMounted) return;

        const challengeDetails = await getChallengeDetails(
          challengeId,
          userId,
          abortController.signal
        );
        if (abortController.signal.aborted || !isMounted) return;

        if (challengeDetails.error) {
          if (isMounted) {
            setError(challengeDetails.error);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setChallenge(challengeDetails);
          setCode(defaultStarterCode);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted && isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load challenge"
          );
          setLoading(false);
        }
      }
    };

    if (challengeId && userId) {
      // Slight jitter prevents thundering herd during route transitions
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
      // Abort on unmount/param change to avoid setState on unmounted component
      isMounted = false;
      abortController.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [challengeId, userId, getChallengeDetails, defaultStarterCode]);

  /**
   * Monaco language registration.
   * Why: registers custom IsiPython grammar/theme prior to editor mount.
   */
  const handleEditorWillMount = useCallback((monaco: any) => {
    registerIsiPython(monaco);
  }, []);

  /**
   * Back navigation
   * Why: preserve "challenges" tab selection when leaving.
   */
  const goBack = useCallback(() => {
    navigate("/dash", { state: { activeView: "challenges" } });
  }, [navigate]);

  /**
   * Clear the test area.
   * Why: lets users reset noisy output between runs.
   */
  const clearTestOutput = useCallback(() => {
    setTestResults([]);
    setOutput("");
    setHiddenTestStats({ passed: 0, failed: 0, total: 0 });
  }, []);

  /**
   * Begin output panel resize drag.
   * Why: UX affordance for vertical split tuning.
   */
  const handleOutputResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsResizingOutput(true);
      e.preventDefault();
    },
    []
  );

  /**
   * Resize handlers bound to document during drag.
   * Why: supports resizing outside the handle area until mouseup.
   */
  useEffect(() => {
    const handleOutputMouseMove = (e: MouseEvent) => {
      if (!isResizingOutput) return;
      const container = document.querySelector(".challenge-container");
      if (!container) return;

      const containerRect = (container as HTMLElement).getBoundingClientRect();
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

  /**
   * Helpers: transform API payloads to view models.
   * Why: normalize and decouple rendering from backend response shape.
   */
  const transformTestResults = useCallback((visibleTests: any[]) => {
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
      errorMessage: test.error_message || "",
      englishError: test.english_error || "",
      hasError:
        test.status === "failed" && (test.error_message || test.english_error),
    }));
  }, []);

  const transformSubmissions = useCallback((apiSubmissions: any[]) => {
    return apiSubmissions
      .map((submission) => ({
        id: submission.id,
        timestamp: new Date(submission.submitted_at),
        passed: submission.status === "passed",
        passedTests: submission.tests_passed,
        totalTests: submission.tests_total,
        code: submission.code,
        executionTime: Math.floor(Math.random() * 1000) + 100, // cosmetic only
        score: submission.score,
        status: submission.status,
        submissionId: submission.id,
        challengeId: submission.challenge_id,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  /**
   * Load submissions for the current challenge+user.
   * Why: lets users compare previous attempts and restore code.
   */
  const fetchSubmissions = useCallback(async () => {
    if (!challengeId || !userId) return;

    setSubmissionsLoading(true);
    setSubmissionsError(null);

    try {
      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}/submissions/${userId}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const result = await response.json();
          if (result.error) errorMessage = result.error;
          else if (result.message) errorMessage = result.message;
        } catch {
          // Swallow JSON parse errors; preserve original HTTP error message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        const transformedSubmissions = transformSubmissions(result.data);
        setSubmissions(transformedSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (err: unknown) {
      setSubmissionsError(
        err instanceof Error ? err.message : "Failed to load submissions"
      );
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [challengeId, userId, transformSubmissions]);

  /**
   * Tab change handler.
   * Why: lazy-load submissions only when user opens that tab.
   */
  const handleTabChange = useCallback(
    (newTab: "explanation" | "submissions") => {
      setActiveTab(newTab);
      if (newTab === "submissions" && challengeId && userId) {
        fetchSubmissions();
      }
    },
    [fetchSubmissions, challengeId, userId]
  );

  /**
   * Execute code against backend tests.
   * Why: central action of the solver; handles response shaping and UI output.
   */
  const runCode = useCallback(async () => {
    if (isRunning || !challengeId || !userId) return;

    setIsRunning(true);
    // Clear, human-friendly, no-emoji run banner
    setOutput(
      "Qalisa ukusebenza...\nLayisha i-Python interpreter...\nThumela ikhowudi yakho...\n"
    );

    try {
      const apiUrl = `https://isipython-dev.onrender.com/api/challenges/${challengeId}/submit`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, code }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const result = await response.json();
          if (result.validation_error) errorMessage = result.validation_error;
          else if (result.error) errorMessage = result.error;
          else if (result.message) errorMessage = result.message;
        } catch {
          // Ignore parse errors; keep HTTP status-based message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.test_results && result.test_results.visible_tests) {
        const transformedResults = transformTestResults(
          result.test_results.visible_tests
        );
        setTestResults(transformedResults);

        const passedCount = transformedResults.filter((r) => r.passed).length;
        const totalCount = transformedResults.length;

        // Hidden tests summary (not detailed)
        const hiddenTests = result.test_results.hidden_tests;
        const hiddenStats = {
          passed: hiddenTests ? hiddenTests.passed : 0,
          failed: hiddenTests ? hiddenTests.failed : 0,
          total: hiddenTests ? hiddenTests.total : 0,
        };
        setHiddenTestStats(hiddenStats);

        const totalPassedTests = result.tests_passed || passedCount;
        const totalTests = result.tests_total || totalCount;

        // Build a clean, readable summary (no emojis)
        let outputSummary = `Iziphumo zovavanyo:\n\n`;

        transformedResults.forEach((test, index) => {
          outputSummary += `Uvavanyo ${index + 1}: ${
            test.passed ? "KUPHUMELELE" : "KUHLULEKILE"
          }\n`;

          if (test.hasError && test.errorMessage) {
            outputSummary += `Impazamo: ${test.errorMessage}\n`;
          } else {
            if (test.input) outputSummary += `Input: ${test.input}\n`;
            outputSummary += `Okulindelwe: ${test.expectedOutput}\n`;
            outputSummary += `Okufunyenwe: ${test.actualOutput}\n`;
            if (test.explanation)
              outputSummary += `Incazelo: ${test.explanation}\n`;
          }
          outputSummary += `\n`;
        });

        outputSummary += `Isishwankathelo:\n`;
        outputSummary += `${totalPassedTests}/${totalTests} izivavanyo ziphumelele\n`;

        if (hiddenStats.total > 0) {
          outputSummary += `Izivivinyo ezifihlakeleyo: ${hiddenStats.passed}/${hiddenStats.total}`;
          if (hiddenStats.failed > 0)
            outputSummary += ` (${hiddenStats.failed} zihlulekile)`;
          outputSummary += `\n`;
        }

        if (result.score !== undefined) {
          outputSummary += `Amaphuzu: ${result.score}\n`;
        }
        if (result.status) {
          outputSummary += `Isimo: ${result.status}\n`;
        }

        setOutput(outputSummary);

        // Optimistically record a submission entry for the session list
        const newSubmission = {
          id: result.submission_id || `temp-${Date.now()}`,
          timestamp: new Date(),
          passed: result.status === "passed",
          passedTests: totalPassedTests,
          totalTests: totalTests,
          code,
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
    } catch (err: unknown) {
      // Provide a clear actionable message without emojis
      let errorMessage = "Error running code: ";
      if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error occurred";
      }
      errorMessage += "\n\nKhangela ikhowudi yakho uzame kwakhona!";
      setOutput(errorMessage);
      setTestResults([]);
      setHiddenTestStats({ passed: 0, failed: 0, total: 0 });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, challengeId, userId, code, transformTestResults]);

  /**
   * Submit code (alias of run).
   * Why: keeps API semantics future-proof if a separate submit is reintroduced.
   */
  const submitCode = useCallback(async () => {
    await runCode();
  }, [runCode]);

  // Small utils for rendering metadata
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }, []);

  const getSubmissionStatusColor = useCallback((passed: boolean) => {
    return passed
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("Loading Challenge...")}
          </h3>
          <p className="text-gray-600">
            {t("Please wait while we fetch the challenge details")}
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error || !challenge) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("Failed to Load Challenge")}
          </h3>
          <p className="text-gray-600 mb-4">
            {error || t("Challenge not found")}
          </p>
          <Button
            onClick={goBack}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Challenges")}
          </Button>
        </div>
      </div>
    );
  }

  // Main layout: left problem, right editor+output
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative overflow-hidden challenge-container">
      {/* Background decoration */}
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
              {t("SOLVING")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Split content */}
      <div className="flex-1 flex relative z-10 min-h-0">
        {/* Left: problem and submissions */}
        <div className="w-1/2 border-r border-gray-200/50 flex flex-col bg-white/80 backdrop-blur-sm min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tab headers */}
            <TabsList className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 rounded-none justify-start p-0 h-12 flex-shrink-0">
              <TabsTrigger
                value="explanation"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("Explanation")}
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {t("Submissions")}
                {submissions.length > 0 && (
                  <Badge className="ml-2 bg-cyan-100 text-cyan-700 text-xs px-1.5 py-0.5">
                    {submissions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {/* Explanation */}
              <TabsContent value="explanation" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
                      {t("Problem Statement")}
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {challenge.problemStatement || challenge.description}
                    </p>
                  </div>

                  {challenge.testCases && challenge.testCases.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                        {t("Examples")}
                      </h3>
                      <div className="space-y-4">
                        {challenge.testCases.map(
                          (testCase: any, index: number) => {
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
                                          {t("Input")}:
                                        </div>
                                        <code className="block text-cyan-600 font-mono bg-cyan-50/50 px-3 py-2 rounded border border-cyan-200/50 whitespace-pre-line">
                                          {inputDisplay}
                                        </code>
                                      </div>
                                    )}

                                    {testCase.expected_output && (
                                      <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                          {t("Output")}:
                                        </div>
                                        <code className="block text-green-600 font-mono bg-green-50/50 px-3 py-2 rounded border border-green-200/50 whitespace-pre-line">
                                          {testCase.expected_output}
                                        </code>
                                      </div>
                                    )}

                                    {testCase.explanation && (
                                      <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                          {t("Explanation")}:
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
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {challenge.constraints &&
                    challenge.constraints.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                          {t("Constraints")}
                        </h3>
                        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md">
                          <CardContent className="p-4">
                            <ul className="space-y-1">
                              {challenge.constraints.map(
                                (constraint: string, index: number) => (
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
                        {t("Tags")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {challenge.tags.map((tag: string, index: number) => (
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

              {/* Submissions */}
              <TabsContent value="submissions" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6">
                  {submissionsLoading && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t("Loading Submissions...")}
                        </h3>
                        <p className="text-gray-600">
                          {t(
                            "Fetching your submission history for this challenge"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {!submissionsLoading && submissionsError && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t("Failed to Load Submissions")}
                        </h3>
                        <p className="text-gray-600 mb-4">{submissionsError}</p>
                        <Button
                          onClick={fetchSubmissions}
                          variant="outline"
                          className="bg-white/80 border-gray-300/50 text-gray-900 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700"
                        >
                          {t("Try Again")}
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
                            {t("No submissions yet")}
                          </h3>
                          <p className="text-gray-600">
                            {t(
                              "Write code & submit to see your submission history"
                            )}
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
                            {t("Submission History")}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800">
                              {submissions.length} {t("submission(s)")}
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
                              {t("Refresh")}
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
                                      {t("Submission")}
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
                                      : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800"
                                  }`}
                                >
                                  {submission.passed
                                    ? t("Accepted")
                                    : t("Failed")}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    {t("Test Results")}:
                                  </span>
                                  <p className="font-medium">
                                    {submission.passedTests}/
                                    {submission.totalTests} {t("tests passed")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    {t("Score")}:
                                  </span>
                                  <p className="font-medium">
                                    {submission.score || 0} {t("points")}
                                  </p>
                                </div>
                              </div>

                              {submission.code && (
                                <div className="mt-3 p-3 bg-gray-50/50 rounded border border-gray-200/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                      {t("Ikhowudi")}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setCode(submission.code)}
                                      className="text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 p-1 h-auto"
                                    >
                                      {t("Load Code")}
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
                                    {t(
                                      "Some test cases failed. Review your solution and try again."
                                    )}
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

        {/* Right: editor and output */}
        <div className="w-1/2 flex flex-col bg-white/80 backdrop-blur-sm min-h-0">
          {/* Editor toolbar */}
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
                      {t("Running")}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t("Run")}
                    </>
                  )}
                </Button>

                {/* Submit button kept commented (no behavior change) */}
                {/* <Button
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
                </Button> */}
              </div>
            </div>
          </div>

          {/* Editor */}
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

          {/* Output panel (resizable) */}
          <div
            className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex flex-col"
            style={{ height: `${outputPanelHeight}px` }}
          >
            {/* Resize handle */}
            <div
              className="w-full h-1 bg-transparent hover:bg-cyan-400 cursor-row-resize transition-colors duration-200 flex-shrink-0"
              onMouseDown={handleOutputResizeStart}
              title="Drag to resize output panel"
            >
              <div className="w-full h-1 bg-gray-300 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Output header */}
            <div className="bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  {t("Test Case Outputs")}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Hidden tests summary badge */}
                  {hiddenTestStats.total > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {t("Hidden")}: {hiddenTestStats.passed}/
                        {hiddenTestStats.total}
                      </Badge>
                    </div>
                  )}

                  {/* Clear output */}
                  {(testResults.length > 0 || output) && (
                    <Button
                      onClick={clearTestOutput}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                      title="Clear test output"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  {(isRunning || isSubmitting) && (
                    <Activity className="w-4 h-4 text-green-500 animate-spin" />
                  )}
                </div>
              </div>
            </div>

            {/* Output content */}
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
                      {/* Test header */}
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
                            {t("Test")} {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-xs font-medium text-green-700 bg-green-100/70 px-2 py-1 rounded-full">
                                {t("PASSED")}
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-xs font-medium text-red-700 bg-red-100/70 px-2 py-1 rounded-full">
                                {t("FAILED")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Test content */}
                      <div className="px-4 pb-4 space-y-3">
                        {/* Error block (runtime/validation) */}
                        {result.hasError && result.errorMessage && (
                          <div className="bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200/50 p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                  Impazamo (Error)
                                </div>
                                <p className="text-sm text-red-700 leading-relaxed">
                                  {result.errorMessage}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Input */}
                        {result.input && (
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {t("Input")}
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                              <code className="block text-cyan-700 font-mono text-xs p-3 whitespace-pre-line leading-relaxed">
                                {result.input}
                              </code>
                            </div>
                          </div>
                        )}

                        {/* Expected vs Actual (only if no error) */}
                        {!result.hasError && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {t("Expected Output")}
                              </div>
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-green-200/50 shadow-sm min-h-[60px] flex items-start">
                                <code className="block text-green-700 font-mono text-xs p-3 whitespace-pre-line leading-relaxed w-full">
                                  {result.expectedOutput}
                                </code>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {t("Your Output")}
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
                                  {result.actualOutput || t("No output")}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Explanation */}
                        {result.explanation && (
                          <div className="mt-4 pt-3 border-t border-gray-200/50">
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {t("Explanation")}
                            </div>
                            <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                              <p className="text-gray-700 text-xs p-3 leading-relaxed">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Friendly nudge for mismatches (non-error) */}
                        {!result.passed && !result.hasError && (
                          <div className="mt-3 p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-red-700 leading-relaxed">
                                <span className="font-semibold">
                                  {t("Test Failed")}:
                                </span>{" "}
                                {t(
                                  "Your output doesn't match the expected result. Check your logic and try again."
                                )}
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
                      {t("Ready to Test Your Code")}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {!output
                        ? t(
                            "Click 'Run' to execute your code and see detailed test results with comparisons."
                          )
                        : t(
                            "Review the test results above or run your code again."
                          )}
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
