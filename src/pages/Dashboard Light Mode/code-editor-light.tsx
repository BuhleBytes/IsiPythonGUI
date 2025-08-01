"use client";

// #region All of my imports
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import {
  Activity,
  AlertCircle,
  Bug,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  Download,
  FileText,
  Play,
  RotateCcw,
  Save,
  Square,
  Terminal,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { debugHelper, isDebugError } from "../../debugHelper";
import { registerIsiPython } from "../../languages/isiPython";
import { useUserFiles } from "../../useUserFiles";
import { DebugPanel } from "./DebugPanel";
// #endregion

// #region Debug Interfaces
interface Breakpoint {
  line: number;
  enabled: boolean;
}

interface Variable {
  name: string;
  value: string;
  type: string;
}
// #endregion

// #region Defining Interface Props
interface CodeEditorLightProps {
  initialCode?: string;
  fileName?: string;
  fileId?: string | null;
  onSave?: (code: string, fileName: string) => void;
  onCodeChange?: (
    code: string,
    fileName: string,
    hasUnsavedChanges: boolean
  ) => void;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}
// #endregion

const defaultCode = `# Write code for your new file
def fibonacci(n):
    if n <= 1:
        return n
    else:
        a, b = 0, 1
        for i in range(2, n + 1):
            a, b = b, a + b
        return b

def main():
    numbers = [5, 8, 10, 12]
    results = []
    
    for num in numbers:
        fib_result = fibonacci(num)
        results.append(fib_result)
        print(f"Fibonacci({num}) = {fib_result}")
    
    return results

if __name__ == "__main__":
    main()`;

// Helper functions to check API response status
const isWaitingForInput = (response: any) =>
  response?.waiting_for_input === true;
const isCompleted = (response: any) => response?.completed === true;

export function CodeEditorLight({
  initialCode,
  fileName,
  fileId,
  onSave,
  onCodeChange,
  sidebarOpen,
  onCloseSidebar,
}: CodeEditorLightProps) {
  // #region Editor Setup
  const handleEditorWillMount = (monaco) => {
    registerIsiPython(monaco);
  };
  const { saveNewFile } = useUserFiles();
  // #endregion

  // #region Basic Editor States
  const [code, setCode] = useState(initialCode || defaultCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pythonVersion, setPythonVersion] = useState("3.11");
  const [currentFileName, setCurrentFileName] = useState(
    fileName || "untitled.isi"
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputResolver, setInputResolver] = useState(null);
  const [rightPanelWidth, setRightPanelWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [tempFileName, setTempFileName] = useState(currentFileName);
  // #endregion

  // #region Debug States
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugPanelHeight, setDebugPanelHeight] = useState(250);
  const [isResizingDebugPanel, setIsResizingDebugPanel] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugSessionId, setDebugSessionId] = useState<string | null>(null);
  const [debugVariables, setDebugVariables] = useState<Variable[]>([]);
  const [isStepInProgress, setIsStepInProgress] = useState(false);
  const [debugWaitingForInput, setDebugWaitingForInput] = useState(false);
  // #endregion

  // #region Auto-save States
  const outputRef = useRef<HTMLDivElement>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>(initialCode || defaultCode);
  // #endregion

  // #region Breakpoint Functions
  const lines = code.split("\n");

  const toggleBreakpoint = (lineNumber: number) => {
    setBreakpoints((prev) => {
      const existing = prev.find((bp) => bp.line === lineNumber);
      if (existing) {
        return prev.filter((bp) => bp.line !== lineNumber);
      } else {
        return [...prev, { line: lineNumber, enabled: true }];
      }
    });
  };
  // #endregion

  // #region Debug Functions
  const startDebugging = async () => {
    try {
      console.log("🚀 Starting debug session...");
      setIsDebugging(true);
      setShowDebugPanel(true);

      const response = await debugHelper.startDebugSession(code);
      console.log("📥 Debug start response:", response);

      if (isDebugError(response)) {
        console.error("❌ Debug failed:", response);
        setOutput(`❌ Debug error: ${response.error}`);
        setIsDebugging(false);
        return;
      }

      // Update states with API response
      const newCurrentLine = response.current_line ?? 1;
      console.log("📍 Starting at line:", newCurrentLine);
      setCurrentLine(newCurrentLine);
      setDebugSessionId(response.session_id);

      // Check if waiting for input
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        setOutput(
          `🚀 Debug session started at ${new Date().toLocaleTimeString()}\n` +
            `🔧 Session ID: ${response.session_id}\n` +
            `📍 Starting at line: ${newCurrentLine}\n` +
            `${response.output || ""}\n` +
            `⌨️  Program is waiting for input. Please enter input in the input box and press Enter.\n`
        );
      } else {
        setOutput(
          `🚀 Debug session started at ${new Date().toLocaleTimeString()}\n` +
            `🔧 Session ID: ${response.session_id}\n` +
            `📍 Starting at line: ${newCurrentLine}\n` +
            `${response.output || ""}\n` +
            `\n✅ Ready to step through code! Click "Step" to continue.\n`
        );
      }

      // Update variables
      const apiVariables =
        response.variables && typeof response.variables === "object"
          ? Object.entries(response.variables).map(([name, value]) => ({
              name,
              value: String(value),
              type: typeof value,
            }))
          : [];

      console.log("📊 Initial variables:", apiVariables);
      setDebugVariables(apiVariables);

      console.log("✅ Debug session started successfully");
    } catch (error) {
      console.error("❌ Failed to start debugging:", error);
      setOutput(`❌ Failed to start debug session: ${error.message}`);
      setIsDebugging(false);
    }
  };

  const stepDebug = async () => {
    if (!debugSessionId || isStepInProgress) return;

    try {
      setIsStepInProgress(true);
      console.log("🔄 Stepping over with session:", debugSessionId);

      const response = await debugHelper.stepOnly(debugSessionId);
      console.log("📥 Step response:", response);

      if (isDebugError(response)) {
        console.error("❌ Debug step error:", response.error);
        setOutput((prev) => prev + `\n❌ Debug error: ${response.error}\n`);
        stopDebugging();
        return;
      }

      // Update current line
      const newCurrentLine = response.current_line;
      console.log("📍 Moving to line:", newCurrentLine);
      setCurrentLine(newCurrentLine);

      // Format debug output
      const timestamp = new Date().toLocaleTimeString();
      const currentLineCode = lines[newCurrentLine - 1]?.trim() || "N/A";

      let debugMessage = `\n[${timestamp}] STEP: line ${newCurrentLine}\n`;
      debugMessage += `🔍 Executing: ${currentLineCode}\n`;

      // Update variables
      if (response.variables && typeof response.variables === "object") {
        const apiVariables = Object.entries(response.variables).map(
          ([name, value]) => ({
            name,
            value: String(value),
            type: typeof value,
          })
        );

        setDebugVariables(apiVariables);
        debugMessage += `🔢 Variables in scope: ${apiVariables.length}\n`;
      }

      // Add program output if any
      if (response.output) {
        debugMessage += `📤 Program output: ${response.output}\n`;
      }

      // Check if waiting for input
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        debugMessage += `⌨️  Waiting for user input: ${
          response.prompt || "Enter input"
        }\n`;
      } else {
        setDebugWaitingForInput(false);
      }

      // Check if completed
      if (isCompleted(response)) {
        debugMessage += `✅ Program execution completed\n`;
        stopDebugging();
      }

      setOutput((prev) => prev + debugMessage);

      console.log("✅ Step completed successfully");
    } catch (error) {
      console.error("❌ Step failed:", error);
      setOutput((prev) => prev + `\n❌ Failed to step: ${error.message}\n`);
    } finally {
      setIsStepInProgress(false);
    }
  };

  const provideDebugInput = async (inputValue: string) => {
    if (!debugSessionId) return;

    try {
      console.log("🔄 Providing debug input:", inputValue);
      setIsStepInProgress(true);

      const response = await debugHelper.provideInput(
        debugSessionId,
        inputValue
      );
      console.log("📥 Debug input response:", response);

      if (isDebugError(response)) {
        console.error("❌ Debug input error:", response.error);
        setOutput((prev) => prev + `\n❌ Debug error: ${response.error}\n`);
        stopDebugging();
        return;
      }

      // Update current line
      const newCurrentLine = response.current_line;
      console.log("📍 Moving to line:", newCurrentLine);
      setCurrentLine(newCurrentLine);

      // Format debug output
      const timestamp = new Date().toLocaleTimeString();
      const currentLineCode = lines[newCurrentLine - 1]?.trim() || "N/A";

      let debugMessage = `\n[${timestamp}] INPUT PROVIDED: "${inputValue}"\n`;
      debugMessage += `🔍 Executing: ${currentLineCode}\n`;

      // Update variables
      if (response.variables && typeof response.variables === "object") {
        const apiVariables = Object.entries(response.variables).map(
          ([name, value]) => ({
            name,
            value: String(value),
            type: typeof value,
          })
        );

        setDebugVariables(apiVariables);
        debugMessage += `🔢 Variables in scope: ${apiVariables.length}\n`;
      }

      // Add program output if any
      if (response.output) {
        debugMessage += `📤 Program output: ${response.output}\n`;
      }

      // Check if still waiting for more input
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        debugMessage += `⌨️  Waiting for more input: ${
          response.prompt || "Enter input"
        }\n`;
      } else {
        setDebugWaitingForInput(false);
      }

      // Check if completed
      if (isCompleted(response)) {
        debugMessage += `✅ Program execution completed\n`;
        stopDebugging();
      }

      setOutput((prev) => prev + debugMessage);

      console.log("✅ Debug input provided successfully");
    } catch (error) {
      console.error("❌ Failed to provide debug input:", error);
      setOutput(
        (prev) => prev + `\n❌ Failed to provide input: ${error.message}\n`
      );
    } finally {
      setIsStepInProgress(false);
    }
  };

  const stopDebugging = () => {
    setIsDebugging(false);
    setCurrentLine(null);
    setDebugSessionId(null);
    setDebugVariables([]);
    setDebugWaitingForInput(false);

    setOutput(
      (prev) =>
        prev +
        `\n🛑 Debug session ended at ${new Date().toLocaleTimeString()}\n` +
        `✅ All resources cleaned up\n` +
        `🎯 Session completed successfully!\n\n` +
        `>>> Debug session terminated. Ready for next session.\n`
    );
  };
  // #endregion

  // #region Debug Panel Handlers
  const handleCurrentLineChange = (line: number | null) => {
    setCurrentLine(line);
  };

  const handleDebugPanelClose = () => {
    setShowDebugPanel(false);
    if (isDebugging) {
      stopDebugging();
    }
    setDebugWaitingForInput(false);
  };

  const handleDebugPanelHeightChange = (height: number) => {
    setDebugPanelHeight(height);
  };

  const handleDebugResizeStart = () => {
    setIsResizingDebugPanel(true);
  };

  const handleDebugResizeEnd = () => {
    setIsResizingDebugPanel(false);
  };
  // #endregion

  // #region Auto-save and other existing functionality (keeping original logic)
  const debouncedCodeChange = useCallback(
    (newCode: string) => {
      if (onCodeChange) {
        onCodeChange(newCode, currentFileName, hasUnsavedChanges);
      }
    },
    [onCodeChange, currentFileName, hasUnsavedChanges]
  );

  const memoizedSaveNewFile = useCallback(
    (fileName, code, fileId) => {
      return saveNewFile(fileName, code, fileId);
    },
    [saveNewFile]
  );

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (hasUnsavedChanges && fileId && code !== lastSavedCodeRef.current) {
      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus("saving");

        try {
          const result = await saveNewFile(currentFileName, code, fileId);

          if (result && (result.data || result.message)) {
            setAutoSaveStatus("saved");
            setHasUnsavedChanges(false);
            setLastAutoSaveTime(new Date());
            lastSavedCodeRef.current = code;

            setTimeout(() => {
              setAutoSaveStatus("idle");
            }, 2000);
          } else {
            setAutoSaveStatus("error");
            setTimeout(() => {
              setAutoSaveStatus("idle");
            }, 3000);
          }
        } catch (error) {
          setAutoSaveStatus("error");
          setTimeout(() => {
            setAutoSaveStatus("idle");
          }, 3000);
        }
      }, 3000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [code, hasUnsavedChanges, fileId, currentFileName, saveNewFile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedCodeChange(code);
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, debouncedCodeChange]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);
  // #endregion

  // #region Right Panel Resize (keeping original logic)
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerRect = document
        .querySelector(".editor-container")
        ?.getBoundingClientRect();
      if (!containerRect) return;

      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth * 0.7;

      const editorWidth = window.innerWidth - newWidth;
      const autoCloseSidebarThreshold = window.innerWidth * 0.75;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightPanelWidth(newWidth);

        if (
          editorWidth >= autoCloseSidebarThreshold &&
          sidebarOpen &&
          onCloseSidebar
        ) {
          onCloseSidebar();
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, sidebarOpen, onCloseSidebar]);
  // #endregion

  // #region Filename editing (keeping original logic)
  const handleFileNameClick = () => {
    setIsEditingFileName(true);
    setTempFileName(currentFileName);
  };

  const handleFileNameChange = (e) => {
    setTempFileName(e.target.value);
  };

  const handleFileNameSave = async () => {
    const newFileName = tempFileName.trim();

    if (newFileName && newFileName !== currentFileName) {
      setCurrentFileName(newFileName);

      if (fileId) {
        try {
          const result = await saveNewFile(newFileName, code, fileId);

          if (result && (result.data || result.message)) {
            setOutput(
              `📝 File renamed to: ${newFileName}\n✨ Backend updated successfully!\n${
                result.message || "Rename completed!"
              }\n`
            );
            setHasUnsavedChanges(false);
            lastSavedCodeRef.current = code;
          } else {
            setOutput(
              `❌ Failed to rename file to: ${newFileName}\n🔧 Backend update failed: ${
                result?.error || result?.message || "Unknown error"
              }\n🔧 Please try again!\n`
            );
          }
        } catch (error) {
          setOutput(
            `❌ Network error while renaming file\n🔧 Please check your connection and try again!\n`
          );
        }
      } else {
        if (onSave) {
          onSave(code, newFileName);
        }
        setOutput(
          `📝 File renamed to: ${newFileName}\n✨ Save the file to persist the name!\n`
        );
      }
    }

    setIsEditingFileName(false);
  };

  const handleFileNameKeyPress = async (e) => {
    if (e.key === "Enter") {
      await handleFileNameSave();
    } else if (e.key === "Escape") {
      handleFileNameCancel();
    }
  };

  const handleFileNameCancel = () => {
    setTempFileName(currentFileName);
    setIsEditingFileName(false);
  };

  const handleFileNameBlur = async () => {
    await handleFileNameSave();
  };
  // #endregion

  // #region Code change and file handling (keeping original logic)
  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode);
      setHasUnsavedChanges(false);
      lastSavedCodeRef.current = initialCode;
      setOutput("");
    }
  }, [initialCode]);

  useEffect(() => {
    if (fileName && fileName !== currentFileName) {
      setCurrentFileName(fileName);
      setTempFileName(fileName);
      setHasUnsavedChanges(false);
    }
  }, [fileName]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setHasUnsavedChanges(true);
    if (autoSaveStatus === "saved") {
      setAutoSaveStatus("idle");
    }
  };
  // #endregion

  // #region Run Code (keeping original logic)
  const handleRunCode = async () => {
    setIsRunning(true);
    setWaitingForInput(false);
    setOutput(
      "🚀 Initializing IsiPython execution environment...\n⚡ Loading IsiPython interpreter...\n🔥 Running your code...\n\n"
    );

    let allOutput = [];
    let allErrors = [];
    let sessionId = null;

    try {
      let response = await fetch(
        "https://isipython-dev.onrender.com/api/code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result = await response.json();
      sessionId = result.session_id;

      while (!result.completed) {
        if (result.output) {
          const currentOutput = result.output;
          if (!allOutput.includes(currentOutput)) {
            if (allOutput.length > 0) {
              const lastOutput = allOutput[allOutput.length - 1];
              if (currentOutput.startsWith(lastOutput)) {
                const newPart = currentOutput
                  .slice(lastOutput.length)
                  .replace(/^\n+/, "");
                if (newPart) {
                  setOutput((prev) => prev + newPart + "\n");
                }
              }
            } else {
              setOutput((prev) => prev + currentOutput + "\n");
            }
            allOutput.push(currentOutput);
          }
        }

        if (result.waiting_for_input) {
          setWaitingForInput(true);
          const userInput = await waitForUserInput();

          if (userInput !== null) {
            setWaitingForInput(false);
            setOutput((prev) => prev + `${userInput}\n`);

            response = await fetch(
              "https://isipython-dev.onrender.com/api/code",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  session_id: sessionId,
                  input: userInput,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            result = await response.json();
          } else {
            setWaitingForInput(false);
            break;
          }
        } else if (result.still_running) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          response = await fetch(
            "https://isipython-dev.onrender.com/api/code",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                session_id: sessionId,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          result = await response.json();
        } else {
          break;
        }

        if (result.error) {
          allErrors.push(result.error);
        }
      }

      if (result.output) {
        const currentOutput = result.output;
        if (
          allOutput.length === 0 ||
          currentOutput !== allOutput[allOutput.length - 1]
        ) {
          if (allOutput.length > 0) {
            const lastOutput = allOutput[allOutput.length - 1];
            if (currentOutput.startsWith(lastOutput)) {
              const newPart = currentOutput
                .slice(lastOutput.length)
                .replace(/^\n+/, "");
              if (newPart) {
                setOutput((prev) => prev + newPart + "\n");
              }
            }
          } else {
            setOutput((prev) => prev + currentOutput + "\n");
          }
        }
      }

      if (allErrors.length > 0) {
        setOutput(
          (prev) =>
            prev +
            `\n❌ Execution Error:\n${allErrors.join(
              "\n"
            )}\n\n🔧 Check your code and try again!`
        );
      } else if (result.completed) {
        setOutput(
          (prev) =>
            prev +
            `\n${"=".repeat(
              50
            )}\n✅ Process completed successfully\n💫 Execution finished`
        );
      }
    } catch (error) {
      setOutput(
        (prev) =>
          prev +
          `\n❌ Network/Connection Error:\n${error.message}\n\n🔧 Please check your internet connection and try again!`
      );
    } finally {
      setIsRunning(false);
      setWaitingForInput(false);
    }
  };

  const waitForUserInput = () => {
    return new Promise((resolve) => {
      const resolveRef = { current: resolve };
      setInputResolver(() => resolveRef);

      const timeout = setTimeout(() => {
        resolve(null);
        setInputResolver(null);
      }, 300000);

      resolveRef.timeout = timeout;
    });
  };

  const handleInputSubmit = () => {
    if (!input.trim()) return;

    // Check if we're in debug mode and waiting for debug input
    if (isDebugging && debugWaitingForInput) {
      // Provide debug input
      provideDebugInput(input.trim());
      setInput("");
      setDebugWaitingForInput(false);
    } else if (inputResolver && waitingForInput) {
      // Handle normal execution input
      clearTimeout(inputResolver.current.timeout);
      inputResolver.current(input.trim());
      setInputResolver(null);
      setInput("");
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Check if we're waiting for any kind of input (debug or normal execution)
      if (
        (isDebugging && debugWaitingForInput) ||
        (waitingForInput && inputResolver)
      ) {
        handleInputSubmit();
      }
    }
  };
  // #endregion

  // #region Save, Copy, Download functions (keeping original logic)
  const handleSave = (newFileName: string) => {
    setCurrentFileName(newFileName);
    if (onSave) {
      onSave(code, newFileName);
    }
    setHasUnsavedChanges(false);
    setOutput(
      `💾 File saved successfully: ${newFileName}\n✨ Your code is safe and sound!\n`
    );
  };

  const handleSaveNewFile = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setAutoSaveStatus("saving");

    try {
      const result = await saveNewFile(currentFileName, code, fileId);

      if (result && (result.data || result.message)) {
        setHasUnsavedChanges(false);
        lastSavedCodeRef.current = code;
        setLastAutoSaveTime(new Date());
        setAutoSaveStatus("saved");
        setOutput(
          `💾 File ${
            fileId ? "updated" : "saved"
          } successfully: ${currentFileName}\n✨ Your code is safe and sound!\n${
            result.message || "Operation completed successfully!"
          }\n`
        );

        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 2000);
      } else {
        setAutoSaveStatus("error");
        setOutput(
          `❌ Failed to ${
            fileId ? "update" : "save"
          } file: ${currentFileName}\n🔧 Error: ${
            result?.error || result?.message || "Invalid server response"
          }\n🔧 Please try again!\n`
        );

        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 3000);
      }
    } catch (error) {
      setAutoSaveStatus("error");
      setOutput(
        `❌ Network error while ${
          fileId ? "updating" : "saving"
        } file: ${currentFileName}\n🔧 Error: ${
          error.message
        }\n🔧 Please check your connection and try again!\n`
      );

      setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 3000);
    }
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

  const getAutoSaveStatusDisplay = () => {
    switch (autoSaveStatus) {
      case "saving":
        return {
          icon: Clock,
          text: "Saving...",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      case "saved":
        return {
          icon: CheckCircle,
          text: lastAutoSaveTime
            ? `Saved ${lastAutoSaveTime.toLocaleTimeString()}`
            : "Saved",
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: "Save failed",
          color: "text-red-600",
          bgColor: "bg-red-100",
        };
      default:
        return null;
    }
  };
  // #endregion

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative editor-container">
      {/* Fixed Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Top Toolbar */}
      <div className="relative z-10 border-b border-gray-200/50 p-4 bg-white/95 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>

              {/* Editable filename */}
              {isEditingFileName ? (
                <input
                  type="text"
                  value={tempFileName}
                  onChange={handleFileNameChange}
                  onKeyDown={handleFileNameKeyPress}
                  onBlur={handleFileNameBlur}
                  className="text-gray-900 font-semibold text-lg bg-white border-2 border-cyan-400 rounded px-2 py-1 focus:outline-none focus:border-cyan-600 min-w-0 max-w-xs"
                  autoFocus
                  placeholder="Enter filename..."
                />
              ) : (
                <span
                  className="text-gray-900 font-semibold text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200 select-none"
                  onClick={handleFileNameClick}
                  title="Click to rename file"
                >
                  {currentFileName}
                </span>
              )}

              {hasUnsavedChanges && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm animate-pulse">
                  Unsaved
                </Badge>
              )}

              {/* Auto-save status indicator */}
              {(() => {
                const statusDisplay = getAutoSaveStatusDisplay();
                if (!statusDisplay) return null;

                const {
                  icon: StatusIcon,
                  text,
                  color,
                  bgColor,
                } = statusDisplay;
                return (
                  <Badge
                    className={`${bgColor} ${color} border-0 shadow-sm flex items-center gap-1`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {text}
                  </Badge>
                );
              })()}
            </div>
            <Select value={pythonVersion} onValueChange={setPythonVersion}>
              <SelectTrigger className="w-36 bg-white/80 border-gray-300/50 text-gray-900 shadow-sm">
                <SelectValue placeholder="Python" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200 z-50">
                <SelectItem value="3.11">IsiPython 1.0</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-md">
              IsiPython IDE
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Debug Controls */}
            {!isDebugging ? (
              <Button
                onClick={startDebugging}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                Debug
              </Button>
            ) : (
              <>
                <Button
                  onClick={stepDebug}
                  disabled={isStepInProgress || debugWaitingForInput}
                  variant="outline"
                  size="sm"
                  className={`${
                    isStepInProgress || debugWaitingForInput
                      ? "text-gray-400 border-gray-400"
                      : "text-blue-600 border-blue-600 hover:bg-blue-50"
                  } transition-all duration-200`}
                  title={
                    debugWaitingForInput ? "Waiting for input" : "Step Over"
                  }
                >
                  {isStepInProgress ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={stopDebugging}
                  variant="destructive"
                  size="sm"
                  title="Stop Debug"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Original Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveNewFile}
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              title={fileId ? "Update File" : "Save File"}
              disabled={autoSaveStatus === "saving"}
            >
              {autoSaveStatus === "saving" ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
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

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Editor and Right Panel Container */}
        <div className="flex flex-1 min-h-0">
          {/* Left Side - Code Editor with Breakpoints */}
          <div className="flex-1 flex flex-col border-r border-gray-200/50 min-w-0 editor-left-column">
            <div className="flex flex-1 min-h-0">
              {/* Breakpoint gutter and line numbers */}
              <div className="flex bg-white border-r">
                {/* Breakpoint gutter */}
                <div className="w-8 bg-gray-50 border-r">
                  {lines.map((_, index) => {
                    const lineNumber = index + 1;
                    const hasBreakpoint = breakpoints.some(
                      (bp) => bp.line === lineNumber
                    );
                    return (
                      <div
                        key={lineNumber}
                        className="flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                        onClick={() => toggleBreakpoint(lineNumber)}
                        style={{
                          height: "22px",
                          lineHeight: "22px",
                          fontSize: "14px",
                        }}
                      >
                        {hasBreakpoint && (
                          <Circle className="h-3 w-3 fill-red-500 text-red-500 drop-shadow-sm" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Line numbers */}
                <div className="w-12 bg-gray-50 text-gray-500 text-sm font-mono border-r">
                  {lines.map((_, index) => (
                    <div
                      key={index + 1}
                      className="flex items-center justify-end pr-2 text-gray-500"
                      style={{
                        height: "22px",
                        lineHeight: "22px",
                        fontSize: "12px",
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Area */}
              <div className="flex-1 relative min-w-0 monaco-editor-container">
                <Editor
                  height="100%"
                  language="isipython"
                  value={code}
                  onChange={(value) => handleCodeChange(value || "")}
                  theme="isipython-theme"
                  beforeMount={handleEditorWillMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "off",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    lineHeight: 22,
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    padding: { top: 0, bottom: 0 },
                  }}
                />

                {/* Current line highlight for debugging */}
                {currentLine && (
                  <div
                    className="absolute left-0 right-0 bg-yellow-200 opacity-50 pointer-events-none z-10"
                    style={{
                      top: `${(currentLine - 1) * 22}px`,
                      height: "22px",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Debug Panel */}
            {showDebugPanel && (
              <DebugPanel
                isVisible={showDebugPanel}
                onClose={handleDebugPanelClose}
                variables={debugVariables}
                currentLine={currentLine}
                isDebugging={isDebugging}
                panelHeight={debugPanelHeight}
                onPanelHeightChange={handleDebugPanelHeightChange}
                isResizing={isResizingDebugPanel}
                onResizeStart={handleDebugResizeStart}
                onResizeEnd={handleDebugResizeEnd}
              />
            )}
          </div>

          {/* Right Panel - Input/Output */}
          <div
            className="flex flex-col flex-shrink-0 relative space-y-0"
            style={{ width: `${rightPanelWidth}px` }}
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-cyan-400 cursor-col-resize z-10 transition-colors duration-200"
              onMouseDown={handleMouseDown}
              title="Drag to resize panel"
            >
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gray-300 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Input Panel */}
            <Card className="h-60 bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-none border-b shadow-sm flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-600" />
                  Python Input
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 p-3">
                <div
                  className={`relative ${
                    waitingForInput || debugWaitingForInput
                      ? "input-waiting"
                      : ""
                  }`}
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyPress}
                    placeholder={
                      debugWaitingForInput
                        ? "Debug is waiting for input... Press Enter to submit"
                        : waitingForInput
                        ? "Program is waiting for input... Press Enter to submit"
                        : "Enter input for your program..."
                    }
                    className={`relative z-10 resize-none h-20 focus:ring-2 transition-all duration-300 ${
                      waitingForInput || debugWaitingForInput
                        ? "bg-cyan-50 border-cyan-400 text-cyan-900 placeholder-cyan-600 focus:ring-cyan-400/50 shadow-lg shadow-cyan-400/20"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:ring-cyan-400/30"
                    }`}
                    disabled={
                      isRunning && !waitingForInput && !debugWaitingForInput
                    }
                    autoFocus={waitingForInput || debugWaitingForInput}
                  />

                  {(waitingForInput || debugWaitingForInput) && (
                    <>
                      <div className="absolute inset-0 -z-10 rounded-md">
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-30"></div>
                      </div>
                      <button
                        onClick={handleInputSubmit}
                        className="absolute right-2 bottom-2 z-20 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!input.trim()}
                      >
                        Send
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs p-2 rounded-lg border transition-all duration-300 flex-1 ${
                      waitingForInput || debugWaitingForInput
                        ? "text-cyan-700 bg-cyan-50/80 border-cyan-200"
                        : "text-gray-600 bg-blue-50/50 border-blue-200/50"
                    }`}
                  >
                    {debugWaitingForInput
                      ? "🐛 Debug session is waiting for your input! Type above and press Enter to continue debugging..."
                      : waitingForInput
                      ? "⚡ Program is waiting for your input! Type above and press Enter to continue..."
                      : "💡 If your code takes input, add it in the above box before running"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="flex-1 bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-none shadow-sm flex flex-col min-h-0">
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
              <CardContent className="flex-1 min-h-0 p-3">
                <div
                  ref={outputRef}
                  className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200/70 rounded-lg p-4 h-full overflow-y-auto shadow-inner"
                >
                  <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {output ||
                      "🚀Output will appear here \n  \n  \n  \n  \n  \n"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Status Bar */}
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
            {fileId && (
              <span className="text-gray-500">
                Auto-save: {fileId ? "On" : "Off"}
              </span>
            )}
            {/* Debug Panel Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-6 px-2 transition-all duration-200 ${
                showDebugPanel ? "bg-cyan-50 text-cyan-600" : ""
              }`}
            >
              {showDebugPanel ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronUp className="w-3 h-3 mr-1" />
              )}
              Debug Panel
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">
              {fileId ? `ID: ${fileId.slice(0, 8)}...` : "New File"}
            </span>
            {isDebugging && (
              <span className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Debugging
                {currentLine && ` - Line ${currentLine}`}
                {debugWaitingForInput && " (Waiting for input)"}
              </span>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
