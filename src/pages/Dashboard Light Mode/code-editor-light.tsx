/**
 * CodeEditorLight Component
 *
 * This is a comprehensive code editor specifically designed for IsiPython, a Python-like programming language
 * that can be translated to standard Python. The component provides:
 *
 * CORE FEATURES:
 * - Monaco-based code editor with custom IsiPython language support
 * - Live translation from IsiPython to Python with side-by-side view
 * - Code execution with input/output handling
 * - Interactive debugging with breakpoints, step-through, and variable inspection
 * - Auto-save functionality for file persistence
 * - Multi-language error messages (English/IsiXhosa)
 * - File management (save, download, copy, rename)
 * - Resizable panels for optimal workspace layout
 *
 * TECHNICAL ARCHITECTURE:
 * - Built with React hooks for state management
 * - Uses Monaco Editor for code editing capabilities
 * - Integrates with external APIs for code execution and debugging
 * - Implements real-time translation between IsiPython and Python
 * - Supports drag-to-resize panels for flexible UI layout
 *
 * The component is designed for educational use, particularly for users learning programming
 * concepts in IsiPython before transitioning to standard Python.
 */

"use client";

// Import all necessary UI components and utilities
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

// Monaco Editor for code editing functionality
import Editor from "@monaco-editor/react";

// Lucide React icons for UI elements
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

// React hooks and utilities
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Custom utilities and components
import { debugHelper, isDebugError } from "../../debugHelper";
import { registerIsiPython } from "../../languages/isiPython";
import { translateIsiPythonToPython } from "../../languages/IsiPythonTranslator";
import { useUserFiles } from "../../useUserFiles";
import { DebugPanel } from "./DebugPanel.tsx";

// TypeScript interfaces for type safety

/**
 * Represents a breakpoint in the debugger
 */
interface Breakpoint {
  line: number; // Line number where breakpoint is set
  enabled: boolean; // Whether the breakpoint is active
}

/**
 * Represents a variable in the debug session
 */
interface Variable {
  name: string; // Variable name
  value: string; // Variable value as string
  type: string; // Variable type (string, number, etc.)
}

/**
 * Cache for storing error messages in both languages
 */
interface ErrorCache {
  english: string[]; // Error messages in English
  isixhosa: string[]; // Error messages in IsiXhosa
}

/**
 * Props interface for the CodeEditorLight component
 */
interface CodeEditorLightProps {
  initialCode?: string; // Initial code to display in editor
  fileName?: string; // Name of the file being edited
  fileId?: string | null; // Unique identifier for the file
  onSave?: (code: string, fileName: string) => void; // Callback when file is saved
  onCodeChange?: (
    code: string,
    fileName: string,
    hasUnsavedChanges: boolean
  ) => void; // Callback when code changes
  sidebarOpen?: boolean; // Whether sidebar is open
  onCloseSidebar?: () => void; // Callback to close sidebar
}

/**
 * Helper functions to check API response status
 */
const isWaitingForInput = (response: any): boolean =>
  response?.waiting_for_input === true;

const isCompleted = (response: any): boolean => response?.completed === true;

/**
 * Main CodeEditorLight component
 */
