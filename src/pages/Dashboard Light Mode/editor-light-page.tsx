"use client";
import { useEffect, useState } from "react";
import { CodeEditorLight } from "./code-editor-light";

export default function EditorLightPage() {
  const [initialCode, setInitialCode] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  useEffect(() => {
    // Check for URL parameters (from file import)
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get("content");
    const filename = urlParams.get("filename");

    if (content) {
      setInitialCode(decodeURIComponent(content));
    }
    if (filename) {
      setFileName(decodeURIComponent(filename));
    }
  }, []);

  const handleSave = (code: string, fileName: string) => {
    console.log("Saving file:", fileName, "with content:", code);
    // TODO:  Here you could implement actual file saving logic
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="flex-1 min-w-0">
        <CodeEditorLight
          initialCode={initialCode}
          fileName={fileName}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
