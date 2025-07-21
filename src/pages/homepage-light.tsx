"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Code,
  FileText,
  Languages,
  Lightbulb,
  Play,
  Rocket,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { useState } from "react";

const navigationLinks = [
  { name: "Loops", icon: ArrowRight },
  { name: "Conditionals", icon: ArrowRight },
  { name: "Functions", icon: ArrowRight },
  { name: "Errors", icon: ArrowRight },
  { name: "Variables", icon: ArrowRight },
  { name: "Debug Practice", icon: ArrowRight },
  { name: "Mini Quizzes", icon: ArrowRight },
  { name: "Explore the IDE", icon: ArrowRight },
];

export function HomepageLight() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Users,
      title: "For learners, by local students",
      description:
        "IsiPython was created by local students who understand the challenges of learning programming in a second language. Our platform bridges the gap between traditional programming education and cultural understanding.",
    },
    {
      icon: Languages,
      title: "Language as a barrier",
      description:
        "Many students struggle with programming because they must first master English before understanding code concepts. IsiPython removes this barrier by teaching programming concepts in your native language first.",
    },
    {
      icon: Lightbulb,
      title: "Learn by experimenting",
      description:
        "Our interactive platform encourages hands-on learning. Write code, see immediate results, and build confidence through practical experimentation in a familiar linguistic environment.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm px-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IsiPython</h1>
                <p className="text-xs text-gray-600">
                  Learn to Code in Your Language
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#about"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#downloads"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Downloads
              </a>
              <a
                href="#docs"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Docs
              </a>
              <a
                href="#login"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Login
              </a>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg">
                Sign Up
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 via-transparent to-blue-100/50"></div>
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>

        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200 shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Revolutionary Programming Education
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-normal">
                  IsiPython
                  <span className="block text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                    Learn to Code in Your Language
                  </span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  IsiPython is a beginner-friendly programming platform that
                  teaches coding concepts in your native language, making
                  programming accessible to everyone regardless of their English
                  proficiency.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 shadow-lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  <span>Open source</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Community driven</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-600 text-sm ml-2">
                      IsiPython Code Example
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 border border-gray-300 rounded-lg p-4 shadow-inner">
                    <pre className="text-sm font-mono">
                      <code>
                        <span className="text-purple-400">
                          # IsiPython (IsiXhosa) version
                        </span>
                        {"\n"}
                        <span className="text-cyan-400">ukuba</span>{" "}
                        <span className="text-white">x</span>{" "}
                        <span className="text-cyan-400">==</span>{" "}
                        <span className="text-green-400">5</span>:{"\n"}
                        {"    "}
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">"x is 5"</span>){"\n"}
                        <span className="text-cyan-400">okanye</span>:{"\n"}
                        {"    "}
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">"x is not 5"</span>)
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-cyan-300/40 to-blue-300/40 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Why Choose IsiPython*/}
      <section className="py-20 px-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose IsiPython?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Breaking down language barriers in programming education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className={`bg-white/80 border-gray-200/80 hover:border-cyan-300 transition-all cursor-pointer group shadow-lg hover:shadow-xl ${
                    activeFeature === index
                      ? "ring-2 ring-cyan-200 border-cyan-300"
                      : ""
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <IconComponent className="w-6 h-6 text-cyan-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Practice Section */}
      <section className="py-20 px-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Practice IsiXhosa Based Programming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn coding fundamentals through interactive exercises designed
              specifically for IsiXhosa speakers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {navigationLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-cyan-300 hover:text-cyan-700 justify-between group shadow-sm"
                >
                  <span>{link.name}</span>
                  <IconComponent className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 transition-colors group shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Terminal className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Build and Run IsiXhosa Code Online
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Write, compile, and execute IsiXhosa-based Python code
                  directly in your browser. No installation required - just
                  start coding and see immediate results. start coding and see
                  immediate results.
                  <br />
                  <br />
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                  <Play className="w-4 h-4 mr-2" />
                  Try Online Editor
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emarald-50 border-emarald-200 hover:border-green-300 transition-colors group shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emarald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Resources & Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Access our extensive library of tutorials, documentation, and
                  community resources. Whether you're a complete beginner or
                  looking to advance your skills, we have materials designed
                  specifically for IsiXhosa speakers learning programming
                  concepts.
                </p>
                <Button className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-emarald-700 text-white shadow-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      {/* <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-6">
          <Card className="bg-white/80 border-gray-200/80 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Resources & Tutorials
                  </CardTitle>
                  <p className="text-gray-600">
                    Comprehensive learning materials and community support
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-6">
                Access our extensive library of tutorials, documentation, and
                community resources. Whether you're a complete beginner or
                looking to advance your skills, we have materials designed
                specifically for IsiXhosa speakers learning programming
                concepts.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Get Started With IsiPython
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Start your programming journey today with our beginner-friendly
                platform designed specifically for IsiXhosa speakers. Join
                thousands of students who are learning to code in their native
                language.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 shadow-lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-600 text-sm ml-2">
                      IsiPython IDE
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 border border-gray-300 rounded-lg p-4 space-y-2 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-400 text-sm">main.ipy</span>
                    </div>
                    <div className="h-px bg-gray-700"></div>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="text-purple-400">
                        # Welcome to IsiPython!
                      </div>
                      <div>
                        <span className="text-cyan-400">igama</span> ={" "}
                        <span className="text-green-400">"World"</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">f"Molo, World!"</span>)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating activity indicator */}
              <div className="absolute -top-2 -right-2">
                <div className="flex items-center gap-1 bg-green-100 border border-green-200 rounded-full px-2 py-1 shadow-sm">
                  <Activity className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Code className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Isi-Python</h3>
                <p className="text-sm text-gray-600">
                  A Coding Platform in Your Language
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              IsiPython is a beginner-friendly programming platform that teaches
              coding concepts in your native language, making programming
              accessible to everyone regardless of their English proficiency.
            </p>
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
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
