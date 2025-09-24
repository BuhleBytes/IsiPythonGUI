"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, Users, Target, Code, TestTube, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestCase {
  id: string
  input: string
  expectedOutput: string
}

interface ChallengePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  challengeData: {
    title: string
    shortDescription: string
    difficulty: string
    rewardPoints: string
    problemDescription: string
    testCases: TestCase[]
  }
}

export function ChallengePreviewModal({ isOpen, onClose, challengeData }: ChallengePreviewModalProps) {
  const {t} = useTranslation();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl">
        <DialogHeader className="border-b border-gray-200/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-8 h-8 theme-cyan rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              {t("Challenge Preview")}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Challenge Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{challengeData.title || "Untitled Challenge"}</h1>
                <p className="text-gray-600 text-lg">{challengeData.shortDescription || "No description provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Badge className={cn("font-medium", getDifficultyColor(challengeData.difficulty))}>
                {challengeData.difficulty || "Not specified"}
              </Badge>

              {challengeData.rewardPoints && (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-6 h-6 theme-orange rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold">{challengeData.rewardPoints} {t("points")}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>{t("Estimated Time")}: 30-45 {t("min")}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-5 h-5" />
                <span>0 {t("submissions")}</span>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <Card className="futuristic-card">
            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-6 h-6 theme-green rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                {t("Problem Description")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {challengeData.problemDescription ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {challengeData.problemDescription}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t("No problem description provided")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card className="futuristic-card">
            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-6 h-6 theme-purple rounded-lg flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-white" />
                </div>
                {t("Test Cases")} ({challengeData.testCases.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {challengeData.testCases.length > 0 ? (
                <div className="space-y-4">
                  {challengeData.testCases.map((testCase, index) => (
                    <div
                      key={testCase.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50"
                    >
                      <div className="mb-3">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium">
                          {t("Test Case")} {index + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">{t("Input")}:</h4>
                          <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                            {testCase.input || <span className="text-gray-500 italic">{t("No input provided")}</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">{t("Expected Output")}:</h4>
                          <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                            {testCase.expectedOutput || (
                              <span className="text-gray-500 italic">{("No output provided")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">{t("No test cases provided")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
