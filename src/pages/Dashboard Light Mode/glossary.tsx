"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Download,
  Info,
} from "lucide-react";
import { useState } from "react";

export default function Component() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    variableAssignment: true,
    typeConversion: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPdf = () => {
    // This would connect to your backend to download the PDF
    console.log("Downloading PDF...");
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Colorful background with gradient blur effect */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,180,255,0.15) 0%, rgba(255,110,255,0.15) 50%, rgba(120,190,255,0.15) 100%)",
          filter: "blur(60px)",
          opacity: 0.8,
        }}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Glossary</h1>
            <p className="text-gray-500 text-sm">Basics • Beginner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
          >
            <Bookmark className="w-5 h-5" />
          </Button>
          <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
            Beginner
          </div>
          <Button
            onClick={downloadPdf}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Main Description */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Variables in Python are used to store data values. Unlike other
                programming languages, Python has no command for declaring a
                variable. A variable is created the moment you first assign a
                value to it.
              </p>

              <div className="space-y-3">
                <p className="text-gray-700">
                  Python has several built-in data types:
                </p>
                <ul className="space-y-2">
                  <li className="text-gray-700">
                    - <strong>**Numbers**</strong>: int, float, complex
                  </li>
                  <li className="text-gray-700">
                    - <strong>**Text**</strong>: str
                  </li>
                  <li className="text-gray-700">
                    - <strong>**Boolean**</strong>: bool
                  </li>
                  <li className="text-gray-700">
                    - <strong>**Sequences**</strong>: list, tuple, range
                  </li>
                  <li className="text-gray-700">
                    - <strong>**Mappings**</strong>: dict
                  </li>
                  <li className="text-gray-700">
                    - <strong>**Sets**</strong>: set, frozenset
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Examples Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
            </div>

            {/* Variable Assignment Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50"
                onClick={() => toggleSection("variableAssignment")}
              >
                <h3 className="font-medium text-gray-800 text-lg">
                  Variable Assignment
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`# Integer
x = 5
print(type(x))  # <class 'int'>

# Float
y = 3.14
print(type(y))  # <class 'float'>

# String
name = "Python"
print(type(name))  # <class 'str'>

# Boolean
is_active = True
print(type(is_active))  # <class 'bool'>`);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {expandedSections.variableAssignment ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {expandedSections.variableAssignment && (
                <CardContent className="pt-0 px-6 pb-6">
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-500"># Integer</span>
                      </div>
                      <div>
                        <span className="text-blue-400">x</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-green-400">5</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">x</span>
                        <span className="text-white">))</span>{" "}
                        <span className="text-gray-500">
                          # {"<class 'int'>"}
                        </span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-gray-500"># Float</span>
                      </div>
                      <div>
                        <span className="text-blue-400">y</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-green-400">3.14</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white">))</span>{" "}
                        <span className="text-gray-500">
                          # {"<class 'float'>"}
                        </span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-gray-500"># String</span>
                      </div>
                      <div>
                        <span className="text-blue-400">name</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-green-400">"Python"</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">name</span>
                        <span className="text-white">))</span>{" "}
                        <span className="text-gray-500">
                          # {"<class 'str'>"}
                        </span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-gray-500"># Boolean</span>
                      </div>
                      <div>
                        <span className="text-blue-400">is_active</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-purple-400">True</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">is_active</span>
                        <span className="text-white">))</span>{" "}
                        <span className="text-gray-500">
                          # {"<class 'bool'>"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Variables are dynamically typed in Python, meaning you
                        don't need to declare their type explicitly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Type Conversion Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50"
                onClick={() => toggleSection("typeConversion")}
              >
                <h3 className="font-medium text-gray-800 text-lg">
                  Type Conversion
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`# Converting between types
x = 5
y = str(x)    # String to integer
z = float(x)  # String to float
a = bool(x)   # String to boolean

print(f"x: {type(x).__name__}")
print(f"y: {type(y).__name__}")
print(f"z: {type(z).__name__}")
print(f"a: {type(a).__name__}")`);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {expandedSections.typeConversion ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {expandedSections.typeConversion && (
                <CardContent className="pt-0 px-6 pb-6">
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-500">
                          # Converting between types
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">x</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-green-400">5</span>
                      </div>
                      <div>
                        <span className="text-blue-400">y</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-yellow-400">str</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">x</span>
                        <span className="text-white">)</span>{" "}
                        <span className="text-gray-500">
                          # String to integer
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">z</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-yellow-400">float</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">x</span>
                        <span className="text-white">)</span>{" "}
                        <span className="text-gray-500"># String to float</span>
                      </div>
                      <div>
                        <span className="text-blue-400">a</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-yellow-400">bool</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">x</span>
                        <span className="text-white">)</span>{" "}
                        <span className="text-gray-500">
                          # String to boolean
                        </span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">f"x: </span>
                        <span className="text-white">{"{"}</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">x</span>
                        <span className="text-white">).__name__</span>
                        <span className="text-white">{"}"}</span>
                        <span className="text-green-400">"</span>
                        <span className="text-white">)</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">f"y: </span>
                        <span className="text-white">{"{"}</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white">).__name__</span>
                        <span className="text-white">{"}"}</span>
                        <span className="text-green-400">"</span>
                        <span className="text-white">)</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">f"z: </span>
                        <span className="text-white">{"{"}</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">z</span>
                        <span className="text-white">).__name__</span>
                        <span className="text-white">{"}"}</span>
                        <span className="text-green-400">"</span>
                        <span className="text-white">)</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">f"a: </span>
                        <span className="text-white">{"{"}</span>
                        <span className="text-yellow-400">type</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">a</span>
                        <span className="text-white">).__name__</span>
                        <span className="text-white">{"}"}</span>
                        <span className="text-green-400">"</span>
                        <span className="text-white">)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Python provides built-in functions for converting
                        between different data types.
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
