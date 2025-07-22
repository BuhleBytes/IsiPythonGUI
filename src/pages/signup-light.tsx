"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen, // For "Programming Basics"
  Bug,
  CheckCircle,
  Chrome,
  Code,
  Code2,
  Eye,
  EyeOff,
  GraduationCap,
  Languages, // For "Error Handling"
  LayoutDashboard,
  Lock,
  Mail,
  Rocket,
  Sparkles,
  Target, // For "Exploring the IDE"
  ThumbsUp,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  language: string;
  experience: string;
  goals: string[];
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

export function SignUpLight() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    language: "",
    experience: "",
    goals: [],
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  const languages = [{ value: "isixhosa", label: "IsiXhosa", flag: "🇿🇦" }];

  const experienceLevels = [
    {
      value: "complete-beginner",
      label: "Complete Beginner",
      description: "Never coded before",
    },
    {
      value: "some-experience",
      label: "Some Experience",
      description: "Tried coding a few times",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Know basic programming concepts",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Comfortable with multiple languages",
    },
  ];

  const learningGoals = [
    { id: "programming-basics", label: "Programming Basics", icon: Code2 },
    { id: "coding-in-isixhosa", label: "Coding in IsiXhosa", icon: Languages },
    { id: "error-handling", label: "Error Handling", icon: Bug },
    { id: "exploring-ide", label: "Exploring the IDE", icon: LayoutDashboard },
    {
      id: "build-confidence",
      label: "Build Confidence Coding",
      icon: ThumbsUp,
    },
    { id: "personal-projects", label: "Personal Projects", icon: BookOpen },
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords don't match";
    }

    if (step === 2) {
      if (!formData.language)
        newErrors.language = "Please select your preferred language";
      if (!formData.experience)
        newErrors.experience = "Please select your experience level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep) || !formData.agreeToTerms) {
      if (!formData.agreeToTerms) {
        setErrors((prev) => ({
          ...prev,
          agreeToTerms: "You must agree to the terms",
        }));
      }
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Form submitted:", formData);
      // Handle successful registration
    }, 2000);
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-cyan-600 hover:bg-gray-100"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">IsiPython</h1>
                  <p className="text-xs text-gray-600">Join the Community</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Already have an account?
              </span>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-lg"></div>

        <div className="w-full max-w-4xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200 shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Welcome to IsiPython
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Start Your
                  <span className="block text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                    Coding Journey
                  </span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Join thousands of students learning programming in their
                  native language. Break down language barriers and build your
                  future in tech.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    Learn programming concepts in your native language
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    Access to interactive coding exercises and projects
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    Join a supportive community of local developers
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    Free access to all learning materials and tools
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="text-2xl font-bold text-cyan-600">10K+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Exercises</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-gray-600">Languages</div>
                </div>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Create Account
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          step <= currentStep ? "bg-cyan-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">
                  {currentStep === 1 &&
                    "Let's start with your basic information"}
                  {currentStep === 2 &&
                    "Tell us about your learning preferences"}
                  {currentStep === 3 && "Choose your learning goals"}
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {/* Social Sign Up */}
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                          onClick={() => handleSocialSignUp("google")}
                        >
                          <Chrome className="w-4 h-4 mr-2" />
                          Continue with Google
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-2 text-gray-600">
                            or continue with email
                          </span>
                        </div>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              className="pl-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                              placeholder="John"
                            />
                          </div>
                          {errors.firstName && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                            placeholder="Doe"
                          />
                          {errors.lastName && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="pl-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                            placeholder="john@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            className="pl-10 pr-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-600 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-gray-700"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className="pl-10 pr-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-600 h-8 w-8"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                      >
                        Continue
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Language & Experience */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {/* Language Preference */}
                      <div className="space-y-3">
                        <Label className="text-gray-700 flex items-center gap-2">
                          <Languages className="w-4 h-4 text-cyan-600" />
                          Preferred Learning Language
                        </Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) =>
                            handleInputChange("language", value)
                          }
                        >
                          <SelectTrigger className="bg-white/80 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue placeholder="Choose your language" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                <div className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.language && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.language}
                          </p>
                        )}
                      </div>

                      {/* Experience Level */}
                      <div className="space-y-3">
                        <Label className="text-gray-700 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-cyan-600" />
                          Programming Experience
                        </Label>
                        <div className="space-y-2">
                          {experienceLevels.map((level) => (
                            <div
                              key={level.value}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                formData.experience === level.value
                                  ? "border-cyan-400 bg-cyan-50"
                                  : "border-gray-300 bg-white/60 hover:border-gray-400"
                              }`}
                              onClick={() =>
                                handleInputChange("experience", level.value)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    formData.experience === level.value
                                      ? "border-cyan-500 bg-cyan-500"
                                      : "border-gray-400"
                                  }`}
                                />
                                <div>
                                  <div className="text-gray-900 font-medium">
                                    {level.label}
                                  </div>
                                  <div className="text-gray-600 text-sm">
                                    {level.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {errors.experience && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.experience}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                        >
                          Continue
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Goals & Terms */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Learning Goals */}
                      <div className="space-y-3">
                        <Label className="text-gray-700 flex items-center gap-2">
                          <Target className="w-4 h-4 text-cyan-600" />
                          What do you want to learn? (Optional)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {learningGoals.map((goal) => {
                            const IconComponent = goal.icon;
                            const isSelected = formData.goals.includes(goal.id);
                            return (
                              <div
                                key={goal.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-cyan-400 bg-cyan-50"
                                    : "border-gray-300 bg-white/60 hover:border-gray-400"
                                }`}
                                onClick={() => handleGoalToggle(goal.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent
                                    className={`w-4 h-4 ${
                                      isSelected
                                        ? "text-cyan-600"
                                        : "text-gray-500"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm ${
                                      isSelected
                                        ? "text-cyan-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {goal.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Terms and Newsletter */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) =>
                              handleInputChange("agreeToTerms", checked)
                            }
                            className="mt-1 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                          />
                          <Label
                            htmlFor="terms"
                            className="text-sm text-gray-700 leading-relaxed"
                          >
                            I agree to the{" "}
                            <a
                              href="#"
                              className="text-cyan-600 hover:text-cyan-700 underline"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-cyan-600 hover:text-cyan-700 underline"
                            >
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        {errors.agreeToTerms && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.agreeToTerms}
                          </p>
                        )}

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="newsletter"
                            checked={formData.subscribeNewsletter}
                            onCheckedChange={(checked) =>
                              handleInputChange("subscribeNewsletter", checked)
                            }
                            className="mt-1 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                          />
                          <Label
                            htmlFor="newsletter"
                            className="text-sm text-gray-700 leading-relaxed"
                          >
                            Send me updates about new features, learning
                            resources, and community events
                          </Label>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || !formData.agreeToTerms}
                          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white disabled:opacity-50 shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Create Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>© 2024 IsiPython</span>
            <span>•</span>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
