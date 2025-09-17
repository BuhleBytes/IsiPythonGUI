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
  Clock,
  Copy,
  Download,
  FileText,
  Globe,
  Languages,
  Play,
  RotateCcw,
  Save,
  Square,
  Terminal,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { debugHelper, isDebugError } from "../../debugHelper";
import { registerIsiPython } from "../../languages/isiPython";
import { useUserFiles } from "../../useUserFiles";
import { DebugPanel } from "./DebugPanel.tsx";

import { translateIsiPythonToPython } from "../../languages/IsiPythonTranslator";
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

interface ErrorCache {
  english: string[];
  isixhosa: string[];
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

// Default code in IsiPython to demonstrate translation
const defaultCode = `# Write code for your new file using IsiPython`;

// Helper functions to check API response status
const isWaitingForInput = (response: any) =>
  response?.waiting_for_input === true;
const isCompleted = (response: any) => response?.completed === true;

// TRANSLATION IS HANDLED BY THE IMPORTED isiPythonTranslator.ts FILE

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
  const { t } = useTranslation();

  // Add ref for Monaco editor instance
  const editorRef = useRef(null);
  const currentLineDecorationRef = useRef([]);
  const breakpointDecorationRef = useRef([]);
  // #endregion

  // #region Basic Editor States
  const [code, setCode] = useState(initialCode || defaultCode);
  const [translatedCode, setTranslatedCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pythonVersion, setPythonVersion] = useState("1.0");
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

  // Live Translation States
  const [liveTranslationEnabled, setLiveTranslationEnabled] = useState(false);
  const [translationPanelWidth, setTranslationPanelWidth] = useState(400);
  const [isResizingTranslation, setIsResizingTranslation] = useState(false);

  // Error Language State
  const [errorLanguage, setErrorLanguage] = useState<"isixhosa" | "english">(
    "isixhosa"
  );

  // Error Caching States
  const [lastErrors, setLastErrors] = useState<ErrorCache | null>(null);
  const [cleanOutput, setCleanOutput] = useState<string>("");
  const [hasStoredErrors, setHasStoredErrors] = useState<boolean>(false);
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
  const debugAllOutputRef = useRef<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>(initialCode || defaultCode);
  const translationTimerRef = useRef<NodeJS.Timeout | null>(null);
  // #endregion

