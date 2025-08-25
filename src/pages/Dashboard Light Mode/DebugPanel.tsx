"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug, ChevronDown, Eye } from "lucide-react";

// #region Debug Interfaces
interface Variable {
  name: string;
  value: string;
  type: string;
}
// #endregion

// #region Debug Panel Props Interface
interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
  variables: Variable[];
  currentLine: number | null;
  isDebugging: boolean;
  panelHeight: number;
  onPanelHeightChange: (height: number) => void;
  isResizing: boolean;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}
// #endregion

export function DebugPanel({
  isVisible,
  onClose,
  variables,
  currentLine,
  isDebugging,
}: DebugPanelProps) {
  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Debug Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">Debug Panel</span>
          {isDebugging && (
            <Badge className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Active
            </Badge>
          )}
          {currentLine && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              Line {currentLine}
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 h-6 w-6"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      {/* Variables Display */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 pt-2 pb-2 flex-shrink-0 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Variables</span>
            <Badge variant="secondary" className="text-xs">
              {variables.length}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-3">
          <div className="h-full bg-white rounded-lg border border-gray-200 flex flex-col min-h-0">
            {variables.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No variables in scope</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isDebugging
                      ? "Step through your code to see variable values"
                      : "Start debugging to see variable values"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                        <div className="text-xs text-gray-500 capitalize">
                          {variable.type}
                        </div>
                      </div>
                      <div className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded border ml-2 flex-shrink-0 max-w-32 truncate">
                        {variable.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