export function CodeEditorLight({
  initialCode,
  fileName,
  fileId,
  onSave,
  onCodeChange,
  sidebarOpen,
  onCloseSidebar,
}: CodeEditorLightProps) {
  // Initialize hooks and utilities
  const { saveNewFile } = useUserFiles();
  const { t } = useTranslation();

  // Default code template for new files
  const defaultCode = t("# Write code for your new file using IsiPython");

  // References for Monaco editor and decorations
  const editorRef = useRef(null); // Reference to Monaco editor instance
  const currentLineDecorationRef = useRef([]); // Current line highlighting in debugger
  const breakpointDecorationRef = useRef([]); // Breakpoint visual indicators
  const outputRef = useRef<HTMLDivElement>(null); // Reference to output container
  const debugAllOutputRef = useRef<string[]>([]); // Store all debug output for deduplication
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for auto-save functionality
  const lastSavedCodeRef = useRef<string>(initialCode || defaultCode); // Track last saved code
  const translationTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for debounced translation

  // Core editor state management
  const [code, setCode] = useState(initialCode || defaultCode); // Current code in editor
  const [translatedCode, setTranslatedCode] = useState(""); // Python translation of IsiPython code
  const [input, setInput] = useState(""); // User input for program execution
  const [output, setOutput] = useState(""); // Program output display
  const [isRunning, setIsRunning] = useState(false); // Whether code is currently executing
  const [pythonVersion, setPythonVersion] = useState("1.0"); // IsiPython version selector
  const [currentFileName, setCurrentFileName] = useState(
    fileName || "untitled.isi"
  ); // Current file name
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track if file has unsaved changes
  const [waitingForInput, setWaitingForInput] = useState(false); // Whether execution is waiting for input
  const [inputResolver, setInputResolver] = useState(null); // Promise resolver for input handling

  // UI layout state management
  const [rightPanelWidth, setRightPanelWidth] = useState(384); // Width of right panel (output/input)
  const [isResizing, setIsResizing] = useState(false); // Whether user is resizing panels
  const [isEditingFileName, setIsEditingFileName] = useState(false); // Whether user is editing file name
  const [tempFileName, setTempFileName] = useState(currentFileName); // Temporary file name during editing

  // Live translation feature state
  const [liveTranslationEnabled, setLiveTranslationEnabled] = useState(false); // Enable/disable live translation
  const [translationPanelWidth, setTranslationPanelWidth] = useState(400); // Width of translation panel
  const [isResizingTranslation, setIsResizingTranslation] = useState(false); // Whether user is resizing translation panel

  // Error handling and language state
  const [errorLanguage, setErrorLanguage] = useState<"isixhosa" | "english">(
    "isixhosa"
  ); // Language for error messages
  const [lastErrors, setLastErrors] = useState<ErrorCache | null>(null); // Cache of last errors in both languages
  const [cleanOutput, setCleanOutput] = useState<string>(""); // Output without error formatting
  const [hasStoredErrors, setHasStoredErrors] = useState<boolean>(false); // Whether we have cached errors

  // Debugging feature state
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]); // List of breakpoints
  const [currentLine, setCurrentLine] = useState<number | null>(null); // Current line in debugger
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Whether debug panel is visible
  const [debugPanelHeight, setDebugPanelHeight] = useState(250); // Height of debug panel
  const [isResizingDebugPanel, setIsResizingDebugPanel] = useState(false); // Whether user is resizing debug panel
  const [isDebugging, setIsDebugging] = useState(false); // Whether debug session is active
  const [debugSessionId, setDebugSessionId] = useState<string | null>(null); // ID of current debug session
  const [debugVariables, setDebugVariables] = useState<Variable[]>([]); // Variables visible in debugger
  const [isStepInProgress, setIsStepInProgress] = useState(false); // Whether debug step is in progress
  const [debugWaitingForInput, setDebugWaitingForInput] = useState(false); // Whether debugger is waiting for input

  // Auto-save status tracking
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle"); // Current auto-save status
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null); // Timestamp of last auto-save

  /**
   * Monaco Editor Setup and Configuration
   */

  // Register custom IsiPython language with Monaco
  const handleEditorWillMount = (monaco) => {
    registerIsiPython(monaco);
  };

  // Handle Monaco editor mounting and setup event handlers
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Set up breakpoint click handler on gutter margin
    editor.onMouseDown((e) => {
      const { target, position } = e;
      // Check if user clicked on the gutter margin (where breakpoints are displayed)
      if (target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = position.lineNumber;
        toggleBreakpoint(lineNumber);
      }
    });
  };

  /**
   * Breakpoint Visual Management
   */

  // Update breakpoint decorations when breakpoints change
  const updateBreakpointDecorations = useCallback(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const monaco = window.monaco;

    // Create visual decorations for each breakpoint
    const decorations = breakpoints.map((bp) => ({
      range: new monaco.Range(bp.line, 1, bp.line, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: "breakpoint-glyph",
        glyphMarginHoverMessage: { value: "Click to toggle breakpoint" },
      },
    }));

    // Apply decorations to editor
    breakpointDecorationRef.current = editor.deltaDecorations(
      breakpointDecorationRef.current,
      decorations
    );
  }, [breakpoints]);

  // Apply breakpoint decorations when breakpoints change
  useEffect(() => {
    updateBreakpointDecorations();
  }, [breakpoints, updateBreakpointDecorations]);

  /**
   * Debug Line Highlighting Management
   */

  // Update current line decoration when debugging
  useEffect(() => {
    if (editorRef.current && currentLine && isDebugging) {
      const editor = editorRef.current;
      const monaco = window.monaco;

      // Clear previous current line decorations
      currentLineDecorationRef.current = editor.deltaDecorations(
        currentLineDecorationRef.current,
        []
      );

      // Add new decoration for current execution line
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

  /**
   * CSS Styles for Editor Decorations
   */

  // Inject custom CSS styles for debug line highlighting and breakpoints
  useEffect(() => {
    // Create or update the style element for custom editor styles
    let styleElement = document.getElementById("editor-custom-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "editor-custom-styles";
      document.head.appendChild(styleElement);
    }

    // Define CSS for debug line highlighting and breakpoint styling
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

    // Cleanup function to remove styles on component unmount
    return () => {
      const element = document.getElementById("editor-custom-styles");
      if (element) {
        element.remove();
      }
    };
  }, []);

  /**
   * Live Translation Logic
   */

  // Handle live translation when enabled and code changes
  useEffect(() => {
    if (!liveTranslationEnabled) {
      setTranslatedCode("");
      return;
    }

    // Clear existing translation timer to debounce rapid changes
    if (translationTimerRef.current) {
      clearTimeout(translationTimerRef.current);
    }

    // Debounce translation to avoid excessive updates during typing
    translationTimerRef.current = setTimeout(() => {
      // Translate IsiPython code to Python using imported translator
      const translated = translateIsiPythonToPython(code);
      setTranslatedCode(translated);
    }, 200); // 200ms delay for responsive feel

    // Cleanup timer on dependency change
    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
    };
  }, [code, liveTranslationEnabled]);

  // Cleanup translation timer on component unmount
  useEffect(() => {
    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
    };
  }, []);

  // Toggle live translation feature on/off
  const toggleLiveTranslation = () => {
    const newState = !liveTranslationEnabled;
    setLiveTranslationEnabled(newState);

    if (newState) {
      // Immediately translate current code when enabling
      const translated = translateIsiPythonToPython(code);
      setTranslatedCode(translated);
    } else {
      // Clear translation when disabling
      setTranslatedCode("");
    }
  };

  // Toggle between English and IsiXhosa error messages
  const toggleErrorLanguage = () => {
    const newLanguage = errorLanguage === "isixhosa" ? "english" : "isixhosa";
    setErrorLanguage(newLanguage);

    // If we have stored errors, regenerate output with new language
    if (hasStoredErrors && lastErrors) {
      regenerateOutputWithNewLanguage(newLanguage);
    }
  };

  // Regenerate output display with errors in the selected language
  const regenerateOutputWithNewLanguage = (
    language: "english" | "isixhosa"
  ) => {
    if (!lastErrors) return;

    const errorsToShow =
      language === "english" ? lastErrors.english : lastErrors.isixhosa;

    if (errorsToShow.length > 0) {
      const errorTitle =
        language === "english" ? "Execution Error" : "Impazamo";
      const tryAgainText =
        language === "english"
          ? "Check your code and try again!"
          : "Khangela ikhowudi yakho uzame kwakhona!";

      const errorOutput = `\nExecution Error:\n${errorsToShow.join(
        "\n"
      )}\n\n${tryAgainText}`;
      setOutput(cleanOutput + errorOutput);
    }
  };

  // Get appropriate error message based on selected language
  const getErrorMessage = (result: any) => {
    if (errorLanguage === "english" && result.english_error) {
      return result.english_error;
    }
    return result.error || result.english_error || "Unknown error";
  };

  /**
   * Panel Resizing Logic
   */

  // Handle translation panel resize initiation
  const handleTranslationMouseDown = (e) => {
    setIsResizingTranslation(true);
    e.preventDefault();
  };

  // Handle translation panel resizing
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

      // Apply width constraints and update if valid
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setTranslationPanelWidth(newWidth);
      }
    };

    const handleTranslationMouseUp = () => {
      setIsResizingTranslation(false);
    };

    // Add event listeners and set cursor when resizing
    if (isResizingTranslation) {
      document.addEventListener("mousemove", handleTranslationMouseMove);
      document.addEventListener("mouseup", handleTranslationMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener("mousemove", handleTranslationMouseMove);
      document.removeEventListener("mouseup", handleTranslationMouseUp);
      if (!isResizing) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingTranslation, rightPanelWidth, isResizing]);

  /**
   * Breakpoint Management
   */

  // Toggle breakpoint at specified line number
  const toggleBreakpoint = (lineNumber: number) => {
    setBreakpoints((prev) => {
      const existing = prev.find((bp) => bp.line === lineNumber);
      if (existing) {
        // Remove existing breakpoint
        return prev.filter((bp) => bp.line !== lineNumber);
      } else {
        // Add new breakpoint
        return [...prev, { line: lineNumber, enabled: true }];
      }
    });
  };

  /**
   * Debug Session Management
   */

  // Start a new debugging session
  const startDebugging = async () => {
    try {
      setIsDebugging(true);
      setShowDebugPanel(true);

      // Clear previous output and debug data
      setOutput("");
      debugAllOutputRef.current = [];

      // Start debug session with current code
      const response = await debugHelper.startDebugSession(code);

      // Handle debug errors
      if (isDebugError(response)) {
        const msg =
          (getErrorMessage(response) &&
            String(getErrorMessage(response)).trim()) ||
          "";
        if (msg) {
          setOutput(`Debug error: ${msg}`);
        } else {
          setOutput("");
        }
        setIsDebugging(false);
        return;
      }

      // Set up debug session state
      const newCurrentLine = response.current_line ?? 1;
      setCurrentLine(newCurrentLine);
      setDebugSessionId(response.session_id);

      // Handle initial debug output
      let debugMessage = "";
      if (response.output) {
        debugMessage += `${response.output}\n`;
        debugAllOutputRef.current = [response.output];
      } else {
        setOutput("");
      }

      // Handle input prompts
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        const promptMessage = response.prompt || "Enter input";
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      }

      // Parse and set debug variables
      const apiVariables =
        response.variables && typeof response.variables === "object"
          ? Object.entries(response.variables).map(([name, value]) => ({
              name,
              value: String(value),
              type: typeof value,
            }))
          : [];

      setDebugVariables(apiVariables);

      // Update output if there's debug message content
      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
      setOutput(`Failed to start debug session: ${error.message}`);
      setIsDebugging(false);
    }
  };

  // Execute a single debug step
  const stepDebug = async () => {
    if (!debugSessionId || isStepInProgress) return;

    try {
      setIsStepInProgress(true);

      const response = await debugHelper.stepOnly(debugSessionId);

      // Handle debug step errors
      if (isDebugError(response)) {
        const msg = (response.error && String(response.error).trim()) || "";
        if (msg) {
          setOutput((prev) => prev + `\nDebug error: ${msg}\n`);
        }
        stopDebugging();
        return;
      }

      // Update current execution line
      const newCurrentLine = response.current_line;
      setCurrentLine(newCurrentLine);

      let debugMessage = "";

      // Handle new output with deduplication
      if (response.output) {
        const currentOutput = response.output;
        const currentDebugOutput = debugAllOutputRef.current;

        // Check if this output is new (not already displayed)
        if (!currentDebugOutput.includes(currentOutput)) {
          if (currentDebugOutput.length > 0) {
            const lastOutput =
              currentDebugOutput[currentDebugOutput.length - 1];
            if (currentOutput.startsWith(lastOutput)) {
              // Extract only the new part of the output
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

      // Update debug variables
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

      // Handle input requests
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        const promptMessage = response.prompt || "Enter input";
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      } else {
        setDebugWaitingForInput(false);
      }

      // Handle program completion
      if (isCompleted(response)) {
        debugMessage += `Program execution completed\n`;
        stopDebugging();
      }

      // Update output with debug message
      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
      setOutput((prev) => prev + `\nFailed to step: ${error.message}\n`);
    } finally {
      setIsStepInProgress(false);
    }
  };

  // Provide input to debug session
  const provideDebugInput = async (inputValue: string) => {
    if (!debugSessionId) return;

    try {
      setIsStepInProgress(true);
      setOutput((prev) => prev + `${inputValue}\n`);

      const response = await debugHelper.provideInput(
        debugSessionId,
        inputValue
      );

      // Handle input provision errors
      if (isDebugError(response)) {
        const msg =
          (getErrorMessage(response) &&
            String(getErrorMessage(response)).trim()) ||
          "";
        if (msg) {
          setOutput((prev) => prev + `\nDebug error: ${msg}\n`);
        }
        stopDebugging();
        return;
      }

      // Update current line and handle response similar to stepDebug
      const newCurrentLine = response.current_line;
      setCurrentLine(newCurrentLine);

      let debugMessage = "";

      // Handle output with deduplication
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
      }

      // Handle continued input requests
      if (isWaitingForInput(response)) {
        setDebugWaitingForInput(true);
        const promptMessage = response.prompt || "Enter input";
        if (!response.output || !response.output.includes(promptMessage)) {
          debugMessage += `${promptMessage}\n`;
        }
      } else {
        setDebugWaitingForInput(false);
      }

      // Handle program completion
      if (isCompleted(response)) {
        debugMessage += `Program execution completed\n`;
        stopDebugging();
      }

      if (debugMessage) {
        setOutput((prev) => prev + debugMessage);
      }
    } catch (error: any) {
      setOutput(
        (prev) => prev + `\nFailed to provide input: ${error.message}\n`
      );
    } finally {
      setIsStepInProgress(false);
    }
  };

  // Stop current debugging session and clean up state
  const stopDebugging = () => {
    setIsDebugging(false);
    setCurrentLine(null);
    setDebugSessionId(null);
    setDebugVariables([]);
    debugAllOutputRef.current = [];
    setDebugWaitingForInput(false);

    // Clear debug line decorations from editor
    if (editorRef.current) {
      currentLineDecorationRef.current = editorRef.current.deltaDecorations(
        currentLineDecorationRef.current,
        []
      );
    }
  };

  /**
   * Debug Panel Event Handlers
   */

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

  /**
   * Debug Panel Resizing Logic
   */

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingDebugPanel) return;

      // Calculate new height from bottom of viewport
      const viewportHeight = window.innerHeight;
      const statusBarHeight = 40;
      const toolbarHeight = 80;
      const availableHeight = viewportHeight - statusBarHeight - toolbarHeight;

      // Calculate distance from bottom and apply constraints
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

    // Add event listeners when resizing debug panel
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

  /**
   * Auto-save and Code Change Management
   */

  // Debounced callback for code changes
  const debouncedCodeChange = useCallback(
    (newCode: string) => {
      if (onCodeChange) {
        onCodeChange(newCode, currentFileName, hasUnsavedChanges);
      }
    },
    [onCodeChange, currentFileName, hasUnsavedChanges]
  );

  // Memoized save function to prevent unnecessary re-renders
  const memoizedSaveNewFile = useCallback(
    (fileName, code, fileId) => {
      return saveNewFile(fileName, code, fileId);
    },
    [saveNewFile]
  );

  // Auto-save logic when code changes
  useEffect(() => {
    // Clear existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set up auto-save timer if there are unsaved changes and a file ID exists
    if (hasUnsavedChanges && fileId && code !== lastSavedCodeRef.current) {
      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus("saving");

        try {
          const result = await saveNewFile(currentFileName, code, fileId);

          if (result && (result.data || result.message)) {
            // Auto-save successful
            setAutoSaveStatus("saved");
            setHasUnsavedChanges(false);
            setLastAutoSaveTime(new Date());
            lastSavedCodeRef.current = code;

            // Clear saved status after 2 seconds
            setTimeout(() => {
              setAutoSaveStatus("idle");
            }, 2000);
          } else {
            // Auto-save failed
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
      }, 3000); // 3 second delay for auto-save
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [code, hasUnsavedChanges, fileId, currentFileName, saveNewFile]);

  // Debounced code change notification
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedCodeChange(code);
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, debouncedCodeChange]);

  // Auto-scroll output to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Cleanup auto-save timer on component unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  /**
   * Right Panel Resizing Logic
   */

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

      // Calculate new panel width
      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth * 0.7;

      const editorWidth = window.innerWidth - newWidth;
      const autoCloseSidebarThreshold = window.innerWidth * 0.75;

      // Apply width constraints
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightPanelWidth(newWidth);

        // Auto-close sidebar if editor gets too wide
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

  /**
   * File Name Editing Logic
   */

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

      // Save file with new name if file ID exists
      if (fileId) {
        try {
          const result = await saveNewFile(newFileName, code, fileId);

          if (result && (result.data || result.message)) {
            setHasUnsavedChanges(false);
            lastSavedCodeRef.current = code;
          }
        } catch (error) {
          // Handle network error silently - user will see via auto-save status
        }
      } else {
        // For new files, just update the name
        if (onSave) {
          onSave(code, newFileName);
        }
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

  /**
   * Code and File Management
   */

  // Handle initial code changes from props
  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode);
      setHasUnsavedChanges(false);
      lastSavedCodeRef.current = initialCode;
      setOutput("");
    }
  }, [initialCode]);

  // Handle file name changes from props
  useEffect(() => {
    if (fileName && fileName !== currentFileName) {
      setCurrentFileName(fileName);
      setTempFileName(fileName);
      setHasUnsavedChanges(false);
    }
  }, [fileName]);

  // Handle code changes in editor
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setHasUnsavedChanges(true);
    if (autoSaveStatus === "saved") {
      setAutoSaveStatus("idle");
    }
  };

  /**
   * Code Execution Logic
   */

  // Main function to run/execute the IsiPython code
  const handleRunCode = async () => {
    setIsRunning(true);
    setWaitingForInput(false);

    // Clear error cache when starting new execution
    setLastErrors(null);
    setCleanOutput("");
    setHasStoredErrors(false);

    let allOutput = [];
    let allErrors = [];
    setOutput("");
    let sessionId = null;

    try {
      // Initial API call to start code execution
      let response = await fetch(
        "https://isipython-dev.onrender.com/api/code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result = await response.json();
      sessionId = result.session_id;

      // Main execution loop - continue until program completes
      while (!result.completed) {
        // Handle program output with deduplication
        if (result.output) {
          const currentOutput = result.output;
          if (!allOutput.includes(currentOutput)) {
            if (allOutput.length > 0) {
              const lastOutput = allOutput[allOutput.length - 1];
              if (currentOutput.startsWith(lastOutput)) {
                // Extract only new part of output
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

        // Handle input requests
        if (result.waiting_for_input) {
          setWaitingForInput(true);
          const userInput = await waitForUserInput();

          if (userInput !== null) {
            setWaitingForInput(false);
            setOutput((prev) => prev + `${userInput}\n`);

            // Send input to API
            response = await fetch(
              "https://isipython-dev.onrender.com/api/code",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
          // Poll for continued execution
          await new Promise((resolve) => setTimeout(resolve, 500));

          response = await fetch(
            "https://isipython-dev.onrender.com/api/code",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId }),
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

      // Handle errors after execution completion
      if (result.error || result.english_error) {
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

      // Handle error formatting only if backend hasn't already formatted errors
      if (allErrors.length > 0) {
        const currentOutput = output;

        // Check if output already contains error indicators
        const hasErrorInOutput =
          currentOutput.includes("SyntaxError:") ||
          currentOutput.includes("NameError:") ||
          currentOutput.includes("TypeError:") ||
          currentOutput.includes("ValueError:") ||
          currentOutput.includes("IndentationError:") ||
          currentOutput.includes("Execution Error:") ||
          currentOutput.includes("Impazamo:");

        if (!hasErrorInOutput) {
          // Add frontend error formatting
          setCleanOutput(currentOutput);

          const englishErrors = allErrors.map((err) => err.english);
          const isixhosaErrors = allErrors.map((err) => err.isixhosa);

          setLastErrors({ english: englishErrors, isixhosa: isixhosaErrors });
          setHasStoredErrors(true);

          const errorsToShow =
            errorLanguage === "english" ? englishErrors : isixhosaErrors;
          const errorTitle =
            errorLanguage === "english" ? "Execution Error" : "Impazamo";
          const tryAgainText =
            errorLanguage === "english"
              ? "Check your code and try again!"
              : "Khangela ikhowudi yakho uzame kwakhona!";

          const errorOutput = `\n${errorTitle}:\n${errorsToShow.join(
            "\n"
          )}\n\n${tryAgainText}`;
          setOutput((prev) => prev + errorOutput);
        } else {
          // Store errors for language switching even if already formatted
          setCleanOutput(currentOutput);
          const englishErrors = allErrors.map((err) => err.english);
          const isixhosaErrors = allErrors.map((err) => err.isixhosa);
          setLastErrors({ english: englishErrors, isixhosa: isixhosaErrors });
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
          `\nNetwork/Connection Error:\n${error.message}\n\nPlease check your internet connection and try again!`
      );
    } finally {
      setIsRunning(false);
      setWaitingForInput(false);
    }
  };

  // Wait for user input during program execution
  const waitForUserInput = () => {
    return new Promise((resolve) => {
      const resolveRef = { current: resolve };
      setInputResolver(() => resolveRef);

      // Set timeout for input (5 minutes)
      const timeout = setTimeout(() => {
        resolve(null);
        setInputResolver(null);
      }, 300000);

      resolveRef.timeout = timeout;
    });
  };

  // Handle input submission for both normal execution and debugging
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

  // Handle Enter key press in input field
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

  /**
   * File Operations
   */

  // Handle manual save action
  const handleSave = (newFileName: string) => {
    setCurrentFileName(newFileName);
    if (onSave) {
      onSave(code, newFileName);
    }
    setHasUnsavedChanges(false);
  };

  // Handle save new file action
  const handleSaveNewFile = async () => {
    // Clear existing auto-save timer
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

  // Copy current IsiPython code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  // Copy translated Python code to clipboard
  const handleCopyTranslatedCode = () => {
    if (translatedCode.trim()) {
      navigator.clipboard.writeText(translatedCode);
    }
  };

  // Download current code as file
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get auto-save status display information
  const getAutoSaveStatusDisplay = () => {
    switch (autoSaveStatus) {
      case "saving":
        return {
          icon: Clock,
          text: t("Saving..."),
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      case "saved":
        return {
          icon: CheckCircle,
          text: lastAutoSaveTime
            ? `${t("Saved")} ${lastAutoSaveTime.toLocaleTimeString()}`
            : t("Saved"),
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: t("Save failed"),
          color: "text-red-600",
          bgColor: "bg-red-100",
        };
      default:
        return null;
    }
  };

  /**
   * Main Component Render
   */

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
                  {t("Unsaved")}
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
                  ? t("Disable Live Translation")
                  : t("Enable Live Translation")
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
                  ? t("Switch to IsiXhosa Errors")
                  : t("Switch to English Errors")
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
                title={t("Start Debug Session")}
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
                    debugWaitingForInput
                      ? t("Waiting for input")
                      : t("Step Over")
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
                  title={t("Stop Debug")}
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* File Operation Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveNewFile}
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              title={fileId ? t("Update File") : t("Save File")}
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
              title={t("Download File")}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              title={t("Copy IsiPython Code")}
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
                style={{ height: `${debugPanelHeight}px` }}
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
                          "The debugger is waiting for your input! Write it above and press enter to continue debugging..."
                        )
                      : waitingForInput
                      ? t(
                          "The program is waiting for input! Write it above and press enter to continue..."
                        )
                      : t(
                          "If your code requires input, enter it in the above box"
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
                    {t(output) || t("Output will appear here")}
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
                : "Iimpazamo: IsiXhosa"}
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
              {fileId ? `ID: ${fileId.slice(0, 8)}...` : t("New File")}
            </span>
            {isDebugging && (
              <span className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {t("Debugging")}
                {currentLine && ` - ${t("Line")} ${currentLine}`}
                {debugWaitingForInput && ` (${t("Waiting for input")})`}
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
