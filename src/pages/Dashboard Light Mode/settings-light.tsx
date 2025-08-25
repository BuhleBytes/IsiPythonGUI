"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function SettingsLight() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  // Initialize states with default values
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [englishHints, setEnglishHints] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Only English and IsiXhosa languages
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "xh", name: "IsiXhosa", flag: "🇿🇦" },
  ];

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const loadSavedSettings = () => {
      try {
        // Sync with context language
        setSelectedLanguage(currentLanguage);

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem("isipython_dark_mode");
        if (savedDarkMode !== null) {
          setIsDarkMode(savedDarkMode === "true");
        }

        // Load English hints preference
        const savedEnglishHints = localStorage.getItem(
          "isipython_english_hints"
        );
        if (savedEnglishHints !== null) {
          setEnglishHints(savedEnglishHints === "true");
        }
      } catch (error) {
        console.error("Error loading settings from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSettings();
  }, [currentLanguage]);

  // Save settings to localStorage whenever they change
  const saveToLocalStorage = (key: string, value: string | boolean) => {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleLanguageChange = (language: string) => {
    console.log("Changing language to:", language);

    setSelectedLanguage(language);
    changeLanguage(language); // Use context method instead of i18n directly
    saveToLocalStorage("isipython_language", language);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    saveToLocalStorage("isipython_dark_mode", checked);
    console.log("Dark mode:", checked ? "enabled" : "disabled");
  };

  const handleEnglishHintsChange = (checked: boolean) => {
    setEnglishHints(checked);
    saveToLocalStorage("isipython_english_hints", checked);
    console.log("English hints:", checked ? "enabled" : "disabled");
  };

  const handleSaveSettings = () => {
    // Force save all current settings
    saveToLocalStorage("isipython_language", selectedLanguage);
    saveToLocalStorage("isipython_dark_mode", isDarkMode);
    saveToLocalStorage("isipython_english_hints", englishHints);

    console.log("Settings saved:", {
      language: selectedLanguage,
      darkMode: isDarkMode,
      englishHints: englishHints,
    });

    // Show user feedback (you could add a toast notification here)
    alert(t("Settings saved successfully!") || "Settings saved successfully!");
  };

  const handleResetSettings = () => {
    // Reset to default values - IsiXhosa as default
    setSelectedLanguage("IsiXhosa");
    setIsDarkMode(false);
    setEnglishHints(true);

    // Clear localStorage
    localStorage.removeItem("isipython_language");
    localStorage.removeItem("isipython_dark_mode");
    localStorage.removeItem("isipython_english_hints");

    // Reset language using context - IsiXhosa as default
    changeLanguage("IsiXhosa");

    console.log("Settings reset to defaults");
  };

  // Show loading state while settings are being loaded
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t("Loading settings...") || "Loading settings..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 flex items-center gap-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-cyan-600"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">{t("settings")}</h1>
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
                {t("settings")}
              </h1>
              <p className="text-gray-600">{t("settings_description")}</p>
            </div>
          </div>

          {/* Language Settings */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Languages className="w-5 h-5" />
                {t("language_settings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  {t("choose_language")}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          {language.code === "en" ? "English" : "IsiXhosa"}
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
                {t("theme_settings")}
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
                      {t("dark_mode")}
                    </Label>
                    <p className="text-xs text-gray-600">
                      {t("dark_mode_description")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeChange}
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
                {t("learning_assistance")}
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
                      {t("english_hints")}
                    </Label>
                    <p className="text-xs text-gray-600">
                      {t("english_hints_description")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="english-hints"
                  checked={englishHints}
                  onCheckedChange={handleEnglishHintsChange}
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
              {t("save_settings")}
            </Button>
            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="flex-1 bg-white/30 backdrop-blur-xl border-white/50 text-gray-700 hover:bg-white/50 hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("reset_settings")}
            </Button>
          </div>

          {/* Settings Preview */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900">
                {t("current_settings_preview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    {t("language")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedLanguage}
                  </p>
                </div>
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    {t("theme")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {isDarkMode ? t("dark") : t("light")}
                  </p>
                </div>
                <div className="p-3 bg-white/30 backdrop-blur-xl rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    {t("english_hints")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {englishHints ? t("enabled") : t("disabled")}
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
