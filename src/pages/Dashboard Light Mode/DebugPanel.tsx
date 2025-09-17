"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug, ChevronDown, Copy, Expand, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next"; 

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
  const [expandedVariables, setExpandedVariables] = useState<Set<number>>(
    new Set()
  );
  const [copiedVariable, setCopiedVariable] = useState<number | null>(null);
  const {t} = useTranslation();
  // Don't render if not visible
  if (!isVisible) return null;

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedVariables);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVariables(newExpanded);
  };

  const copyVariable = async (variable: Variable, index: number) => {
    try {
      await navigator.clipboard.writeText(
        `${variable.name} = ${variable.value}`
      );
      setCopiedVariable(index);
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatValue = (value: string, isExpanded: boolean) => {
    if (!value) return "None";

    // If value is short enough, show it fully
    if (value.length <= 50) return value;

    // If expanded, show full value
    if (isExpanded) return value;

    // Otherwise show truncated with ellipsis
    return value.slice(0, 50) + "...";
  };

  const shouldShowExpandButton = (value: string) => {
    return value && value.length > 50;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Debug Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200/50 flex-shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">{t("Debug Panel")}</span>
          {isDebugging && (
            <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:text-green-800 hover:border-green-400 transition-colors flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {t("Active")}
            </Badge>
          )}
          {currentLine && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:text-blue-800 hover:border-blue-400 transition-colors">
              {t("Line")} {currentLine}
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
        <div className="px-3 pt-2 pb-2 flex-shrink-0 border-b border-gray-200/50 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{t("Variables")}</span>
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                {variables.length}
              </Badge>
            </div>
            {variables.length > 0 && (
              <span className="text-xs text-gray-500">
                {t("Click values to expand")}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 p-2">
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-0">
            {variables.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center p-8">
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("No variables in scope")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isDebugging
                      ? t("Step through your code to see variable values")
                      : t("Start debugging to see variable values")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="divide-y divide-gray-100">
                  {variables.map((variable, index) => {
                    const isExpanded = expandedVariables.has(index);
                    const showExpandButton = shouldShowExpandButton(
                      variable.value
                    );

                    return (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50/50 transition-colors duration-150 group"
                      >
                        {/* Variable Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-sm font-semibold text-gray-800">
                              {variable.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs text-gray-500 bg-gray-50 border-gray-200 px-1.5 py-0.5"
                            >
                              {variable.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyVariable(variable, index)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              title={t("Copy variable")}
                            >
                              {copiedVariable === index ? (
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            {showExpandButton && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <Expand
                                  className={`w-3 h-3 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Variable Value */}
                        <div
                          className={`font-mono text-sm bg-blue-50/70 border border-blue-200/50 rounded-md px-3 py-2 ${
                            showExpandButton
                              ? "cursor-pointer hover:bg-blue-50"
                              : ""
                          } transition-colors`}
                          onClick={
                            showExpandButton
                              ? () => toggleExpanded(index)
                              : undefined
                          }
                        >
                          <div
                            className={`text-blue-800 ${
                              isExpanded
                                ? "whitespace-pre-wrap break-all"
                                : "truncate"
                            }`}
                          >
                            {formatValue(variable.value, isExpanded)}
                          </div>
                          {showExpandButton && !isExpanded && (
                            <div className="text-xs text-blue-600 mt-1 opacity-70">
                              {t("Click to expand full value...")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
