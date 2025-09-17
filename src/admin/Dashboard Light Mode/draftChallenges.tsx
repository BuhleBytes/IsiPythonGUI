"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit3,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useDraftChallenges } from "../useDraftChallenges";

interface DraftChallenge {
  id: string;
  title: string;
  shortDescription: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rewardPoints: number;
  estimatedTime: number;
  tags: string[];
  testCases: number;
  createdAt: string;
  lastModified: string;
}

interface DraftChallengesProps {
  onEditChallenge?: (challengeId: string) => void;
  onCreateNew?: () => void;
}

export default function DraftChallenges({
  onEditChallenge,
  onCreateNew,
}: DraftChallengesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Use the custom hook to fetch draft challenges
  const { draftChallenges, loading, error, refetch } = useDraftChallenges();

  // Get challenge icon and styling based on difficulty
  const getChallengeStyle = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return {
          icon: Target,
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-50/50 to-emerald-50/50",
          borderColor: "border-green-200/50",
          badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
      case "Medium":
        return {
          icon: Zap,
          gradient: "from-orange-500 to-yellow-600",
          bgGradient: "from-orange-50/50 to-yellow-50/50",
          borderColor: "border-orange-200/50",
          badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
        };
      case "Hard":
        return {
          icon: AlertCircle,
          gradient: "from-red-500 to-pink-600",
          bgGradient: "from-red-50/50 to-pink-50/50",
          borderColor: "border-red-200/50",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
        };
      default:
        return {
          icon: Target,
          gradient: "from-cyan-500 to-blue-600",
          bgGradient: "from-cyan-50/50 to-blue-50/50",
          borderColor: "border-cyan-200/50",
          badgeColor: "bg-cyan-100 text-cyan-700 border-cyan-200",
        };
    }
  };

  // Get tag styling with proper hover colors
  const getTagStyle = (index: number) => {
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800",
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800",
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800",
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-800",
      "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:text-pink-800",
      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800",
    ];
    return colors[index % colors.length];
  };

  // Filter and sort challenges
  const filteredChallenges = draftChallenges
    .filter((challenge) => {
      const matchesSearch =
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.shortDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        challenge.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesDifficulty =
        difficultyFilter === "all" ||
        challenge.difficulty.toLowerCase() === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "points":
          return b.rewardPoints - a.rewardPoints;
        default:
          return 0;
      }
    });

  const handleEditChallenge = (challenge: DraftChallenge) => {
    if (onEditChallenge) {
      onEditChallenge(challenge.id); // Pass only the challenge ID
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Loading Draft Challenges...
          </div>
          <div className="text-sm text-gray-500">
            Fetching your latest drafts
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-gray-700">
            Failed to Load Draft Challenges
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen flex flex-col overflow-hidden">
      {/* Fixed Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            Draft Challenges
            <FileText className="w-8 h-8 text-cyan-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">
            Manage and edit your challenge drafts before publishing
          </p>
        </div>

        {/* Create New Challenge Button */}
        <Card
          className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu hover:scale-[1.01] cursor-pointer group overflow-hidden"
          onClick={handleCreateNew}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create New Challenge
                  </h2>
                  <p className="text-white/80 text-base">
                    Start drafting a new coding challenge
                  </p>
                </div>
              </div>
              <div className="text-right group-hover:translate-x-2 transition-transform duration-300">
                <div className="text-4xl font-bold mb-1">+</div>
                <div className="text-sm opacity-80">Click to start</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-t-xl relative z-10">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                <Search className="w-5 h-5 text-white" />
              </div>
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Search Challenges
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Difficulty
                </label>
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
                    <SelectItem value="recent">Recently Modified</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="points">Reward Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Total Drafts
                </label>
                <div className="h-10 px-3 py-2 bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200/50 rounded-md flex items-center">
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    {filteredChallenges.length}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">challenges</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Draft Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => {
            const style = getChallengeStyle(challenge.difficulty);
            const IconComponent = style.icon;

            return (
              <Card
                key={challenge.id}
                className={`bg-gradient-to-r ${style.bgGradient} border ${style.borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="border-b border-gray-200/30 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${style.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200 mb-2">
                          {challenge.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`font-medium text-xs ${style.badgeColor} hover:scale-105 transition-transform duration-200`}
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 hover:text-purple-800 font-medium text-xs hover:scale-105 transition-all duration-200">
                            Draft
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 relative z-10">
                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {challenge.shortDescription}
                    </p>

                    {/* Updated grid with only 3 items now that test cases are removed */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {challenge.rewardPoints} points
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {challenge.estimatedTime} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Modified:{" "}
                          {new Date(
                            challenge.lastModified
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Updated tags with proper color schemes */}
                    <div className="flex flex-wrap gap-1">
                      {challenge.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-xs transition-all duration-200 hover:scale-105 ${getTagStyle(
                            index
                          )}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {challenge.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                        >
                          +{challenge.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleEditChallenge(challenge)}
                        className={`flex-1 bg-gradient-to-r ${style.gradient} hover:shadow-lg text-white rounded-lg hover:scale-105 transition-all duration-300 font-medium`}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Challenge
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 bg-white/80 rounded-lg hover:scale-105 transition-all duration-300 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl relative overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Draft Challenges Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || difficultyFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "You haven't created any draft challenges yet. Start by creating your first challenge!"}
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-3 font-medium hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Challenge
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
