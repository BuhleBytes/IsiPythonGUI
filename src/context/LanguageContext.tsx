import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>("English");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem("isipython_language");
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          const languageCode = savedLanguage === "IsiXhosa" ? "xh" : "en";
          i18n.changeLanguage(languageCode);
        } else {
          // Set default if nothing is saved
          setCurrentLanguage("English");
          i18n.changeLanguage("en");
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
        setCurrentLanguage("English");
        i18n.changeLanguage("en");
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const languageName = lng === "xh" ? "IsiXhosa" : "English";
      setCurrentLanguage(languageName);

      // Save to localStorage
      try {
        localStorage.setItem("isipython_language", languageName);
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    const languageCode = language === "IsiXhosa" ? "xh" : "en";
    i18n.changeLanguage(languageCode);
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading language preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
