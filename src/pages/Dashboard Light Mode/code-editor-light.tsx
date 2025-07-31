"use client";

// #region All of my imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import { registerIsiPython } from "../../languages/isiPython";
import { useUserFiles } from "../../useUserFiles";

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
  Dot,
  Download,
  Eye,
  FileText,
  Layers,
  Play,
  RotateCcw,
  Save,
  Settings,
  Square,
  StepForward,
  StepBackIcon as StepInto,
  StepBackIcon as StepOut,
  Terminal,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

interface CallStackFrame {
  function: string;
  file: string;
  line: number;
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
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugOutput, setDebugOutput] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugPanelHeight, setDebugPanelHeight] = useState(250); // Reduced default height
  const [isResizingDebugPanel, setIsResizingDebugPanel] = useState(false);

  const [variables, setVariables] = useState<Variable[]>([
    { name: "n", value: "5", type: "int" },
    { name: "a", value: "0", type: "int" },
    { name: "b", value: "1", type: "int" },
    { name: "i", value: "2", type: "int" },
    { name: "numbers", value: "[5, 8, 10, 12]", type: "list" },
    { name: "results", value: "[]", type: "list" },
    { name: "fib_result", value: "5", type: "int" },
    { name: "num", value: "5", type: "int" },
    { name: "__name__", value: "'__main__'", type: "str" },
    {
      name: "fibonacci",
      value: "<function fibonacci at 0x7f8b8c0e4ca0>",
      type: "function",
    },
    {
      name: "main",
      value: "<function main at 0x7f8b8c0e4d30>",
      type: "function",
    },
    {
      name: "__builtins__",
      value: "<module 'builtins' (built-in)>",
      type: "module",
    },
    { name: "__doc__", value: "None", type: "NoneType" },
    { name: "__file__", value: "'untitled.isi'", type: "str" },
    { name: "__package__", value: "None", type: "NoneType" },
    { name: "__spec__", value: "None", type: "NoneType" },
    { name: "__cached__", value: "None", type: "NoneType" },
    {
      name: "__loader__",
      value: "<_frozen_importlib_external.SourceFileLoader>",
      type: "object",
    },
    { name: "temp_var", value: "42", type: "int" },
    {
      name: "debug_info",
      value: "{'session': 'active', 'line': 14}",
      type: "dict",
    },
    { name: "local_scope", value: "{'x': 1, 'y': 2, 'z': 3}", type: "dict" },
    { name: "nested_list", value: "[[1, 2], [3, 4], [5, 6]]", type: "list" },
    { name: "string_var", value: "'Hello, IsiPython!'", type: "str" },
    { name: "boolean_flag", value: "True", type: "bool" },
    { name: "float_num", value: "3.14159", type: "float" },
  ]);

  const [callStack, setCallStack] = useState<CallStackFrame[]>([
    { function: "fibonacci", file: "untitled.isi", line: 6 },
    { function: "main", file: "untitled.isi", line: 14 },
    { function: "<module>", file: "untitled.isi", line: 21 },
    { function: "<built-in>", file: "<built-in>", line: 1 },
    { function: "__init__", file: "debug_module.py", line: 45 },
    { function: "setup_environment", file: "env_config.py", line: 12 },
    { function: "load_dependencies", file: "loader.py", line: 78 },
    { function: "validate_input", file: "validator.py", line: 23 },
    { function: "process_data", file: "processor.py", line: 156 },
    { function: "handle_exception", file: "error_handler.py", line: 89 },
  ]);
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

  // #region Debug Functions
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

  const startDebugging = () => {
    setIsDebugging(true);
    setShowDebugPanel(true);
    setCurrentLine(1);
    setDebugOutput(`🚀 Debug session started at ${new Date().toLocaleTimeString()}
🔍 Initializing debugger...
✅ Debugger ready!
📝 Loading symbols...
🔧 Setting up breakpoints...
📊 Preparing variable inspection...
🎯 Debug session initialized successfully!

[DEBUG] Loaded 25 variables into scope
[DEBUG] Detected 10 stack frames
[DEBUG] Ready to step through code
[DEBUG] Breakpoints: ${breakpoints.length} active
[DEBUG] Current file: untitled.isi
[DEBUG] Python interpreter: IsiPython 1.0
[DEBUG] Memory usage: 45.2 MB
[DEBUG] Execution mode: Step-by-step

>>> Ready to debug! Use step controls to navigate.
`);

    // Update variables to reflect current debugging context
    setVariables((prev) =>
      prev.map((v) => ({
        ...v,
        value: v.name.startsWith("__") ? v.value : "undefined",
      }))
    );
  };

  const stopDebugging = () => {
    setIsDebugging(false);
    setCurrentLine(null);
    setIsRunning(false);
    setDebugOutput(
      (prev) =>
        prev +
        `
🛑 Debug session ended at ${new Date().toLocaleTimeString()}
📊 Session Summary:
   • Total steps executed: ${Math.floor(Math.random() * 20) + 5}
   • Functions called: ${callStack.length}
   • Variables tracked: ${variables.length}
   • Breakpoints hit: ${breakpoints.length}
   • Execution time: ${(Math.random() * 5 + 1).toFixed(2)}s
   • Memory peak: ${(Math.random() * 20 + 40).toFixed(1)} MB

📝 Debug log saved to session history
✅ All resources cleaned up
🎯 Session completed successfully!

>>> Debug session terminated. Ready for next session.
`
    );

    // Reset variables to default state
    setVariables([
      { name: "n", value: "5", type: "int" },
      { name: "a", value: "0", type: "int" },
      { name: "b", value: "1", type: "int" },
      { name: "i", value: "2", type: "int" },
      { name: "numbers", value: "[5, 8, 10, 12]", type: "list" },
      { name: "results", value: "[]", type: "list" },
      { name: "fib_result", value: "5", type: "int" },
      { name: "num", value: "5", type: "int" },
      { name: "__name__", value: "'__main__'", type: "str" },
      {
        name: "fibonacci",
        value: "<function fibonacci at 0x7f8b8c0e4ca0>",
        type: "function",
      },
      {
        name: "main",
        value: "<function main at 0x7f8b8c0e4d30>",
        type: "function",
      },
      {
        name: "__builtins__",
        value: "<module 'builtins' (built-in)>",
        type: "module",
      },
      { name: "__doc__", value: "None", type: "NoneType" },
      { name: "__file__", value: "'untitled.isi'", type: "str" },
      { name: "__package__", value: "None", type: "NoneType" },
      { name: "__spec__", value: "None", type: "NoneType" },
      { name: "__cached__", value: "None", type: "NoneType" },
      {
        name: "__loader__",
        value: "<_frozen_importlib_external.SourceFileLoader>",
        type: "object",
      },
      { name: "temp_var", value: "42", type: "int" },
      {
        name: "debug_info",
        value: "{'session': 'active', 'line': 14}",
        type: "dict",
      },
      { name: "local_scope", value: "{'x': 1, 'y': 2, 'z': 3}", type: "dict" },
      { name: "nested_list", value: "[[1, 2], [3, 4], [5, 6]]", type: "list" },
      { name: "string_var", value: "'Hello, IsiPython!'", type: "str" },
      { name: "boolean_flag", value: "True", type: "bool" },
      { name: "float_num", value: "3.14159", type: "float" },
    ]);
  };

  const stepOver = () => {
    if (currentLine && currentLine < lines.length) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);
      setDebugOutput(
        (prev) =>
          prev +
          `
[${new Date().toLocaleTimeString()}] STEP OVER: line ${nextLine}
🔍 Executing: ${lines[nextLine - 1]?.trim() || "N/A"}
📍 Current position: line ${nextLine}
🔢 Variables in scope: ${variables.length}
⏱️  Execution time: ${Math.random() * 10 + 1}ms
`
      );

      // Simulate variable updates based on line
      if (nextLine === 14) {
        setVariables((prev) =>
          prev.map((v) =>
            v.name === "numbers"
              ? { ...v, value: "[5, 8, 10, 12]" }
              : v.name === "results"
              ? { ...v, value: "[]" }
              : v
          )
        );
        setDebugOutput(
          (prev) => prev + `📝 Updated variables: numbers, results\n`
        );
      } else if (nextLine === 16) {
        setVariables((prev) =>
          prev.map((v) =>
            v.name === "num" ? { ...v, value: "5", type: "int" } : v
          )
        );
        setDebugOutput((prev) => prev + `📝 New variable: num = 5\n`);
      }
    }
  };

  const stepInto = () => {
    if (currentLine) {
      setDebugOutput(
        (prev) =>
          prev +
          `
[${new Date().toLocaleTimeString()}] STEP INTO: line ${currentLine}
🚪 Entering function call...
📍 Current line: ${lines[currentLine - 1]?.trim() || "N/A"}
🔍 Looking for function definition...
`
      );

      // Simulate entering function
      if (currentLine === 17) {
        setCurrentLine(3);
        setDebugOutput(
          (prev) =>
            prev +
            `
✅ Entered function: fibonacci(5)
📍 New position: line 3
🔢 Function parameters: n = 5
📊 Local scope created
⚡ Ready to execute function body
`
        );
        setVariables((prev) =>
          prev.map((v) =>
            v.name === "n" ? { ...v, value: "5", type: "int" } : v
          )
        );
      }
    }
  };

  const stepOut = () => {
    if (currentLine) {
      setDebugOutput(
        (prev) =>
          prev +
          `
[${new Date().toLocaleTimeString()}] STEP OUT: line ${currentLine}
🚪 Exiting current function...
📤 Returning to caller...
🔍 Cleaning up local scope...
`
      );

      // Simulate exiting function
      setCurrentLine(17);
      setDebugOutput(
        (prev) =>
          prev +
          `
✅ Exited function successfully
📍 Returned to: line 17
🔄 Return value: 5
📊 Local scope destroyed
⚡ Back in main execution context
`
      );
      setVariables((prev) =>
        prev.map((v) =>
          v.name === "fib_result" ? { ...v, value: "5", type: "int" } : v
        )
      );
    }
  };

  const continueExecution = () => {
    setIsRunning(true);
    setDebugOutput((prev) => prev + "Continuing execution...\n");

    // Simulate hitting next breakpoint
    setTimeout(() => {
      const nextBreakpoint = breakpoints.find(
        (bp) => bp.line > (currentLine || 0) && bp.enabled
      );
      if (nextBreakpoint) {
        setCurrentLine(nextBreakpoint.line);
        setIsRunning(false);
        setDebugOutput(
          (prev) => prev + `Breakpoint hit at line ${nextBreakpoint.line}\n`
        );
      }
    }, 1000);
  };
  // #endregion

  // #region Debug Panel Resize Handler
  const handleDebugPanelMouseDown = (e) => {
    setIsResizingDebugPanel(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingDebugPanel) return;

      const containerRect = document
        .querySelector(".editor-container")
        ?.getBoundingClientRect();
      if (!containerRect) return;

      const newHeight = containerRect.bottom - e.clientY;
      const minHeight = 180; // Minimum height for debug panel
      const maxHeight = window.innerHeight * 0.4; // Maximum 40% of screen height (reduced from 60%)

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setDebugPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingDebugPanel(false);
    };

    if (isResizingDebugPanel) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingDebugPanel]);
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
    if (inputResolver && input.trim()) {
      clearTimeout(inputResolver.current.timeout);
      inputResolver.current(input.trim());
      setInputResolver(null);
      setInput("");
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" && waitingForInput) {
      e.preventDefault();
      handleInputSubmit();
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
                  onClick={continueExecution}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  onClick={stepOver}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <StepForward className="h-4 w-4" />
                </Button>
                <Button
                  onClick={stepInto}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <StepInto className="h-4 w-4" />
                </Button>
                <Button
                  onClick={stepOut}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <StepOut className="h-4 w-4" />
                </Button>
                <Button onClick={stopDebugging} variant="destructive" size="sm">
                  <Square className="h-4 w-4" />
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
          <div className="flex-1 flex flex-col border-r border-gray-200/50 min-w-0">
            <div className="flex-1 flex min-h-0">
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
                          height: "22px", // Exact match with Monaco editor line height
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
                        height: "22px", // Exact match with Monaco editor line height
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
              <div className="flex-1 relative min-w-0">
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
                    lineNumbers: "off", // We're showing custom line numbers
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    lineHeight: 22, // Match our gutter height exactly
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    padding: { top: 0, bottom: 0 }, // Remove extra padding
                  }}
                />

                {/* Current line highlight for debugging */}
                {currentLine && (
                  <div
                    className="absolute left-0 right-0 bg-yellow-200 opacity-50 pointer-events-none z-10"
                    style={{
                      top: `${(currentLine - 1) * 22}px`, // Match exact line height
                      height: "22px",
                    }}
                  />
                )}
              </div>
            </div>
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
                    waitingForInput ? "input-waiting" : ""
                  }`}
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyPress}
                    placeholder={
                      waitingForInput
                        ? "Program is waiting for input... Press Enter to submit"
                        : "Enter input for your program..."
                    }
                    className={`relative z-10 resize-none h-20 focus:ring-2 transition-all duration-300 ${
                      waitingForInput
                        ? "bg-cyan-50 border-cyan-400 text-cyan-900 placeholder-cyan-600 focus:ring-cyan-400/50 shadow-lg shadow-cyan-400/20"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:ring-cyan-400/30"
                    }`}
                    disabled={isRunning && !waitingForInput}
                    autoFocus={waitingForInput}
                  />

                  {waitingForInput && (
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
                      waitingForInput
                        ? "text-cyan-700 bg-cyan-50/80 border-cyan-200"
                        : "text-gray-600 bg-blue-50/50 border-blue-200/50"
                    }`}
                  >
                    {waitingForInput
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

        {/* Bottom Debug Panel */}
        {showDebugPanel && (
          <div
            className="border-t border-gray-200/50 bg-white/95 backdrop-blur-xl relative flex-shrink-0"
            style={{ height: `${debugPanelHeight}px` }}
          >
            {/* Resize handle for debug panel */}
            <div
              className="absolute left-0 right-0 top-0 h-1 bg-transparent hover:bg-cyan-400 cursor-row-resize transition-colors duration-200"
              onMouseDown={handleDebugPanelMouseDown}
              title="Drag to resize debug panel"
            >
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Debug Panel Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-900">Debug Panel</span>
                {isDebugging && (
                  <Badge className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
                    <Dot className="w-3 h-3 fill-green-500 text-green-500" />
                    Active
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDebugPanel(false)}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 h-6 w-6"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Debug Tabs */}
            <Tabs
              defaultValue="variables"
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-3 pt-2 flex-shrink-0">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="variables" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Variables
                  </TabsTrigger>
                  <TabsTrigger value="callstack" className="text-xs">
                    <Layers className="h-3 w-3 mr-1" />
                    Stack
                  </TabsTrigger>
                  <TabsTrigger value="debugoutput" className="text-xs">
                    <Terminal className="h-3 w-3 mr-1" />
                    Debug Output
                  </TabsTrigger>
                  <TabsTrigger value="console" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Console
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="variables"
                className="flex-1 p-0 mt-2 min-h-0 overflow-hidden"
              >
                <Card className="h-full rounded-none border-0 flex flex-col">
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-full w-full">
                      <div className="divide-y divide-gray-200">
                        {variables.map((variable, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm font-semibold text-gray-800 truncate">
                                {variable.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {variable.type}
                              </div>
                            </div>
                            <div className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded border ml-2 flex-shrink-0">
                              {variable.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="callstack"
                className="flex-1 p-0 mt-2 min-h-0 overflow-hidden"
              >
                <Card className="h-full rounded-none border-0 flex flex-col">
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-full w-full">
                      <div className="divide-y divide-gray-200">
                        {callStack.map((frame, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-l-4 border-transparent hover:border-purple-300"
                          >
                            <div className="font-mono text-sm font-semibold text-purple-700">
                              {frame.function}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              📁 {frame.file}:{frame.line}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="debugoutput"
                className="flex-1 p-0 mt-2 min-h-0 overflow-hidden"
              >
                <Card className="h-full rounded-none border-0 flex flex-col">
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-full w-full">
                      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200/70 rounded-lg m-2 p-4 shadow-inner">
                        <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                          {debugOutput ||
                            "Debug output will appear here...\n\nThis area will show:\n• Step-by-step execution logs\n• Variable changes\n• Function calls and returns\n• Breakpoint hits\n• Error messages\n• Debug session status\n\nStart debugging to see real-time information!"}
                        </pre>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="console"
                className="flex-1 p-0 mt-2 min-h-0 overflow-hidden"
              >
                <Card className="h-full rounded-none border-0 flex flex-col">
                  <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200/70 rounded-lg m-2 p-4 shadow-inner">
                        <div className="text-sm font-mono text-slate-600 space-y-2">
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-500">
                              Interactive console ready...
                            </span>
                          </div>
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-700">
                              print("Hello, World!")
                            </span>
                          </div>
                          <div className="text-gray-600 ml-2">
                            Hello, World!
                          </div>
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-700">2 + 2</span>
                          </div>
                          <div className="text-blue-600 ml-2">4</div>
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-700">fibonacci(5)</span>
                          </div>
                          <div className="text-blue-600 ml-2">5</div>
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-700">
                              len([1, 2, 3, 4, 5])
                            </span>
                          </div>
                          <div className="text-blue-600 ml-2">5</div>
                          <div>
                            <span className="text-cyan-600">{"> "}</span>
                            <span className="text-gray-500">
                              You can evaluate expressions here during
                              debugging...
                            </span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    <Separator />
                    <div className="p-3 bg-white border-t flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-600 font-mono text-sm flex-shrink-0">
                          {"> "}
                        </span>
                        <input
                          type="text"
                          placeholder="Evaluate expression..."
                          className="flex-1 text-sm font-mono bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              // Handle console input
                              console.log("Console input:", e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
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
