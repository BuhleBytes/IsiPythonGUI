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
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Code,
  FileText,
  Play,
  Send,
  Target,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  hidden?: boolean;
}

interface Challenge {
  id: number;
  title: string;
  difficulty: "Low" | "Medium" | "High";
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  testCases: TestCase[];
  starterCode: string;
}

const sampleChallenge: Challenge = {
  id: 1,
  title: "Two Sum",
  difficulty: "Low",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  testCases: [
    {
      id: 1,
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
    },
    {
      id: 2,
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
    },
    {
      id: 3,
      input: "nums = [3,3], target = 6",
      expectedOutput: "[0,1]",
    },
  ],
  starterCode: `# Bhala isisombululo sakho apha
def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
};

export function ChallengeSolverLight() {
  const [code, setCode] = useState(sampleChallenge.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [activeTab, setActiveTab] = useState("inkazeelo");
  const [language, setLanguage] = useState("IsiPython");
  const [output, setOutput] = useState("");
  const navigate = useNavigate();
  const goBack = () => {
    navigate("/dash", { state: { activeView: "challenges" } });
  };
  const runCode = async () => {
    setIsRunning(true);
    setOutput("🚀 Qalisa ukusebenza...\n⚡ Layisha i-Python interpreter...\n");

    setTimeout(() => {
      const results = sampleChallenge.testCases.map((testCase) => ({
        ...testCase,
        actualOutput: testCase.expectedOutput,
        passed: Math.random() > 0.3,
      }));

      setTestResults(results);
      const passedCount = results.filter((r) => r.passed).length;
      setOutput(
        `✨ Iziphumo zowavano:\n${results
          .map(
            (r, i) =>
              `Uvavanyo ${i + 1}: ${
                r.passed ? "✓ KUPHUMELELE" : "✗ KUHLULEKILE"
              }\nInput: ${r.input}\nOkulindelwe: ${
                r.expectedOutput
              }\nOkufunyenwe: ${r.actualOutput}\n`
          )
          .join("\n")}
\n${passedCount}/${results.length} izivivinyo ziphumelele`
      );
      setIsRunning(false);
    }, 2000);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setOutput(
        "🎉 Isisombululo singenisiwe ngempumelelo!\n✅ Zonke izivivinyo ziphumelele!"
      );
      setIsSubmitting(false);
    }, 1500);
  };

  const lineNumbers = code.split("\n").map((_, index) => index + 1);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative overflow-hidden">
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
                  {sampleChallenge.title}
                </h1>
                <p className="text-xs text-gray-600">
                  Intwayamanzi yomgeni • IsiPython
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
              <Zap className="w-3 h-3 mr-1" />
              UKUSOMBULULA
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
            {/* Tab Headers - Fixed */}
            <TabsList className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 rounded-none justify-start p-0 h-12 flex-shrink-0">
              <TabsTrigger
                value="inkazeelo"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Inkazeelo
              </TabsTrigger>
              <TabsTrigger
                value="isisombululo"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <Code className="w-4 h-4 mr-2" />
                Isisombululo
              </TabsTrigger>
              <TabsTrigger
                value="isubmissions"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-4 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50"
              >
                <Users className="w-4 h-4 mr-2" />
                iSubmissions
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="inkazeelo" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
                      Problem Statement
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {sampleChallenge.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-3">
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {sampleChallenge.examples.map((example, index) => (
                        <Card
                          key={index}
                          className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Input:
                                </span>
                                <code className="ml-2 text-cyan-600 font-mono bg-cyan-50/50 px-2 py-1 rounded border border-cyan-200/50">
                                  {example.input}
                                </code>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Output:
                                </span>
                                <code className="ml-2 text-green-600 font-mono bg-green-50/50 px-2 py-1 rounded border border-green-200/50">
                                  {example.output}
                                </code>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Explanation:
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

                  <div>
                    <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent mb-3">
                      Constraints
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 shadow-md">
                      <ul className="space-y-2">
                        {sampleChallenge.constraints.map(
                          (constraint, index) => (
                            <li
                              key={index}
                              className="text-gray-700 flex items-center gap-3"
                            >
                              <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex-shrink-0"></div>
                              <code className="font-mono text-sm bg-gray-100/80 px-2 py-1 rounded border border-gray-200/50">
                                {constraint}
                              </code>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Additional content to demonstrate scrolling */}
                  <div>
                    <h3 className="text-md font-semibold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-3">
                      Hints
                    </h3>
                    <div className="space-y-3">
                      <Card className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm border border-yellow-200/50 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">
                                1
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              Think about using a hash map to store the numbers
                              you've seen and their indices.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">
                                2
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              For each number, check if (target -
                              current_number) exists in your hash map.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-200/50 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">
                                3
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              The time complexity should be O(n) and space
                              complexity O(n).
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="isisombululo" className="h-full m-0 p-0">
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Code className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Isisombululo sizofika maduze
                    </h3>
                    <p className="text-gray-600">
                      Qedela umngeni ukuze uvule isisombululo.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="isubmissions" className="h-full m-0 p-0">
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Izingeniso zakho
                    </h3>
                    <p className="text-gray-600">
                      Akukho zingeniso okwamanje. Qala ukubhala ikhodi ukuze
                      ubone umlando!
                    </p>
                  </div>
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
                      Iyasebenza
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Qhuba
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
                      Iyagenisa
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ngenisa
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex min-h-0">
            {/* Line Numbers */}
            <div className="bg-gray-100/80 backdrop-blur-sm px-3 py-4 border-r border-gray-200/50 select-none flex-shrink-0">
              <div className="font-mono text-sm text-gray-500 space-y-1">
                {lineNumbers.map((num) => (
                  <div
                    key={num}
                    className="h-6 flex items-center justify-end pr-2"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 bg-white/60 backdrop-blur-sm min-w-0">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent border-0 resize-none font-mono text-sm text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none p-4"
                placeholder="# Bhala isisombululo sakho apha..."
                style={{ lineHeight: "1.5" }}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex-shrink-0">
            <div className="bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  Iziphumo zowavano
                </h3>
                {isRunning && (
                  <Activity className="w-4 h-4 text-green-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-4">
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
                          Uvavanyo {index + 1}
                        </span>
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 min-w-16">Input:</span>
                          <code className="text-cyan-600 font-mono bg-white/60 px-2 py-1 rounded border border-gray-200/50">
                            {result.input}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 min-w-16">
                            Okulindelwe:
                          </span>
                          <code className="text-green-600 font-mono bg-white/60 px-2 py-1 rounded border border-gray-200/50">
                            {result.expectedOutput}
                          </code>
                        </div>
                        {result.actualOutput && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 min-w-16">
                              Okufunyenwe:
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
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Terminal className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    {output ||
                      "Qhuba ikhodi yakho ukuze ubone iziphumo zowavano lapha..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
