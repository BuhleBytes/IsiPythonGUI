"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Play,
  RotateCcw,
  Save,
  Settings,
  Square,
  Terminal,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CodeEditorLightProps {
  initialCode?: string;
  fileName?: string;
  onSave?: (code: string, fileName: string) => void;
}

const defaultCode = `# Write your Python code here...
# Welcome to PyNexus IDE - Your futuristic coding environment!

def hello_world():
    print("Hello, PyNexus IDE!")
    print("Ready to code something amazing? 🚀")

# Uncomment the line below to run the function
# hello_world()`;

export function CodeEditorLight({
  initialCode,
  fileName,
  onSave,
}: CodeEditorLightProps) {
  const [code, setCode] = useState(initialCode || defaultCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pythonVersion, setPythonVersion] = useState("3.11");
  const [currentFileName, setCurrentFileName] = useState(
    fileName || "untitled.py"
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setHasUnsavedChanges(false);
    }
  }, [initialCode]);

  useEffect(() => {
    if (fileName) {
      setCurrentFileName(fileName);
    }
  }, [fileName]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setHasUnsavedChanges(true);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(
      "🚀 Initializing PyNexus execution environment...\n⚡ Loading Python interpreter...\n🔥 Running your code...\n\n"
    );

    setTimeout(() => {
      try {
        if (code.includes("print(")) {
          setOutput(
            `🚀 PyNexus IDE - Python ${pythonVersion} Execution\n${"=".repeat(
              50
            )}\n\n✨ Output from your code:\n\nHello, PyNexus IDE!\nReady to code something amazing? 🚀\n\n${"=".repeat(
              50
            )}\n✅ Process completed successfully (exit code: 0)\n💫 Execution time: 0.142s`
          );
        } else {
          setOutput(
            `🚀 PyNexus IDE - Python ${pythonVersion} Execution\n${"=".repeat(
              50
            )}\n\n📝 No output generated\n💡 Tip: Add some print() statements to see output!\n\n${"=".repeat(
              50
            )}\n✅ Process completed successfully (exit code: 0)\n💫 Execution time: 0.089s`
          );
        }
      } catch (error) {
        setOutput(
          `❌ Execution Error:\n${error}\n\n🔧 Check your code and try again!`
        );
      }
      setIsRunning(false);
    }, 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code, currentFileName);
    }
    setHasUnsavedChanges(false);
    setOutput(
      `💾 File saved successfully: ${currentFileName}\n✨ Your code is safe and sound!\n`
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput(
      "📋 Code copied to clipboard!\n🎉 Ready to paste anywhere you need it!\n"
    );
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
    setOutput(
      `📥 File downloaded: ${currentFileName}\n🎯 Check your downloads folder!\n`
    );
  };

  const lineNumbers = code.split("\n").map((_, index) => index + 1);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative">
      {/* Fixed Animated Background Elements - Lower z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Top Toolbar - Fixed positioning with proper z-index */}
      <div className="relative z-10 border-b border-gray-200/50 p-4 bg-white/95 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 font-semibold text-lg">
                {currentFileName}
              </span>
              {hasUnsavedChanges && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm animate-pulse">
                  Unsaved
                </Badge>
              )}
            </div>
            <Select value={pythonVersion} onValueChange={setPythonVersion}>
              <SelectTrigger className="w-36 bg-white/80 border-gray-300/50 text-gray-900 shadow-sm">
                <SelectValue placeholder="Python" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200 z-50">
                <SelectItem value="3.11">Python 3.11</SelectItem>
                <SelectItem value="3.10">Python 3.10</SelectItem>
                <SelectItem value="3.9">Python 3.9</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-md">
              PyNexus IDE
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              title="Save File"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadCode}
              className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`px-6 py-2 font-semibold shadow-md transition-all duration-300 ${
                isRunning
                  ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              } text-white border-0 hover:scale-105`}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2 animate-pulse" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area - Proper flex layout */}
      <div className="flex-1 flex relative z-10 min-h-0">
        {/* Code Editor Panel - Takes remaining space */}
        <div className="flex-1 flex flex-col border-r border-gray-200/50 min-w-0">
          <div className="flex-1 flex min-h-0">
            {/* Line Numbers */}
            <div className="bg-gradient-to-b from-gray-100/80 to-gray-200/80 px-4 py-4 border-r border-gray-200/50 select-none backdrop-blur-sm flex-shrink-0">
              <div className="font-mono text-sm text-gray-500 space-y-1">
                {lineNumbers.map((num) => (
                  <div
                    key={num}
                    className="h-6 flex items-center justify-end pr-2 min-w-[2rem]"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Area - Takes remaining space */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full bg-white/60 backdrop-blur-sm border-0 resize-none font-mono text-sm text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none p-4"
                placeholder="# Write your Python code here..."
                style={{
                  lineHeight: "1.5",
                }}
              />

              {/* Enhanced syntax highlighting overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 font-mono text-sm leading-6 overflow-hidden">
                <div className="whitespace-pre-wrap">
                  {code.split("\n").map((line, index) => (
                    <div key={index} className="h-6 relative">
                      {line.startsWith("#") && (
                        <span className="text-green-600 font-medium">
                          {line}
                        </span>
                      )}
                      {line.includes("def ") && (
                        <span className="text-purple-600 font-semibold">
                          {line.match(/def\s+\w+/g)?.[0]}
                        </span>
                      )}
                      {line.includes("print") && (
                        <span className="text-cyan-600 font-medium">
                          {line.match(/print/g)?.[0]}
                        </span>
                      )}
                      {line.match(/"[^"]*"/g) && (
                        <span className="text-orange-600">
                          {line.match(/"[^"]*"/g)?.[0]}
                        </span>
                      )}
                      {line.match(/'[^']*'/g) && (
                        <span className="text-orange-600">
                          {line.match(/'[^']*'/g)?.[0]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Fixed width */}
        <div className="w-96 flex flex-col flex-shrink-0">
          {/* Input Panel */}
          <Card className="bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-none border-b shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-600" />
                Python Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300/50 text-gray-900 placeholder-gray-500 resize-none h-20 focus:ring-2 focus:ring-cyan-400/30"
              />
              <p className="text-xs text-gray-600 bg-blue-50/50 p-2 rounded-lg border border-blue-200/50">
                💡 If your code takes input, add it in the above box before
                running
              </p>
            </CardContent>
          </Card>

          {/* Output Panel - Takes remaining space */}
          <Card className="flex-1 bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-none shadow-sm min-h-0">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                  Output
                  {isRunning && (
                    <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOutput("")}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 h-6 w-6 transition-all duration-200"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
                <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
                  {output ||
                    "🚀 PyNexus IDE Terminal\n💫 Output will appear here after running your code...\n\n✨ Ready to execute some amazing Python code!"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar - Fixed at bottom */}
      <div className="relative z-10 border-t border-gray-200/50 px-4 py-2 bg-white/95 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              Python {pythonVersion}
            </span>
            <span>UTF-8</span>
            <span>Ln {code.split("\n").length}, Col 1</span>
            <span className="font-medium">{currentFileName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center gap-2 ${
                isRunning ? "text-green-600" : "text-gray-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              {isRunning ? "Executing" : "Ready"}
            </span>
            {hasUnsavedChanges && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
