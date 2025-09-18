"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Chrome,
  Code,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  Mail,
  Rocket,
  Shield,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginLight() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const { session, signInUser, resetPassword } = UserAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate("/dash");
    }
  }, [session, navigate]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear general error
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signInUser(formData.email, formData.password);

      if (result.success) {
        console.log("Login successful, navigating to dashboard...");
        navigate("/dash", { replace: true });
      } else {
        setError(result.error || "Failed to sign in");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // TODO: Implement social login if needed
    setError("Social login not implemented yet");
  };

  const handleForgotPassword = async (email: string) => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setResetSuccess(true);
        setError("");
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
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
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccess(false);
                    setError("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      IsiPython
                    </h1>
                    <p className="text-xs text-gray-600">Reset Password</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>

          <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Key className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Reset Password
              </CardTitle>
              <p className="text-gray-600">
                {resetSuccess
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive reset instructions"}
              </p>
            </CardHeader>
            <CardContent>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Email sent!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      We've sent password reset instructions to{" "}
                      <strong>{resetEmail}</strong>. Check your email and follow
                      the link to reset your password.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccess(false);
                      setError("");
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleForgotPassword(resetEmail);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-gray-700">
                      {t("Email Address")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setError("");
                      }}
                      className="text-gray-600 hover:text-cyan-600"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">IsiPython</h1>
                  <p className="text-xs text-gray-600">{t("Welcome back")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {t("New to IsiPython?")}
              </span>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                onClick={() => navigate("/signup")}
              >
                Sign Up
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

        <div className="w-full max-w-5xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200 shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t("Welcome back to IsiPython")}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {t("Continue Your")}
                  <span className="block text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                    {t("Learning Journey")}
                  </span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  {t(
                    "Sign in to access your personalized learning dashboard, track your progress, and continue mastering Python in your native language."
                  )}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                    <UserCheck className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">{t("Your Progress")}</h3>
                    <p className="text-gray-600 text-sm">
                      {t("Track learning milestones")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">
                      {t("Interactive Coding")}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t("Hands-on practice")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">
                      {t("Native Language")}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t("Learn in IsiXhosa")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">
                      {t("Community")}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t("Connect with peers")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl relative">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t("Sign In")}
                </CardTitle>
                <p className="text-gray-600">
                  {t("Access your IsiPython Learning Dashboard")}
                </p>
              </CardHeader>

              <CardContent>
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Social Login Options */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-600">
                        {t("Sign in with email")}
                      </span>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      {t("Email Address")}
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
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-700">
                        {t("Password")}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-cyan-600 hover:text-cyan-700 p-0 h-auto font-normal"
                      >
                        Forgot password?
                      </Button>
                    </div>
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
                        placeholder="Enter your password"
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
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-lg font-medium disabled:opacity-50 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {t("Signing In...")}
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        {t("Sign In")}
                      </>
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {t("Don't have an account?")}{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="text-cyan-600 hover:text-cyan-700 font-medium underline"
                      >
                        {t("Sign up for free")}
                      </button>
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {t("Secure & Private")}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {t(
                            "Your data is encrypted and secure. We never share your information with third parties."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
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
            <span>© 2025 IsiPython</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
