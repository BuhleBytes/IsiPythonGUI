/**
 * ViewChallenge Component
 *
 * This component displays a detailed, read-only view of a published coding challenge.
 * It's used in the admin panel to review and preview challenges that have already been published.
 *
 * Key Features:
 * - Displays comprehensive challenge information including title, description, difficulty, and tags
 * - Shows all test cases with inputs, expected outputs, and explanations
 * - Displays challenge statistics like attempt count and pass rate
 * - Provides a preview modal to see how the challenge appears to users
 * - Handles loading, error, and empty states gracefully
 * - Supports navigation back to the published challenges list
 *
 * The component fetches challenge data using a custom hook and presents it in a
 * visually appealing, card-based layout with gradient backgrounds and animations.
 */

"use client";

import { ChallengePreviewModal } from "@/components/challenge-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Code,
  Eye,
  FileText,
  RefreshCw,
  Tag,
  Target,
  TestTube,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useChallengeDetails } from "../useChallengeDetails";

// TypeScript interface defining the structure of a test case
interface TestCase {
  id: string; // Unique identifier for the test case
  input: string; // The input data for the test case
  expectedOutput: string; // The expected output for the test case
  explanation: string; // Human-readable explanation of the test case
  isHidden: boolean; // Whether this test case is hidden from users during attempts
  isExample: boolean; // Whether this test case is shown as an example to users
  pointsWeight: number; // How many points this test case is worth
}

// Props interface for the ViewChallenge component
interface ViewChallengeProps {
  challengeId: string; // The unique ID of the challenge to display
  onBackToList?: () => void; // Optional callback function to navigate back to the challenge list
}

