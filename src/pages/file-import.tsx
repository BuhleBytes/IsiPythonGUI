"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Code,
  File,
  ArrowRight,
  Folder,
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: Date;
}

interface FileImportProps {
  onFileImported: (file: UploadedFile) => void;
  onClose: () => void;
}

export function FileImport({ onFileImported, onClose }: FileImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedExtensions = [".isi"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    switch (extension) {
      case "isi":
        return <Code className="w-5 h-5 text-cyan-400" />;
      case "txt":
      case "md":
        return <FileText className="w-5 h-5 text-green-400" />;
      case "json":
      case "xml":
        return <File className="w-5 h-5 text-yellow-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file extension
    const extension = "." + file.name.toLowerCase().split(".").pop();
    if (!supportedExtensions.includes(extension)) {
      return `Unsupported file type. Supported: ${supportedExtensions.join(
        ", "
      )}`;
    }

    return null;
  };

  const processFiles = async (files: FileList) => {
    setUploading(true);
    setUploadProgress(0);

    const validFiles: UploadedFile[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (!error) {
        try {
          const content = await readFileContent(file);
          validFiles.push({
            name: file.name,
            size: file.size,
            type: file.type || "text/plain",
            content,
            lastModified: new Date(file.lastModified),
          });
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err);
        }
      }

      setUploadProgress(((i + 1) / totalFiles) * 100);
    }

    setTimeout(() => {
      setUploadedFiles(validFiles);
      setUploading(false);
      setUploadProgress(0);
    }, 500);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleOpenFile = (file: UploadedFile) => {
    onFileImported(file);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-slate-900/95 border-slate-800/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">
                  Import Files
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Upload files to open in the code editor
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {dragActive ? "Drop files here" : "Drag & drop files here"}
                </h3>
                <p className="text-slate-400 mb-4">or click to browse files</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={supportedExtensions.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Supported Formats */}
          <div className="bg-slate-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">
              Supported Formats
            </h4>
            <div className="flex flex-wrap gap-2">
              {supportedExtensions.map((ext) => (
                <Badge
                  key={ext}
                  variant="secondary"
                  className="bg-slate-700 text-slate-300 text-xs"
                >
                  {ext}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Maximum file size: {formatFileSize(maxFileSize)}
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Uploading files...
                </span>
                <span className="text-sm text-cyan-400">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </Progress>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-white truncate">
                              {file.name}
                            </h5>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>
                                {file.lastModified.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(index)}
                            className="text-slate-400 hover:text-red-400 hover:bg-slate-700/50 h-8 w-8"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleOpenFile(file)}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          >
                            Open in Editor
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Files Message */}
          {!uploading && uploadedFiles.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-400">No files uploaded yet</p>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="w-3 h-3" />
              <span>Files are processed locally and not stored on servers</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              {uploadedFiles.length > 0 && (
                <Button
                  onClick={() =>
                    uploadedFiles.length > 0 && handleOpenFile(uploadedFiles[0])
                  }
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Open First File
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
