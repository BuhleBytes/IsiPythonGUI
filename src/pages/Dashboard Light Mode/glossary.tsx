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
import { useTranslation } from "react-i18next";

export default function Component() {
  const { t } = useTranslation();
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
            <h1 className="text-xl font-semibold text-gray-800">
              {t("Glossary")}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("Basics")} • {t("Beginner")}
            </p>
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
            {t("Beginner")}
          </div>
          <Button
            onClick={downloadPdf}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t("Download")}
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Main Description */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("Glossary")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Python Version Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    {t("Python Version")}
                  </h3>
                  <div className="space-y-3">
                    <div className="text-gray-700">if</div>
                    <div className="text-gray-700">elif</div>
                    <div className="text-gray-700">else</div>
                    <div className="text-gray-700 mt-4">True</div>
                    <div className="text-gray-700">False</div>
                    <div className="text-gray-700">and</div>
                    <div className="text-gray-700">not</div>
                    <div className="text-gray-700">break</div>
                    <div className="text-gray-700 mt-4">while</div>
                    <div className="text-gray-700">for</div>
                  </div>
                </div>

                {/* Arrow Column */}
                <div className="flex justify-center items-center">
                  <div className="text-2xl font-bold text-gray-600">→</div>
                </div>

                {/* IsiPython Version Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    {t("IsiPython Version")}
                  </h3>
                  <div className="space-y-3">
                    <div className="text-gray-700">ukuba</div>
                    <div className="text-gray-700">okanye</div>
                    <div className="text-gray-700">enye</div>
                    <div className="text-gray-700 mt-4">Inyaniso</div>
                    <div className="text-gray-700">Ubuxoki</div>
                    <div className="text-gray-700">kwaye</div>
                    <div className="text-gray-700">hayi</div>
                    <div className="text-gray-700">yekisa</div>
                    <div className="text-gray-700 mt-4">ngexesha</div>
                    <div className="text-gray-700">ngokulandelelana</div>
                  </div>
                </div>
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
                  Comparing Number Inputs
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`# Bhala ikhowudi ka IsiPython apha...
# Ngxatsho Mxhosa, Ndiyakwamkela ku IsiPython!

num1 = eval(input("Enter a number: "))
num2 = eval(input("Enter another number "))
ukuba num1 > num2:
    print(num1, "is greater than", num2)
okanye_ukuba num1 < num2:
    print(num1, "is less than", num2)
enye:
    y = int(input("Enter a number to compare with both: "))
    ukuba y > num1 kwaye y > num2:
        print(y, "is greater than both", num1, "and", num2)
    okanye_ukuba y < num1 kwaye y < num2:
        print(y, "is less than both", num1, "and", num2)
    enye:
        print(y, "is equal to both numbers")
`);
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
                        <span className="text-gray-500">
                          # Bhala ikhowudi ka IsiPython apha...
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          # Ngxatsho Mxhosa, Ndiyakwamkela ku IsiPython!
                        </span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white"> = </span>
                        <span className="text-yellow-400">eval</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">input</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">
                          &quot;Enter a number: &quot;
                        </span>
                        <span className="text-white">))</span>
                      </div>
                      <div>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white"> = </span>
                        <span className="text-yellow-400">eval</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">input</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">
                          &quot;Enter another number &quot;
                        </span>
                        <span className="text-white">))</span>
                      </div>
                      <div className="mt-2"></div>
                      <div>
                        <span className="text-purple-400">ukuba</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white"> &gt; </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;is greater than&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">)</span>
                      </div>
                      <div>
                        <span className="text-purple-400">okanye_ukuba</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white"> &lt; </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;is less than&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">)</span>
                      </div>
                      <div>
                        <span className="text-purple-400">enye</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-blue-400">y</span>
                        <span className="text-white"> = </span>
                        <span className="text-yellow-400">int</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-400">input</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">
                          &quot;Enter a number to compare with both: &quot;
                        </span>
                        <span className="text-white">))</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-purple-400">ukuba</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white"> &gt; </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white"> </span>
                        <span className="text-purple-400">kwaye</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white"> &gt; </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-8">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;is greater than both&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">&quot;and&quot;</span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">)</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-purple-400">okanye_ukuba</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white"> &lt; </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white"> </span>
                        <span className="text-purple-400">kwaye</span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white"> &lt; </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-8">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;is less than both&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num1</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">&quot;and&quot;</span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">num2</span>
                        <span className="text-white">)</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-purple-400">enye</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-8">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-blue-400">y</span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;is equal to both numbers&quot;
                        </span>
                        <span className="text-white">)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        This IsiPython code demonstrates conditional statements
                        using Xhosa keywords:
                        <strong> ukuba</strong> (if),{" "}
                        <strong> okanye_ukuba</strong> (elif),
                        <strong> enye</strong> (else), and{" "}
                        <strong> kwaye</strong> (and).
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}{" "}
            </Card>

            {/* Type Conversion Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50"
                onClick={() => toggleSection("typeConversion")}
              >
                <h3 className="font-medium text-gray-800 text-lg">
                  While Loop in IsiPython
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`# Converting between types
# For loop with list
fruits = ["apple", "banana", "orange"]
ngokulandelelana fruit in fruits:
    print("I like", fruit)`);
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
                          # For loop with list
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">fruits</span>
                        <span className="text-white"> = [</span>
                        <span className="text-green-400">
                          &quot;apple&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;banana&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-green-400">
                          &quot;orange&quot;
                        </span>
                        <span className="text-white">]</span>
                      </div>
                      <div>
                        <span className="text-purple-400">
                          ngokulandelelana
                        </span>
                        <span className="text-white"> </span>
                        <span className="text-blue-400">fruit</span>
                        <span className="text-white"> in </span>
                        <span className="text-blue-400">fruits</span>
                        <span className="text-white">:</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-yellow-400">print</span>
                        <span className="text-white">(</span>
                        <span className="text-green-400">
                          &quot;I like&quot;
                        </span>
                        <span className="text-white">, </span>
                        <span className="text-blue-400">fruit</span>
                        <span className="text-white">)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        In IsiPython, <strong>ngokulandelelana</strong> (meaning
                        &quot;for&quot; in Xhosa) is used to iterate through
                        lists, strings, and other iterable objects. This example
                        shows looping through a list of fruits.
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
