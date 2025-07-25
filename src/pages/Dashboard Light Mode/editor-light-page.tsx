"use client";
import { useEffect, useState } from "react";
import { loadState, saveEditorState } from "../../utils/storage";
import { CodeEditorLight } from "./code-editor-light";

interface EditorLightPageProps {
  initialCode?: string;
  fileName?: string;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export default function EditorLightPage({
  initialCode: propInitialCode,
  fileName: propFileName,
  sidebarOpen,
  onCloseSidebar,
}: EditorLightPageProps) {
  const [editorCode, setEditorCode] = useState<string | undefined>();
  const [editorFileName, setEditorFileName] = useState<string | undefined>();

  useEffect(() => {
    // Priority system for loading code:
    // 1. Props from parent (imported files or new files)
    // 2. Persisted state from localStorage
    // 3. Default code in CodeEditor component

    if (propInitialCode !== undefined || propFileName !== undefined) {
      // Use props when explicitly provided (file import, create new)
      setEditorCode(propInitialCode);
      setEditorFileName(propFileName);
    } else {
      // Load from localStorage when no props (page refresh, switching back to editor)
      const savedState = loadState();
      if (savedState.editorState) {
        setEditorCode(savedState.editorState.code);
        setEditorFileName(savedState.editorState.fileName);
      }
      // If no saved state, let CodeEditor use its default
    }
  }, [propInitialCode, propFileName]);

  const handleSave = (code: string, fileName: string) => {
    console.log("Saving file:", fileName, "with content:", code);

    // Save to localStorage for persistence
    saveEditorState({
      code,
      fileName,
      hasUnsavedChanges: false,
      lastModified: Date.now(),
    });
  };

  const handleCodeChange = (
    code: string,
    fileName: string,
    hasUnsavedChanges: boolean
  ) => {
    // Auto-save state when code changes for persistence
    saveEditorState({
      code,
      fileName,
      hasUnsavedChanges,
      lastModified: Date.now(),
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="flex-1 min-w-0">
        <CodeEditorLight
          initialCode={editorCode}
          fileName={editorFileName}
          onSave={handleSave}
          onCodeChange={handleCodeChange}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={onCloseSidebar}
        />
      </div>
    </div>
  );
}
