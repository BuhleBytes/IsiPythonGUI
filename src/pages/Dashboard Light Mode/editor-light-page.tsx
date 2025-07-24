"use client";
import { useEffect, useState } from "react";
import { CodeEditorLight } from "./code-editor-light";

interface EditorLightPageProps {
  initialCode?: string;
  fileName?: string;
}

export default function EditorLightPage({
  initialCode: propInitialCode,
  fileName: propFileName,
}: EditorLightPageProps) {
  const [editorCode, setEditorCode] = useState<string | undefined>(
    propInitialCode
  );
  const [editorFileName, setEditorFileName] = useState<string | undefined>(
    propFileName
  );

  useEffect(() => {
    // Prioritize props from parent (imported files) over URL parameters
    if (propInitialCode) {
      setEditorCode(propInitialCode);
    } else {
      // Fallback to URL parameters if no props provided
      const urlParams = new URLSearchParams(window.location.search);
      const content = urlParams.get("content");
      if (content) {
        setEditorCode(decodeURIComponent(content));
      }
    }

    if (propFileName) {
      setEditorFileName(propFileName);
    } else {
      // Fallback to URL parameters if no props provided
      const urlParams = new URLSearchParams(window.location.search);
      const filename = urlParams.get("filename");
      if (filename) {
        setEditorFileName(decodeURIComponent(filename));
      }
    }
  }, [propInitialCode, propFileName]);

  const handleSave = (code: string, fileName: string) => {
    console.log("Saving file:", fileName, "with content:", code);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="flex-1 min-w-0">
        <CodeEditorLight
          initialCode={editorCode}
          fileName={editorFileName}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