export default function ViewChallenge({
  challengeId,
  onBackToList,
}: ViewChallengeProps) {
  // Custom hook to fetch challenge details from the API
  // Returns challenge data, loading state, error state, and a refetch function
  const { challenge, loading, error, refetch } = useChallengeDetails(
    challengeId || ""
  );
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  // Handle case where no challengeId is provided in props
  // This prevents the component from attempting to fetch data with an invalid ID
  if (!challengeId) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          {/* Error icon and message */}
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Invalid Challenge ID
          </div>
          <div className="text-sm text-gray-500">
            No challenge ID was provided.
          </div>
          {/* Navigation button back to challenge list */}
          <Button onClick={onBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Published Challenges")}
          </Button>
        </div>
      </div>
    );
  }

  // Loading state - shown while fetching challenge data from the API
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Animated loading spinner */}
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Loading Challenge Details...")}
          </div>
          <div className="text-sm text-gray-500">
            {t("Fetching challenge information and test cases")}
          </div>
        </div>
      </div>
    );
  }

  // Error state - shown when the API request fails
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          {/* Error icon and message */}
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Failed to Load Challenge Details")}
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          {/* Action buttons for retry and navigation */}
          <div className="flex gap-3 justify-center">
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("Try Again")}
            </Button>
            <Button onClick={onBackToList} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Published Challenges")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No challenge data state - shown when the API returns successfully but with no data
  if (!challenge) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            {t("Challenge Not Found")}
          </div>
          <div className="text-sm text-gray-500">
            {t(
              "The challenge you're looking for doesn't exist or has been deleted."
            )}
          </div>
          <Button onClick={onBackToList} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Published Challenges")}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Handler function for the "Back to List" button
   * Calls the parent component's callback if provided
   */
  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  // Main component render - displays the challenge details in a card-based layout
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements */}
      {/* These create subtle animated background shapes for visual appeal */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {/* Header Section - Contains title, navigation, and status badges */}
        <div className="space-y-3">
          {/* Navigation Button */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Published Challenges")}
            </Button>
          </div>

          {/* Page Title with Icon */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            {t("View Challenge")}
            <Eye className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>

          {/* Page Description */}
          <p className="text-lg text-gray-600">
            {t("Review published challenge details")}
          </p>

          {/* Status and Statistics Badges */}
          <div className="flex items-center gap-4 mt-4">
            {/* Published Status Badge */}
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 hover:border-green-300 font-medium transition-all duration-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t("Published Challenge")}
            </Badge>

            {/* Last Modified Date Badge */}
            <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300 font-medium transition-all duration-200">
              {t("Last Modified")}: {challenge.lastModified}
            </Badge>
          </div>
        </div>

        {/* Content Cards Section */}
        <div className="space-y-6">
          {/* Challenge Details Card - Displays basic challenge information */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Card Header */}
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Code className="w-5 h-5 text-white" />
                </div>
                {t("Challenge Details")}
              </CardTitle>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Title and Difficulty Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Challenge Title */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-500" />
                    {t("Challenge Title")}
                  </Label>
                  <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-medium">
                    {challenge.title}
                  </div>
                </div>

                {/* Difficulty Level with Color-coded Badge */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    {t("Difficulty Level")}
                  </Label>
                  <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md">
                    <Badge
                      className={
                        challenge.difficulty === "Easy"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:!bg-emerald-200 hover:!text-emerald-800 transition-colors duration-200"
                          : challenge.difficulty === "Medium"
                          ? "bg-orange-100 text-orange-700 border-orange-200 hover:!bg-orange-200 hover:!text-orange-800 transition-colors duration-200"
                          : "bg-red-100 text-red-700 border-red-200 hover:!bg-red-200 hover:!text-red-800 transition-colors duration-200"
                      }
                    >
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">
                  {t("Short Description")}
                </Label>
                <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900">
                  {challenge.shortDescription}
                </div>
              </div>

              {/* Reward Points, Time, and Notifications Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reward Points */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-md flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                    {t("Reward Points")}
                  </Label>
                  <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-medium">
                    {challenge.rewardPoints}
                  </div>
                </div>

                {/* Estimated Completion Time */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t("Estimated Time")} ({t("minutes")})
                  </Label>
                  <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-medium">
                    {challenge.estimatedTime}
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  {t("Tags")}
                </Label>
                <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {/* Map through all tags and display as badges */}
                    {challenge.tags.map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white border-gray-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Description Card - Displays the detailed problem statement */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Card Header */}
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {t("Problem Description")}
              </CardTitle>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="p-6 relative z-10">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">
                  {t("Detailed Problem Statement")}
                </Label>
                {/* Pre-formatted text area to preserve formatting and line breaks */}
                <div className="p-4 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 whitespace-pre-wrap min-h-[200px]">
                  {challenge.problemDescription}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases Card - Displays all test cases with their details */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Card Header with Test Case Count */}
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-t-xl relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                {t("Test Cases")} ({challenge.testCases.length})
              </CardTitle>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                {/* Map through all test cases and display each one */}
                {challenge.testCases.map((testCase, index) => (
                  <Card
                    key={testCase.id}
                    className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 shadow-sm"
                  >
                    <CardContent className="p-5">
                      {/* Test Case Header with Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium">
                          {t("Test Case")} {index + 1}
                        </Badge>

                        {/* Example Badge - shown if this is an example test case */}
                        {testCase.isExample && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                            {t("Example test")}
                          </Badge>
                        )}

                        {/* Hidden Badge - shown if this test case is hidden from users */}
                        {testCase.isHidden && (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
                            {t("Hidden test")}
                          </Badge>
                        )}
                      </div>

                      {/* Input and Expected Output Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Test Case Input */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Input")}
                          </Label>
                          {/* Monospace font for code formatting, preserve whitespace */}
                          <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-mono text-sm min-h-[80px] whitespace-pre-wrap">
                            {testCase.input}
                          </div>
                        </div>

                        {/* Expected Output */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Expected Output")}
                          </Label>
                          {/* Monospace font for code formatting, preserve whitespace */}
                          <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-mono text-sm min-h-[80px] whitespace-pre-wrap">
                            {testCase.expectedOutput}
                          </div>
                        </div>
                      </div>

                      {/* Additional Test Case Information */}
                      <div className="space-y-4">
                        {/* Test Case Explanation */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-semibold">
                            {t("Explanation")}
                          </Label>
                          <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900">
                            {testCase.explanation}
                          </div>
                        </div>

                        {/* Points Weight and Visibility Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Points Weight */}
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Points Weight")}
                            </Label>
                            <div className="p-3 bg-gray-50/80 border border-gray-200/50 rounded-md text-gray-900 font-medium">
                              {testCase.pointsWeight}
                            </div>
                          </div>

                          {/* Visibility Settings - Example and Hidden Status */}
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold">
                              {t("Visibility")}
                            </Label>
                            <div className="flex gap-4 p-3 bg-gray-50/80 border border-gray-200/50 rounded-md">
                              {/* Example Status Badge */}
                              <Badge
                                className={
                                  testCase.isExample
                                    ? "bg-blue-100 text-blue-700 border-blue-200 hover:!bg-blue-200 hover:!text-blue-800 transition-colors duration-200"
                                    : "bg-purple-100 text-purple-700 border-purple-200 hover:!bg-purple-200 hover:!text-purple-800 transition-colors duration-200"
                                }
                              >
                                {t("Example test")}:{" "}
                                {testCase.isExample ? t("Yes") : t("No")}
                              </Badge>
                              {/* Hidden Status Badge */}
                              <Badge
                                className={
                                  testCase.isHidden
                                    ? "bg-orange-100 text-orange-700 border-orange-200 hover:!bg-orange-200 hover:!text-orange-800 transition-colors duration-200"
                                    : "bg-green-100 text-green-700 border-green-200 hover:!bg-green-200 hover:!text-green-800 transition-colors duration-200"
                                }
                              >
                                {t("Hidden test")}:{" "}
                                {testCase.isHidden ? t("Yes") : t("No")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Section - Preview and Navigation */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {/* Preview Challenge Button - Opens modal to preview how challenge appears to users */}
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-white/80 rounded-lg font-medium px-6 py-3 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("Preview Challenge")}
            </Button>

            {/* Back Button - Returns to the published challenges list */}
            <Button
              onClick={handleBackToList}
              className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Published Challenges")}
            </Button>
          </div>
        </div>
      </main>

      {/* Challenge Preview Modal - Shows how the challenge appears to users */}
      {/* Only renders when showPreview state is true */}
      <ChallengePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        challengeData={{
          // Map challenge data to the format expected by the preview modal
          title: challenge.title,
          shortDescription: challenge.shortDescription,
          difficulty: challenge.difficulty,
          rewardPoints: challenge.rewardPoints,
          problemDescription: challenge.problemDescription,
          // Only include essential test case data for preview (no hidden metadata)
          testCases: challenge.testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        }}
      />
    </div>
  );
}
