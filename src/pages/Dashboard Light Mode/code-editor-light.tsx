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
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import { registerIsiPython } from "../../languages/isiPython";
import { useUserFiles } from "../../useUserFiles";

import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronRight,
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

const defaultCode = `# Write code for your new file`;

export function CodeEditorLight({
  initialCode,
  fileName,
  fileId,
  onSave,
  onCodeChange,
  sidebarOpen,
  onCloseSidebar,
}: CodeEditorLightProps) {
  // #region All-Const
  const handleEditorWillMount = (monaco) => {
    registerIsiPython(monaco);
  };
  const { saveNewFile } = useUserFiles();
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
  const [rightPanelWidth, setRightPanelWidth] = useState(384); // 384px = w-96
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [tempFileName, setTempFileName] = useState(currentFileName);

  // ✅ NEW - Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>(initialCode || defaultCode);

  // Auto-save effect - debounced to avoid too many saves
  const debouncedCodeChange = useCallback(
    (newCode: string) => {
      if (onCodeChange) {
        onCodeChange(newCode, currentFileName, hasUnsavedChanges);
      }
    },
    [onCodeChange, currentFileName, hasUnsavedChanges]
  );

  // #endregion

  // ✅ NEW - Debounced Auto-Save Effect (3 seconds after user stops typing)
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if:
    // 1. File has unsaved changes
    // 2. File has an ID (existing file, not new)
    // 3. Code is different from last saved version
    if (hasUnsavedChanges && fileId && code !== lastSavedCodeRef.current) {
      console.log("🔄 Setting up auto-save timer (3 seconds)...");

      autoSaveTimerRef.current = setTimeout(async () => {
        console.log("💾 Auto-save triggered!");
        setAutoSaveStatus("saving");

        try {
          const result = await saveNewFile(currentFileName, code, fileId);

          console.log("📄 Auto-save result:", result);

          // ✅ FIXED - Check for API response structure (data + message) instead of success field
          if (result && (result.data || result.message)) {
            console.log("✅ Auto-save successful!");
            setAutoSaveStatus("saved");
            setHasUnsavedChanges(false);
            setLastAutoSaveTime(new Date());
            lastSavedCodeRef.current = code;

            // Show "saved" status for 2 seconds, then fade to idle
            setTimeout(() => {
              setAutoSaveStatus("idle");
            }, 2000);
          } else {
            console.error("❌ Auto-save failed:", result);
            setAutoSaveStatus("error");

            // Show error for 3 seconds, then back to idle
            setTimeout(() => {
              setAutoSaveStatus("idle");
            }, 3000);
          }
        } catch (error) {
          console.error("💥 Auto-save error:", error);
          setAutoSaveStatus("error");

          setTimeout(() => {
            setAutoSaveStatus("idle");
          }, 3000);
        }
      }, 3000); // 3 second delay
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [code, hasUnsavedChanges, fileId, currentFileName, saveNewFile]);

  // ✅ UPDATED - Original debounced callback (now separate from auto-save)
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedCodeChange(code);
    }, 1000); // Notify parent about changes after 1 second

    return () => clearTimeout(timer);
  }, [code, debouncedCodeChange]);

  // ✅ NEW - Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Resize functionality for right panel
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
      const minWidth = 300; // Minimum width for right panel
      const maxWidth = window.innerWidth * 0.7; // Maximum 70% of screen width

      // Calculate the point where sidebar should auto-close (when editor gets too wide)
      const editorWidth = window.innerWidth - newWidth;
      const autoCloseSidebarThreshold = window.innerWidth * 0.75; // When editor takes 75% of screen

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightPanelWidth(newWidth);

        // Auto-close sidebar if editor gets too wide and sidebar is open
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

  // Filename editing functions
  const handleFileNameClick = () => {
    setIsEditingFileName(true);
    setTempFileName(currentFileName);
  };

  const handleFileNameChange = (e) => {
    setTempFileName(e.target.value);
  };

  useEffect(() => {
    console.log("✅ currentFileName was updated:", currentFileName);
  }, [currentFileName]); // <-- This triggers when currentFileName changes

  const handleFileNameSave = async () => {
    const newFileName = tempFileName.trim();
    console.log("🔄 Attempting to rename file to:", newFileName);

    if (newFileName && newFileName !== currentFileName) {
      // Update the local state immediately
      setCurrentFileName(newFileName);

      // ✅ KEY FIX - Send PUT request to backend if this is an existing file
      if (fileId) {
        console.log(
          "📡 Sending PUT request to update filename for fileId:",
          fileId
        );

        try {
          // Call saveNewFile with the fileId to trigger PUT request
          const result = await saveNewFile(newFileName, code, fileId);

          console.log("📄 Filename save result:", result);

          // ✅ FIXED - Check for API response structure (data + message) instead of success field
          if (result && (result.data || result.message)) {
            console.log("🎉 File renamed successfully in backend!");
            setOutput(
              `📝 File renamed to: ${newFileName}\n✨ Backend updated successfully!\n${
                result.message || "Rename completed!"
              }\n`
            );
            setHasUnsavedChanges(false);
            lastSavedCodeRef.current = code; // ✅ UPDATE - Update last saved reference
          } else {
            console.error("❌ Failed to rename file in backend:", result);
            setOutput(
              `❌ Failed to rename file to: ${newFileName}\n🔧 Backend update failed: ${
                result?.error || result?.message || "Unknown error"
              }\n🔧 Please try again!\n`
            );
          }
        } catch (error) {
          console.error("💥 Error during file rename:", error);
          setOutput(
            `❌ Network error while renaming file\n🔧 Please check your connection and try again!\n`
          );
        }
      } else {
        // This is a new file that hasn't been saved yet
        console.log("📝 New file - just updating local filename");
        if (onSave) {
          onSave(code, newFileName);
        }
        setOutput(
          `📝 File renamed to: ${newFileName}\n✨ Save the file to persist the name!\n`
        );
      }
    } else if (!newFileName) {
      console.log("❌ Empty filename provided");
      setOutput("❌ Filename cannot be empty!\n");
    } else {
      console.log("ℹ️ Filename unchanged");
    }

    setIsEditingFileName(false);
  };

  const handleFileNameKeyPress = async (e) => {
    if (e.key === "Enter") {
      await handleFileNameSave(); // Wait for the save to complete
    } else if (e.key === "Escape") {
      handleFileNameCancel();
    }
  };

  const handleFileNameCancel = () => {
    setTempFileName(currentFileName);
    setIsEditingFileName(false);
  };

  const handleFileNameBlur = async () => {
    // Save on blur (when clicking outside)
    await handleFileNameSave();
  };

  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode);
      setHasUnsavedChanges(false);
      lastSavedCodeRef.current = initialCode; // ✅ UPDATE - Update last saved reference

      // Clear output when loading new/different code
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
    // ✅ NEW - Reset auto-save status when user types
    if (autoSaveStatus === "saved") {
      setAutoSaveStatus("idle");
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setWaitingForInput(false); // Reset input state
    setOutput(
      "🚀 Initializing IsiPython execution environment...\n⚡ Loading IsiPython interpreter...\n🔥 Running your code...\n\n"
    );

    let allOutput = [];
    let allErrors = [];
    let sessionId = null;

    try {
      // Initial request
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

      // Main execution loop
      while (!result.completed) {
        // Show any new output immediately
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
          // Set the waiting state to activate the input UI
          setWaitingForInput(true);

          // Wait for user input through the UI
          const userInput = await waitForUserInput();

          if (userInput !== null) {
            // Clear the waiting state
            setWaitingForInput(false);

            // Show the input in the output (like a real terminal)
            setOutput((prev) => prev + `${userInput}\n`);

            // Send the input to the API
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
            // User cancelled or timeout
            setWaitingForInput(false);
            break;
          }
        } else if (result.still_running) {
          // Wait and poll for status
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

        // Collect any errors
        if (result.error) {
          allErrors.push(result.error);
        }
      }

      // Show final output
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

      // Show errors or success message
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

  // Helper function to wait for user input through the UI
  const waitForUserInput = () => {
    return new Promise((resolve) => {
      // Create a ref to store the resolve function
      const resolveRef = { current: resolve };

      // Store the resolve function to be called when input is submitted
      setInputResolver(() => resolveRef);

      // Set a timeout to prevent infinite waiting
      const timeout = setTimeout(() => {
        resolve(null);
        setInputResolver(null);
      }, 300000); // 5 minutes timeout

      // Store timeout to clear it later
      resolveRef.timeout = timeout;
    });
  };

  // Handler for when user submits input (call this when Enter is pressed or Submit button is clicked)
  const handleInputSubmit = () => {
    if (inputResolver && input.trim()) {
      clearTimeout(inputResolver.current.timeout);
      inputResolver.current(input.trim());
      setInputResolver(null);
      setInput(""); // Clear input after submission
    }
  };

  // Add to your input field's onKeyPress handler
  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" && waitingForInput) {
      e.preventDefault();
      handleInputSubmit();
    }
  };

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

  // ✅ FIXED - Manual save with proper PUT/POST logic and correct API response handling
  const handleSaveNewFile = async () => {
    console.log("🔧 Manual save triggered");
    console.log("🔍 fileId:", fileId);
    console.log("🔍 fileId type:", typeof fileId);
    console.log("🔍 fileId is null:", fileId === null);
    console.log("🔍 fileId is undefined:", fileId === undefined);

    // Cancel any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
      console.log("🚫 Cancelled pending auto-save timer");
    }

    setAutoSaveStatus("saving");

    try {
      console.log(
        `📡 ${
          fileId ? "Updating existing file (PUT)" : "Creating new file (POST)"
        }`
      );

      const result = await saveNewFile(currentFileName, code, fileId);

      console.log("📄 Save result:", result);
      console.log("📄 Save result type:", typeof result);
      console.log(
        "📄 Save result keys:",
        result ? Object.keys(result) : "null result"
      );

      // ✅ FIXED - Check for API response structure (data + message) instead of success field
      if (result && (result.data || result.message)) {
        console.log("🎉 Manual save successful!");
        setHasUnsavedChanges(false);
        lastSavedCodeRef.current = code; // Update saved reference
        setLastAutoSaveTime(new Date());
        setAutoSaveStatus("saved");
        setOutput(
          `💾 File ${
            fileId ? "updated" : "saved"
          } successfully: ${currentFileName}\n✨ Your code is safe and sound!\n${
            result.message || "Operation completed successfully!"
          }\n`
        );

        // Show saved status for 2 seconds
        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 2000);
      } else {
        console.error("❌ Manual save failed - invalid response:", result);
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
      console.error("💥 Manual save error:", error);
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

  // ✅ NEW - Helper function to get auto-save status display
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

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative editor-container">
      {/* Added editor-container class for resize reference */}
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

              {/* ✅ NEW - Auto-save status indicator */}
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

      {/* Main Editor Area - Proper flex layout */}
      <div className="flex-1 flex relative z-10 min-h-0">
        {/* Code Editor Panel - Takes remaining space */}
        <div className="flex-1 flex flex-col border-r border-gray-200/50 min-w-0">
          <div className="flex-1 flex min-h-0">
            {/* Code Area - Takes remaining space */}
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
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Resizable width */}
        <div
          className="flex flex-col flex-shrink-0 relative"
          style={{ width: `${rightPanelWidth}px` }}
        >
          {/* Resize handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-cyan-400 cursor-col-resize z-10 transition-colors duration-200"
            onMouseDown={handleMouseDown}
            title="Drag to resize panel"
          >
            {/* Visual indicator on hover */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gray-300 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
          </div>
          {/* Input Panel */}
          <Card className="bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-none border-b shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-600" />
                Python Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={`relative ${waitingForInput ? "input-waiting" : ""}`}
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
                    {/* Animated border effect - positioned behind textarea */}
                    <div className="absolute inset-0 -z-10 rounded-md">
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-30"></div>
                    </div>

                    {/* Submit button */}
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
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200/70 rounded-lg p-4 h-full overflow-y-auto max-h-full shadow-inner">
                <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap break-words">
                  {output || "🚀Output will appear here \n  \n  \n  \n  \n  \n"}
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
            {/* ✅ NEW - Auto-save info in status bar */}
            {fileId && (
              <span className="text-gray-500">
                Auto-save: {fileId ? "On" : "Off"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* ✅ NEW - File type indicator */}
            <span className="text-gray-500">
              {fileId ? `ID: ${fileId.slice(0, 8)}...` : "New File"}
            </span>
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