  // #region Monaco Editor Handler
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Set up breakpoint click handler on glyph margin
    editor.onMouseDown((e) => {
      const { target, position } = e;
      if (target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = position.lineNumber;
        toggleBreakpoint(lineNumber);
      }
    });
  };

  // Update breakpoint decorations when breakpoints change
  const updateBreakpointDecorations = useCallback(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const monaco = window.monaco;

    // Create decorations for breakpoints
    const decorations = breakpoints.map((bp) => ({
      range: new monaco.Range(bp.line, 1, bp.line, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: "breakpoint-glyph",
        glyphMarginHoverMessage: { value: "Click to toggle breakpoint" },
      },
    }));

    // Update decorations
    breakpointDecorationRef.current = editor.deltaDecorations(
      breakpointDecorationRef.current,
      decorations
    );
  }, [breakpoints]);

  useEffect(() => {
    updateBreakpointDecorations();
  }, [breakpoints, updateBreakpointDecorations]);

  // #region Update current line decoration when debugging
  useEffect(() => {
    if (editorRef.current && currentLine && isDebugging) {
      const editor = editorRef.current;
      const monaco = window.monaco;

      // Clear previous decorations
      currentLineDecorationRef.current = editor.deltaDecorations(
        currentLineDecorationRef.current,
        []
      );

      // Add new decoration for current line
      currentLineDecorationRef.current = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(currentLine, 1, currentLine, 1),
            options: {
              isWholeLine: true,
              className: "current-debug-line",
              glyphMarginClassName: "current-debug-line-glyph",
              linesDecorationsClassName: "current-debug-line-decoration",
            },
          },
        ]
      );
    } else if (editorRef.current && !isDebugging) {
      // Clear decorations when not debugging
      currentLineDecorationRef.current = editorRef.current.deltaDecorations(
        currentLineDecorationRef.current,
        []
      );
    }
  }, [currentLine, isDebugging]);

  // Add CSS styles for the debug line highlighting and breakpoints
  useEffect(() => {
    // Create or update the style element
    let styleElement = document.getElementById("editor-custom-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "editor-custom-styles";
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .current-debug-line {
        background-color: rgba(255, 235, 59, 0.3) !important;
        border: 1px solid rgba(255, 235, 59, 0.6) !important;
      }
      .current-debug-line-glyph {
        background-color: rgba(255, 235, 59, 0.5) !important;
      }
      .current-debug-line-decoration {
        background-color: rgba(255, 235, 59, 0.7) !important;
        width: 4px !important;
      }
      .breakpoint-glyph {
        background-color: #dc2626 !important;
        border-radius: 50% !important;
        width: 12px !important;
        height: 12px !important;
        margin-left: 2px !important;
        margin-top: 5px !important;
      }
      .breakpoint-glyph:hover {
        background-color: #b91c1c !important;
      }
    `;

    return () => {
      // Cleanup on unmount
      const element = document.getElementById("editor-custom-styles");
      if (element) {
        element.remove();
      }
    };
  }, []);
  // #endregion

  // #region Live Translation Logic
  useEffect(() => {
    if (!liveTranslationEnabled) {
      setTranslatedCode("");
      return;
    }

    // Clear existing timer
    if (translationTimerRef.current) {
      clearTimeout(translationTimerRef.current);
    }

    // Debounce translation to avoid excessive updates
    translationTimerRef.current = setTimeout(() => {
      // USING THE IMPORTED TRANSLATION FUNCTION FROM isiPythonTranslator.ts
      const translated = translateIsiPythonToPython(code);
      setTranslatedCode(translated);
    }, 200); // 200ms delay for more responsive feel

    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
    };
  }, [code, liveTranslationEnabled]);

  // Cleanup translation timer on unmount
  useEffect(() => {
    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
    };
  }, []);

  const toggleLiveTranslation = () => {
    const newState = !liveTranslationEnabled;
    setLiveTranslationEnabled(newState);

    if (newState) {
      // USING THE IMPORTED TRANSLATION FUNCTION FROM isiPythonTranslator.ts
      const translated = translateIsiPythonToPython(code);
      setTranslatedCode(translated);
    } else {
      // When disabling, clear translation
      setTranslatedCode("");
    }
  };

  const toggleErrorLanguage = () => {
    const newLanguage = errorLanguage === "isixhosa" ? "english" : "isixhosa";
    setErrorLanguage(newLanguage);

    // If we have stored errors, regenerate the output with the new language
    if (hasStoredErrors && lastErrors) {
      regenerateOutputWithNewLanguage(newLanguage);
    }
  };

  const regenerateOutputWithNewLanguage = (
    language: "english" | "isixhosa"
  ) => {
    if (!lastErrors) return;

    const errorsToShow =
      language === "english" ? lastErrors.english : lastErrors.isixhosa;

    if (errorsToShow.length > 0) {
      const errorTitle =
        language === "english" ? "Execution Error" : "Impazamo Yesicelo";
      const tryAgainText =
        language === "english"
          ? "Check your code and try again!"
          : "Khangela ikhowudi yakho uzame kwakhona!";

      const errorOutput = `\n❌ ${errorTitle}:\n${errorsToShow.join(
        "\n"
      )}\n\n🔧 ${tryAgainText}`;
      setOutput(cleanOutput + errorOutput);
    }
  };

  const getErrorMessage = (result: any) => {
    if (errorLanguage === "english" && result.english_error) {
      return result.english_error;
    }
    return result.error || result.english_error || "Unknown error";
  };
  // #endregion

  // #region Translation Panel Resize Logic
  const handleTranslationMouseDown = (e) => {
    setIsResizingTranslation(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleTranslationMouseMove = (e) => {
      if (!isResizingTranslation) return;

      const containerRect = document
        .querySelector(".editor-container")
        ?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate new width based on mouse position
      const mouseX = e.clientX;
      const newWidth = containerRect.right - rightPanelWidth - mouseX;
      const minWidth = 250;
      const maxWidth = Math.min(
        600,
        (containerRect.width - rightPanelWidth) * 0.7
      );

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setTranslationPanelWidth(newWidth);
      }
    };

    const handleTranslationMouseUp = () => {
      setIsResizingTranslation(false);
    };

    if (isResizingTranslation) {
      document.addEventListener("mousemove", handleTranslationMouseMove);
      document.addEventListener("mouseup", handleTranslationMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleTranslationMouseMove);
      document.removeEventListener("mouseup", handleTranslationMouseUp);
      if (!isResizing) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingTranslation, rightPanelWidth, isResizing]);
  // #endregion

  // #region Breakpoint Functions
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
      setIsDebugging(true);
      setShowDebugPanel(true);

      setOutput("");
      debugAllOutputRef.current = [];

      const response = await debugHelper.startDebugSession(code);

      if (isDebugError(response)) {
        const msg =
          (getErrorMessage(response) &&
            String(getErrorMessage(response)).trim()) ||
          "";
        if (msg) {
          setOutput(`❌ Debug error: ${msg}`);
        } else {
          // no message – don't print a "null" error line
          setOutput("");
        }
        setIsDebugging(false);
        return;
      }

      const newCurrentLine = response.current_line ?? 1;
      setCurrentLine(newCurrentLine);
      setDebugSessionId(response.session_id);

      let debugMessage = "";
      if (response.output) {
        debugMessage += `${response.output}\n`;
        debugAllOutputRef.current = [response.output];
      } else {
        setOutput("");
      }

      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        // print prompt only if it's NOT already included in output
        const promptMessage = response.prompt || "Enter input";
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      }

      const apiVariables =
        response.variables && typeof response.variables === "object"
          ? Object.entries(response.variables).map(([name, value]) => ({
              name,
              value: String(value),
              type: typeof value,
            }))
          : [];

      setDebugVariables(apiVariables);

      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
      setOutput(`❌ Failed to start debug session: ${error.message}`);
      setIsDebugging(false);
    }
  };
  const stepDebug = async () => {
    if (!debugSessionId || isStepInProgress) return;

    try {
      setIsStepInProgress(true);

      const response = await debugHelper.stepOnly(debugSessionId);

      if (isDebugError(response)) {
        // Use response.error directly like the original code, not getErrorMessage
        const msg = (response.error && String(response.error).trim()) || "";
        if (msg) {
          setOutput((prev) => prev + `\n❌ Debug error: ${msg}\n`);
        }
        // If there's no error message, just stop debugging gracefully without showing anything
        stopDebugging();
        return;
      }

      const newCurrentLine = response.current_line;
      setCurrentLine(newCurrentLine);

      let debugMessage = "";

      if (response.output) {
        const currentOutput = response.output;
        const currentDebugOutput = debugAllOutputRef.current;

        if (!currentDebugOutput.includes(currentOutput)) {
          if (currentDebugOutput.length > 0) {
            const lastOutput =
              currentDebugOutput[currentDebugOutput.length - 1];
            if (currentOutput.startsWith(lastOutput)) {
              const newPart = currentOutput
                .slice(lastOutput.length)
                .replace(/^\n+/, "");
              if (newPart) debugMessage += `${newPart}\n`;
            } else {
              debugMessage += `${currentOutput}\n`;
            }
          } else {
            debugMessage += `${currentOutput}\n`;
          }
          debugAllOutputRef.current.push(currentOutput);
        }
      }

      if (response.variables && typeof response.variables === "object") {
        const apiVariables = Object.entries(response.variables).map(
          ([name, value]) => ({
            name,
            value: String(value),
            type: typeof value,
          })
        );
        setDebugVariables(apiVariables);
      }

      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        const promptMessage = response.prompt || "Enter input";
        // avoid duplicate prompt when backend also echoes it in output
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      } else {
        setDebugWaitingForInput(false);
      }

      if (isCompleted(response)) {
        debugMessage += `✅ Program execution completed\n`;
        stopDebugging();
      }

      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
      setOutput((prev) => prev + `\n❌ Failed to step: ${error.message}\n`);
    } finally {
      setIsStepInProgress(false);
    }
  };
  const provideDebugInput = async (inputValue: string) => {
    if (!debugSessionId) return;

    try {
      setIsStepInProgress(true);
      setOutput((prev) => prev + `${inputValue}\n`);

      const response = await debugHelper.provideInput(
        debugSessionId,
        inputValue
      );

      if (isDebugError(response)) {
        const msg =
          (getErrorMessage(response) &&
            String(getErrorMessage(response)).trim()) ||
          "";
        if (msg) {
          setOutput((prev) => prev + `\n❌ Debug error: ${msg}\n`);
        }
        stopDebugging();
        return;
      }

      const newCurrentLine = response.current_line;
      setCurrentLine(newCurrentLine);

      let debugMessage = "";

      // Append any new output (with de-dup against previous frames)
      if (response.output) {
        const currentOutput = response.output;
        const currentDebugOutput = debugAllOutputRef.current;

        if (!currentDebugOutput.includes(currentOutput)) {
          if (currentDebugOutput.length > 0) {
            const lastOutput =
              currentDebugOutput[currentDebugOutput.length - 1];
            if (currentOutput.startsWith(lastOutput)) {
              const newPart = currentOutput
                .slice(lastOutput.length)
                .replace(/^\n+/, "");
              if (newPart) debugMessage += `${newPart}\n`;
            } else {
              debugMessage += `${currentOutput}\n`;
            }
          } else {
            debugMessage += `${currentOutput}\n`;
          }
          debugAllOutputRef.current.push(currentOutput);
        }
      }

      // Variables
      if (response.variables && typeof response.variables === "object") {
        const apiVariables = Object.entries(response.variables).map(
          ([name, value]) => ({
            name,
            value: String(value),
            type: typeof value,
          })
        );
        setDebugVariables(apiVariables);
      }

      // If still waiting for input, show prompt once (avoid duplicates)
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        const promptMessage = response.prompt || "Enter input";
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      } else {
        setDebugWaitingForInput(false);
      }

      if (isCompleted(response)) {
        debugMessage += `✅ Program execution completed\n`;
        stopDebugging();
      }

      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
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
    debugAllOutputRef.current = [];
    setDebugWaitingForInput(false);

    // Clear debug line decorations
    if (editorRef.current) {
      currentLineDecorationRef.current = editorRef.current.deltaDecorations(
        currentLineDecorationRef.current,
        []
      );
    }
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

  // Add effect for debug panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingDebugPanel) return;

      // Calculate new height from bottom of viewport
      const viewportHeight = window.innerHeight;
      const statusBarHeight = 40; // Approximate status bar height
      const toolbarHeight = 80; // Approximate toolbar height
      const availableHeight = viewportHeight - statusBarHeight - toolbarHeight;

      // Calculate distance from bottom
      const distanceFromBottom = viewportHeight - e.clientY;
      const newHeight = Math.max(
        180,
        Math.min(distanceFromBottom, availableHeight * 0.6)
      );

      setDebugPanelHeight(newHeight);
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
      if (!isResizing && !isResizingTranslation) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingDebugPanel, isResizing, isResizingTranslation]);
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
      if (!isResizingTranslation) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizing, sidebarOpen, onCloseSidebar, isResizingTranslation]);
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
            setHasUnsavedChanges(false);
            lastSavedCodeRef.current = code;
          } else {
            console.log("");
          }
        } catch (error) {
          console.log(
            `❌ Network error while renaming file\n🔧 Please check your connection and try again!\n`
          );
        }
      } else {
        if (onSave) {
          onSave(code, newFileName);
        }
        console.log(
          `📝 File renamed to: ${newFileName}\n⚡⚡ Save the file to persist the name!\n`
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

  // #region Run Code with Error Caching
  // Replace the existing handleRunCode function with this fixed version
  const handleRunCode = async () => {
    setIsRunning(true);
    setWaitingForInput(false);

    // Clear any stored errors when starting a new run
    setLastErrors(null);
    setCleanOutput("");
    setHasStoredErrors(false);

    let allOutput = [];
    let allErrors = [];
    setOutput("");
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
      }

      // Check for errors after loop completion
      if (result.error || result.english_error) {
        // Store both language versions for language switching
        const englishError =
          result.english_error || result.error || "Unknown error";
        const isixhosaError =
          result.error || result.english_error || "Unknown error";
        allErrors.push({ english: englishError, isixhosa: isixhosaError });
      }

      // Handle final output
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

      // NEW LOGIC: Only add frontend error formatting if the backend output doesn't already contain error messages
      if (allErrors.length > 0) {
        const currentOutput = output;

        // Check if the output already contains error indicators (common error patterns)
        const hasErrorInOutput =
          currentOutput.includes("SyntaxError:") ||
          currentOutput.includes("NameError:") ||
          currentOutput.includes("TypeError:") ||
          currentOutput.includes("ValueError:") ||
          currentOutput.includes("IndentationError:") ||
          currentOutput.includes("Execution Error:") ||
          currentOutput.includes("Impazamo Yesicelo:");

        if (!hasErrorInOutput) {
          // Only add our error formatting if the backend hasn't already formatted the error
          setCleanOutput(currentOutput);

          const englishErrors = allErrors.map((err) => err.english);
          const isixhosaErrors = allErrors.map((err) => err.isixhosa);

          setLastErrors({
            english: englishErrors,
            isixhosa: isixhosaErrors,
          });
          setHasStoredErrors(true);

          const errorsToShow =
            errorLanguage === "english" ? englishErrors : isixhosaErrors;
          const errorTitle =
            errorLanguage === "english"
              ? "Execution Error"
              : "Impazamo Yesicelo";
          const tryAgainText =
            errorLanguage === "english"
              ? "Check your code and try again!"
              : "Khangela ikhowudi yakho uzame kwakhona!";

          const errorOutput = `\n❌ ${errorTitle}:\n${errorsToShow.join(
            "\n"
          )}\n\n🔧 ${tryAgainText}`;
          setOutput((prev) => prev + errorOutput);
        } else {
          // If error is already in output, just store it for language switching
          setCleanOutput(currentOutput);
          const englishErrors = allErrors.map((err) => err.english);
          const isixhosaErrors = allErrors.map((err) => err.isixhosa);
          setLastErrors({
            english: englishErrors,
            isixhosa: isixhosaErrors,
          });
          setHasStoredErrors(true);
        }
      } else if (result.completed) {
        // Clear stored errors on successful completion
        setLastErrors(null);
        setCleanOutput("");
        setHasStoredErrors(false);
        setOutput((prev) => prev + `\n`);
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

    if (isDebugging && debugWaitingForInput) {
      provideDebugInput(input.trim());
      setInput("");
      setDebugWaitingForInput(false);
    } else if (inputResolver && waitingForInput) {
      clearTimeout(inputResolver.current.timeout);
      inputResolver.current(input.trim());
      setInputResolver(null);
      setInput("");
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

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
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleCopyTranslatedCode = () => {
    if (translatedCode.trim()) {
      navigator.clipboard.writeText(translatedCode);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
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
                <SelectItem value="1.0">IsiPython 1.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Translation Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLiveTranslation}
              className={`transition-all duration-200 ${
                liveTranslationEnabled
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title={
                liveTranslationEnabled
                  ? "Disable Live Translation"
                  : "Enable Live Translation"
              }
            >
              <Languages className="w-4 h-4" />
            </Button>

            {/* Error Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleErrorLanguage}
              className={`transition-all duration-200 ${
                errorLanguage === "english"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title={
                errorLanguage === "english"
                  ? "Switch to IsiXhosa Errors"
                  : "Switch to English Errors"
              }
            >
              <Globe className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Debug Controls */}
            {!isDebugging ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={startDebugging}
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                title="Start Debug Session"
              >
                <Bug className="h-4 w-4" />
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
              title="Copy IsiPython Code"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {/* Copy Python Translation Button - Only show when translation is active */}
            {liveTranslationEnabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyTranslatedCode}
                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Copy Python Translation"
                disabled={!translatedCode.trim()}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
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
                  {t("Running")}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t("Run")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Editor Container */}
        <div className="flex flex-1 min-h-0">
          {/* Left Side - IsiPython Code Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-200/50 min-w-0 editor-left-column">
            <div className="flex-1 min-h-0 monaco-editor-container">
              <Editor
                height="100%"
                language="isipython"
                value={code}
                onChange={(value) => handleCodeChange(value || "")}
                theme="isipython-theme"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  lineHeight: 22,
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 4,
                  padding: { top: 8, bottom: 8 },
                }}
              />
            </div>

            {/* Debug Panel */}
            {showDebugPanel && (
              <div
                className="border-t border-gray-200/50 bg-white/95 backdrop-blur-xl relative flex-shrink-0 flex flex-col"
                style={{
                  height: `${debugPanelHeight}px`,
                }}
              >
                {/* Resize handle for debug panel */}
                <div
                  className="absolute left-0 right-0 top-0 h-2 bg-transparent hover:bg-cyan-400 cursor-row-resize transition-colors duration-200 z-20"
                  onMouseDown={(e) => {
                    setIsResizingDebugPanel(true);
                    e.preventDefault();
                  }}
                  title="Drag to resize debug panel"
                >
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-200"></div>
                </div>

                <DebugPanel
                  isVisible={true}
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
              </div>
            )}
          </div>

          {/* Translation Panel - Only show when live translation is enabled */}
          {liveTranslationEnabled && (
            <div
              className="flex flex-col border-r border-gray-200/50 relative bg-white/95 backdrop-blur-sm"
              style={{ width: `${translationPanelWidth}px` }}
            >
              {/* Translation resize handle */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-orange-400 cursor-col-resize z-10 transition-colors duration-200"
                onMouseDown={handleTranslationMouseDown}
                title="Drag to resize translation panel"
              >
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gray-300 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </div>

              {/* Python Translation Editor - No header, direct editor */}
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language="python"
                  value={translatedCode}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    lineHeight: 22,
                    glyphMargin: false,
                    folding: false,
                    padding: { top: 8, bottom: 8 },
                  }}
                />

                {/* Overlay when no code */}
                {!translatedCode.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                    <div className="text-center text-gray-500">
                      <Languages className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Start typing IsiPython code</p>
                      <p className="text-xs">to see Python translation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  {t("Program Input")}
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
                        ? t(
                            "The debugger is waiting for your input! Write it above and press enter to continue debugging..."
                          )
                        : waitingForInput
                        ? t(
                            "The program is waiting for input! Write it here and press enter to continue"
                          )
                        : t("Enter input for your program...")
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
                        {t("Send")}
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
                      ? t(
                          "🛠 The debugger is waiting for your input! Write it above and press enter to continue debugging..."
                        )
                      : waitingForInput
                      ? t(
                          "⚡ The program is waiting for input! Write it above and press enter to continue..."
                        )
                      : t(
                          "💡 If your code requires input, enter it in the above box"
                        )}
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
                    {t("Output")}
                    {isRunning && (
                      <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setOutput("");
                      setLastErrors(null);
                      setCleanOutput("");
                      setHasStoredErrors(false);
                    }}
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
                    {t(output) ||
                      t("🚀Output will appear here \n  \n  \n  \n  \n  \n")}
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
              IsiPython {pythonVersion}
            </span>
            <span>UTF-8</span>
            <span>Ln {code.split("\n").length}, Col 1</span>
            <span className="font-medium">{currentFileName}</span>
            {fileId && (
              <span className="text-gray-500">
                Auto-save: {fileId ? "On" : "Off"}
              </span>
            )}
            {/* Live Translation Status */}
            {liveTranslationEnabled && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Languages className="w-3 h-3" />
                {t("Live Translation Active")}
              </span>
            )}
            {/* Error Language Status */}
            <span className="flex items-center gap-1 text-blue-600">
              <Globe className="w-3 h-3" />
              {errorLanguage === "english"
                ? "Errors: English"
                : "Amaphutha: IsiXhosa"}
            </span>
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
              {t("Debug")}
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
              {isRunning ? t("Executing") : t("Ready")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
