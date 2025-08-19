"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  HelpCircle,
  Languages,
  Menu,
  Moon,
  RotateCcw,
  Save,
  Settings,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SettingsLight() {
  const [selectedLanguage, setSelectedLanguage] = useState("IsiXhosa");
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [englishHints, setEnglishHints] = useState(true);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "af", name: "Afrikaans", flag: "🇿🇦" },
    { code: "xh", name: "IsiXhosa", flag: "🇿🇦" },
  ];

  const handleLanguageChange = (language: string) => {
    if (language === "IsiXhosa") {
      i18n.changeLanguage("xh");
      console.log("To IsiXhosa");
    } else if (language === "English") {
      i18n.changeLanguage("en");
      console.log("To English");
    } else {
      i18n.changeLanguage("en"); //Because Afrikaans does not yet exist - haven't created the language conversion yet
      console.log("To Afrikaans");
    }
    setSelectedLanguage(language);
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log("Settings saved:", {
      language: selectedLanguage,
      darkMode: isDarkMode,
      englishHints: englishHints,
    });
  };

  const handleResetSettings = () => {
    setSelectedLanguage("English");
    setIsDarkMode(false);
    setEnglishHints(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 flex items-center gap-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          //   onClick={onToggleSidebar}
          className="text-gray-600 hover:text-cyan-600"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 overflow-y-auto relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 p-6 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600">
                Customize your IsiPython IDE experience
              </p>
            </div>
          </div>

          {/* Language Settings */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Languages className="w-5 h-5" />
                Language Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Choose your preferred language
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {languages.map((language) => (
                    <Button
                      key={language.code}
                      variant={
                        selectedLanguage === language.name
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleLanguageChange(language.name)}
                      className={`h-auto p-4 flex items-center gap-3 transition-all duration-300 ${
                        selectedLanguage === language.name
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-xl"
                          : "bg-white/30 backdrop-blur-xl border-white/50 text-gray-700 hover:bg-white/50 hover:scale-105"
                      }`}
                    >
                      <span className="text-2xl">{language.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold">{language.name}</p>
                        <p className="text-xs opacity-80">
                          {language.code === "en" && "English"}
                          {language.code === "af" && "Afrikaans"}
                          {language.code === "xh" && "IsiXhosa"}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                {isDarkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-xl rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-white" />
                    ) : (
                      <Sun className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="theme-toggle"
                      className="text-sm font-medium text-gray-900"
                    >
                      Dark Mode
                    </Label>
                    <p className="text-xs text-gray-600">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Assistance */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <HelpCircle className="w-5 h-5" />
                Learning Assistance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-xl rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label
                      htmlFor="english-hints"
                      className="text-sm font-medium text-gray-900"
                    >
                      English Hints
                    </Label>
                    <p className="text-xs text-gray-600">
                      Show helpful hints and explanations in English
                    </p>
                  </div>
                </div>
                <Switch
                  id="english-hints"
                  checked={englishHints}
                  onCheckedChange={setEnglishHints}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-400 data-[state=checked]:to-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={handleSaveSettings}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="flex-1 bg-white/30 backdrop-blur-xl border-white/50 text-gray-700 hover:bg-white/50 hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          {/* Settings Preview */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Current Settings Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Language</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedLanguage}
                  </p>
                </div>
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Theme</p>
                  <p className="text-lg font-bold text-gray-900">
                    {isDarkMode ? "Dark" : "Light"}
                  </p>
                </div>
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    English Hints
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {englishHints ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
