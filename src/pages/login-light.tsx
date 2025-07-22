"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";

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

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login successful:", formData);
      // Handle successful login - redirect to dashboard
    }, 2000);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  const handleForgotPassword = async (email: string) => {
    console.log("Password reset requested for:", email);
    // Handle password reset logic
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
                  onClick={() => setShowForgotPassword(false)}
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
                Enter your email to receive reset instructions
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword(formData.email);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-gray-600 hover:text-cyan-600"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
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
                  <p className="text-xs text-gray-600">Welcome Back</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">New to IsiPython?</span>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                asChild
              >
                <a href="/signup">Sign Up</a>
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
                  Welcome Back to IsiPython
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Continue Your
                  <span className="block text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                    Learning Journey
                  </span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Sign in to access your personalized learning dashboard, track
                  your progress, and continue mastering Python in your native
                  language.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                    <UserCheck className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Your Progress</h3>
                    <p className="text-gray-600 text-sm">
                      Track learning milestones
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">
                      Interactive Coding
                    </h3>
                    <p className="text-gray-600 text-sm">Hands-on practice</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">
                      Native Language
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Learn in IsiXhosa & more
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-gray-200/50 shadow-sm backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Community</h3>
                    <p className="text-gray-600 text-sm">Connect with peers</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">15K+</div>
                  <div className="text-sm text-gray-600">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl relative">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sign In
                </CardTitle>
                <p className="text-gray-600">
                  Access your IsiPython learning dashboard
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Social Login Options */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                      onClick={() => handleSocialLogin("google")}
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
                        or sign in with email
                      </span>
                    </div>
                  </div>

                  {/* Email Field */}
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
                        Password
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

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          handleInputChange("rememberMe", checked)
                        }
                        className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm text-gray-700"
                      >
                        Remember me
                      </Label>
                    </div>
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <a
                        href="/signup"
                        className="text-cyan-600 hover:text-cyan-700 font-medium underline"
                      >
                        Sign up for free
                      </a>
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Secure & Private
                        </h4>
                        <p className="text-xs text-gray-600">
                          Your data is encrypted and secure. We never share your
                          information with third parties.
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
              Help & Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
