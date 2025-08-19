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
  Activity,
  Brain,
  ChevronRight,
  Clock,
  Code,
  Database,
  Flame,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const challenges = [
  {
    id: 1,
    title: "Hello World Mastery",
    description:
      "Master the basics of Python with print statements and variable assignments.",
    difficulty: "Low",
    category: "Basics",
    icon: Code,
    passedStudents: 1247,
    totalAttempts: 1389,
    estimatedTime: "15 min",
    points: 50,
    tags: ["Variables", "Print", "Strings"],
    isCompleted: true,
    gradient: "from-cyan-400 to-blue-500",
    bgGradient: "from-cyan-50 to-blue-50",
  },
  {
    id: 2,
    title: "Loop Detective",
    description:
      "Solve problems using for loops and while loops. Debug common loop errors.",
    difficulty: "Low",
    category: "Control Flow",
    icon: Target,
    passedStudents: 892,
    totalAttempts: 1156,
    estimatedTime: "25 min",
    points: 75,
    tags: ["Loops", "For", "While"],
    isCompleted: true,
    gradient: "from-green-400 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    id: 3,
    title: "Function Factory",
    description: "Create reusable functions with parameters and return values.",
    difficulty: "Medium",
    category: "Functions",
    icon: Zap,
    passedStudents: 634,
    totalAttempts: 987,
    estimatedTime: "35 min",
    points: 100,
    tags: ["Functions", "Parameters", "Return"],
    isCompleted: false,
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50",
  },
  {
    id: 4,
    title: "List Manipulator",
    description:
      "Master Python lists with sorting, filtering, and advanced operations.",
    difficulty: "Medium",
    category: "Data Structures",
    icon: Database,
    passedStudents: 456,
    totalAttempts: 823,
    estimatedTime: "40 min",
    points: 125,
    tags: ["Lists", "Sorting", "Filtering"],
    isCompleted: false,
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    id: 5,
    title: "Exception Handler",
    description: "Master error handling and exception management in Python.",
    difficulty: "Medium",
    category: "Error Handling",
    icon: Shield,
    passedStudents: 523,
    totalAttempts: 756,
    estimatedTime: "30 min",
    points: 100,
    tags: ["Exceptions", "Try-Catch", "Debugging"],
    isCompleted: false,
    gradient: "from-indigo-400 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
  },
  {
    id: 6,
    title: "Algorithm Architect",
    description:
      "Implement classic algorithms like binary search and merge sort.",
    difficulty: "High",
    category: "Algorithms",
    icon: Brain,
    passedStudents: 234,
    totalAttempts: 567,
    estimatedTime: "60 min",
    points: 200,
    tags: ["Algorithms", "Search", "Sort"],
    isCompleted: false,
    gradient: "from-red-400 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
  },
];

const categories = [
  "All",
  "Basics",
  "Control Flow",
  "Functions",
  "Data Structures",
  "Algorithms",
  "Error Handling",
];

export function ChallengesLight() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0";
      case "Medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0";
      case "High":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white border-0";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0";
    }
  };

  const getPassRate = (passed: number, total: number) => {
    return Math.round((passed / total) * 100);
  };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 70) return "from-green-400 to-emerald-500";
    if (passRate >= 40) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || challenge.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      challenge.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const completedChallenges = challenges.filter((c) => c.isCompleted).length;
  const totalPoints = challenges
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-200/15 to-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-cyan-500" />
              {t("Coding Challenges")}
            </h1>
            <p className="text-gray-600">
              {t("Test your Python skills with our curated challenges")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-cyan-600">
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {t("CHALLENGE MODE")}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                    2
                  </p>
                  <p className="text-xs text-gray-600">{t("Completed")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                    125
                  </p>
                  <p className="text-xs text-gray-600">{t("Points Earned")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    87%
                  </p>
                  <p className="text-xs text-gray-600">{t("Success Rate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                    #73
                  </p>
                  <p className="text-xs text-gray-600">{t("Class Rank")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder={t("Search challenges...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 focus:ring-2 backdrop-blur-sm shadow-sm"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
              <SelectValue placeholder={t("All")} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-gray-900 hover:bg-cyan-50"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
          >
            <SelectTrigger className="w-32 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
              <SelectValue placeholder={t("All")} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
              <SelectItem
                value="All"
                className="text-gray-900 hover:bg-cyan-50"
              >
                All
              </SelectItem>
              <SelectItem
                value="Low"
                className="text-gray-900 hover:bg-green-50"
              >
                Low
              </SelectItem>
              <SelectItem
                value="Medium"
                className="text-gray-900 hover:bg-yellow-50"
              >
                Medium
              </SelectItem>
              <SelectItem
                value="High"
                className="text-gray-900 hover:bg-red-50"
              >
                High
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value="Difficulty" onValueChange={() => {}}>
            <SelectTrigger className="w-32 bg-white/70 border-gray-300/50 text-gray-900 focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-sm shadow-sm">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl">
              <SelectItem
                value="difficulty"
                className="text-gray-900 hover:bg-cyan-50"
              >
                Difficulty
              </SelectItem>
              <SelectItem
                value="popularity"
                className="text-gray-900 hover:bg-cyan-50"
              >
                Popularity
              </SelectItem>
              <SelectItem
                value="points"
                className="text-gray-900 hover:bg-cyan-50"
              >
                Points
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenges Grid - Exactly like the image */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const IconComponent = challenge.icon;
            const passRate = getPassRate(
              challenge.passedStudents,
              challenge.totalAttempts
            );

            return (
              <Card
                key={challenge.id}
                className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${challenge.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {challenge.title}
                        </CardTitle>
                        <p className="text-xs text-gray-600">
                          {challenge.category}
                        </p>
                      </div>
                    </div>
                    {challenge.isCompleted && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t("Complete")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                    {challenge.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        getDifficultyColor(challenge.difficulty) + " shadow-md"
                      }
                    >
                      {challenge.difficulty}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md">
                      {challenge.points} pts
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {challenge.passedStudents.toLocaleString()} passed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{challenge.estimatedTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Pass Rate</span>
                      <span className="font-medium text-gray-800">
                        {passRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getPassRateColor(
                          passRate
                        )} shadow-sm`}
                        style={{ width: `${passRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {challenge.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/60 text-gray-700 border-gray-300/50 hover:bg-white/80 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      challenge.isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                    } border-0 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                    asChild
                  >
                    <a
                      href={`/challenge/${challenge.id}`}
                      className="flex items-center justify-center gap-2"
                    >
                      {challenge.isCompleted ? (
                        <>
                          <Activity className="w-4 h-4" />
                          {t("Review Solution")}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          {t("Start Challenge")}
                        </>
                      )}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("No challenges found")}
            </h3>
            <p className="text-gray-600">
              {t("Try adjusting your search or filter criteria")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
