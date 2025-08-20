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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { registerIsiPython } from "../../languages/isiPython";
import { useUser } from "../../useUser";
import { useUserChallenges } from "../../useUserChallenges";

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  hidden?: boolean;
}

interface Submission {
  id: number;
  timestamp: Date;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  code: string;
  executionTime?: number;
}

interface Challenge {
  id: number;
  title: string;
  difficulty: "Low" | "Medium" | "High";
  description: string;
  problemStatement?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints?: string[];
  testCases?: TestCase[];
  starterCode?: string;
  category?: string;
  tags?: string[];
  points?: number;
}

// Default starter code if none provided
const defaultStarterCode = `# Bhala isisombululo sakho apha
chaza solution():
    """
    Write your solution here
    """
    # Your code here
    pass`;

export function ChallengeSolverLight() {
  const { t } = useTranslation();
  const { id: challengeId } = useParams<{ id: string }>();
  const { userId } = useUser();
  const { getChallengeDetails } = useUserChallenges();
  const navigate = useNavigate();

  // Challenge data state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor and execution state
  const [code, setCode] = useState(defaultStarterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState(t("Explaination"));
  const [language, setLanguage] = useState("IsiPython");
  const [output, setOutput] = useState("");
  const [outputPanelHeight, setOutputPanelHeight] = useState(300);
  const [isResizingOutput, setIsResizingOutput] = useState(false);

  // Fetch challenge details when component mounts
  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!challengeId) {
        setError("No challenge ID provided");
        setLoading(false);
        return;
      }

      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🚀 Fetching challenge details for ID:", challengeId);
        const challengeDetails = await getChallengeDetails(challengeId, userId);

        if (challengeDetails.error) {
          setError(challengeDetails.error);
          return;
        }

        console.log("✅ Challenge details loaded:", challengeDetails);
        setChallenge(challengeDetails);

        // Set initial code - use starter code if available, otherwise default
        const initialCode =
          challengeDetails.starterCode ||
          challengeDetails.problemStatement ||
          defaultStarterCode;
        setCode(initialCode);
      } catch (err) {
        console.error("💥 Error fetching challenge:", err);
        setError(err.message || "Failed to load challenge");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [challengeId, userId, getChallengeDetails]);

  // Monaco Editor setup
  const handleEditorWillMount = (monaco) => {
    registerIsiPython(monaco);
  };

  const goBack = () => {
    navigate("/dash", { state: { activeView: "challenges" } });
  };

  // Output panel resize functionality
  const handleOutputResizeStart = (e) => {
    setIsResizingOutput(true);
    e.preventDefault();
  };

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

  const runCode = async () => {
    setIsRunning(true);
    setOutput("🚀 Qalisa ukusebenza...\n⚡ Layisha i-Python interpreter...\n");

    setTimeout(() => {
      // Mock test results - in real implementation, send code to execution API
      const mockResults =
        challenge?.testCases?.map((testCase) => ({
          ...testCase,
          actualOutput: testCase.expectedOutput,
          passed: Math.random() > 0.3,
        })) || [];

      setTestResults(mockResults);
      const passedCount = mockResults.filter((r) => r.passed).length;
      setOutput(
        `✨ Iziphumo zowavano:\n${mockResults
          .map(
            (r, i) =>
              `Uvavanyo ${i + 1}: ${
                r.passed ? "✅ KUPHUMELELE" : "❌ KUHLULEKILE"
              }\nInput: ${r.input}\nOkulindelwe: ${
                r.expectedOutput
              }\nOkufunyenwe: ${r.actualOutput}\n`
          )
          .join("\n")}
\n${passedCount}/${mockResults.length} izivivinyo ziphumelele`
      );
      setIsRunning(false);
    }, 2000);
  };

  const submitCode = async () => {
    setIsSubmitting(true);

    // Run tests first if not already run
    let currentResults = testResults;
    if (testResults.length === 0) {
      currentResults =
        challenge?.testCases?.map((testCase) => ({
          ...testCase,
          actualOutput: testCase.expectedOutput,
          passed: Math.random() > 0.3,
        })) || [];
      setTestResults(currentResults);
    }

    setTimeout(() => {
      const passedCount = currentResults.filter((r) => r.passed).length;
      const totalCount = currentResults.length;
      const allPassed = passedCount === totalCount;
      const executionTime = Math.floor(Math.random() * 1000) + 100;

      const newSubmission: Submission = {
        id: submissions.length + 1,
        timestamp: new Date(),
        passed: allPassed,
        passedTests: passedCount,
        totalTests: totalCount,
        code: code,
        executionTime: executionTime,
      };

      setSubmissions((prev) => [newSubmission, ...prev]);

      if (allPassed) {
        setOutput(
          "🎉 Isisombululo singenisiwe ngempumelelo!\n✅ Zonke izivivinyo ziphumelele!"
        );
      } else {
        setOutput(
          `🔍 Isisombululo singenisiwe!\n⚠️ ${passedCount}/${totalCount} izivivinyo ziphumelele\n💡 Zama kwakhona!`
        );
      }

      setIsSubmitting(false);
    }, 1500);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getSubmissionStatusColor = (passed: boolean) => {
    return passed
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";
  };

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
              {t("SOLVING")}
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
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tab Headers */}
            <TabsList className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 rounded-none justify-start p-0 h-12 flex-shrink-0">
              <TabsTrigger
                value={t("Explaination")}
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("Explaination")}
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

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value={t("Explaination")} className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
                      {t("Problem Statement")}
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {challenge.problemStatement || challenge.description}
                    </p>
                  </div>

                  {challenge.examples && challenge.examples.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                        {t("Examples")}
                      </h3>
                      <div className="space-y-4">
                        {challenge.examples.map((example, index) => (
                          <Card
                            key={index}
                            className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-gray-600">
                                    {t("Input")}:
                                  </span>
                                  <code className="ml-2 text-cyan-600 font-mono bg-cyan-50/50 px-2 py-1 rounded border border-cyan-200/50">
                                    {example.input}
                                  </code>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600">
                                    {t("Output")}:
                                  </span>
                                  <code className="ml-2 text-green-600 font-mono bg-green-50/50 px-2 py-1 rounded border border-green-200/50">
                                    {example.output}
                                  </code>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600">
                                    {t("Explaination")}:
                                  </span>
                                  <span className="ml-2 text-gray-700">
                                    {example.explanation}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
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
                  {submissions.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                          {t("Submission History")}
                        </h3>
                        <Badge className="bg-gray-100 text-gray-700">
                          {submissions.length} submission
                          {submissions.length !== 1 ? "s" : ""}
                        </Badge>
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
                                    Submission #{submission.id}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(submission.timestamp)}
                                  </p>
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
                                <span className="text-gray-600">
                                  Execution Time:
                                </span>
                                <p className="font-medium">
                                  {submission.executionTime}ms
                                </p>
                              </div>
                            </div>

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
                  disabled={isRunning}
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
                <Button
                  onClick={submitCode}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      {t("Submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("Submit")}
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
                  {t("Test Case Outputs")}
                </h3>
                {isRunning && (
                  <Activity className="w-4 h-4 text-green-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {testResults.length > 0 ? (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        result.passed
                          ? "bg-green-50/80 border-green-200/50 hover:bg-green-50"
                          : "bg-red-50/80 border-red-200/50 hover:bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {t("Test")} {index + 1}
                        </span>
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 min-w-16">
                            {t("Input")}:
                          </span>
                          <code className="text-cyan-600 font-mono bg-white/60 px-2 py-1 rounded border border-gray-200/50">
                            {result.input}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 min-w-16">
                            {t("Expected Output")}:
                          </span>
                          <code className="text-green-600 font-mono bg-white/60 px-2 py-1 rounded border border-gray-200/50">
                            {result.expectedOutput}
                          </code>
                        </div>
                        {result.actualOutput && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 min-w-16">
                              {t("Your program produced")}:
                            </span>
                            <code
                              className={`font-mono bg-white/60 px-2 py-1 rounded border border-gray-200/50 ${
                                result.passed
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {result.actualOutput}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Terminal className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      {output ||
                        t("Run your code to see the test results here...")}
                    </p>
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
