import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isLoading: boolean;
  error: string | null;
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
  const { i18n, ready } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>("IsiXhosa");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        setError(null);
        const savedLanguage = localStorage.getItem("isipython_language");
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          const languageCode = savedLanguage === "IsiXhosa" ? "xh" : "en";
          await i18n.changeLanguage(languageCode);
        } else {
          // Set IsiXhosa as default if nothing is saved
          setCurrentLanguage("IsiXhosa");
          await i18n.changeLanguage("xh");
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
        setError("Failed to load language preferences");
        // Fallback to IsiXhosa
        setCurrentLanguage("IsiXhosa");
        try {
          await i18n.changeLanguage("xh");
        } catch (fallbackError) {
          console.error("Even fallback failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for i18n to be ready before loading saved language
    if (ready) {
      loadSavedLanguage();
    }
  }, [i18n, ready]);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const languageName = lng === "xh" ? "IsiXhosa" : "English";
      setCurrentLanguage(languageName);

      // Save to localStorage
      try {
        localStorage.setItem("isipython_language", languageName);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error saving language preference:", error);
        setError("Failed to save language preference");
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language: string) => {
    try {
      setError(null);
      setCurrentLanguage(language);
      const languageCode = language === "IsiXhosa" ? "xh" : "en";
      await i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error("Error changing language:", error);
      setError(`Failed to change language to ${language}`);
      // Revert to previous language state
      const currentLng = i18n.language;
      const revertLanguage = currentLng === "xh" ? "IsiXhosa" : "English";
      setCurrentLanguage(revertLanguage);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
    error,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading language preferences...</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
