"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Code, Target, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
  isExample?: boolean;
}

interface ChallengePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeData: {
    title: string;
    shortDescription: string;
    difficulty: string;
    rewardPoints: string;
    problemDescription: string;
    testCases: TestCase[];
  };
}

export function ChallengePreviewModal({
  isOpen,
  onClose,
  challengeData,
}: ChallengePreviewModalProps) {
  const { t } = useTranslation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Filter test cases to only show examples that are not hidden (what students actually see)
  // Be very strict - only show if explicitly marked as example AND not hidden
  const exampleTestCases = challengeData.testCases.filter((testCase) => {
    // Must be explicitly marked as example (true, not undefined/null)
    const isExplicitlyExample = testCase.isExample === true;
    // Must not be hidden (false, null, or undefined are all acceptable)
    const isNotHidden = testCase.isHidden !== true;

    return isExplicitlyExample && isNotHidden;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl">
        <DialogHeader className="border-b border-gray-200/50 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 theme-cyan rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            {t("Student View Preview")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Challenge Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {challengeData.title || "Untitled Challenge"}
                </h1>
                <p className="text-gray-600 text-lg">
                  {challengeData.shortDescription || "No description provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Badge
                className={cn(
                  "font-medium",
                  getDifficultyColor(challengeData.difficulty)
                )}
              >
                {challengeData.difficulty || "Not specified"}
              </Badge>

              {challengeData.rewardPoints && (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-6 h-6 theme-orange rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold">
                    {challengeData.rewardPoints} {t("points")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>
                  {t("Estimated Time")}: 30-45 {t("min")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-5 h-5" />
                <span>0 {t("submissions")}</span>
              </div>
            </div>
          </div>

          {/* Problem Statement - This is where most content is displayed to students */}
          <Card className="futuristic-card">
            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-6 h-6 theme-green rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                {t("Problem Statement")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {challengeData.problemDescription ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {challengeData.problemDescription}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    {t("No problem description provided")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Examples Section - Only shown if there are example test cases that aren't hidden */}
          {exampleTestCases.length > 0 && (
            <Card className="futuristic-card">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-6 h-6 theme-blue rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  {t("Examples")} ({exampleTestCases.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {exampleTestCases.map((testCase, index) => (
                    <div
                      key={testCase.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50"
                    >
                      <div className="mb-3">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                          {t("Example")} {index + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {t("Input")}:
                          </h4>
                          <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                            {testCase.input || (
                              <span className="text-gray-500 italic">
                                {t("No input provided")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {t("Output")}:
                          </h4>
                          <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                            {testCase.expectedOutput || (
                              <span className="text-gray-500 italic">
                                {t("No output provided")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Show explanation if available */}
                      {testCase.explanation && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {t("Explanation")}:
                          </h4>
                          <div className="text-gray-600 text-sm">
                            {testCase.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message when no examples are available */}
          {exampleTestCases.length === 0 && (
            <Card className="futuristic-card border-dashed">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 italic">
                  {t("No example test cases are provided for this challenge")}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {t(
                    "Students will need to create their own test cases based on the problem statement"
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
