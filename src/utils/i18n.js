import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// Function to get saved language from localStorage
const getSavedLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem("isipython_language");
    if (savedLanguage) {
      // Convert language name to language code
      return savedLanguage === "IsiXhosa" ? "xh" : "en";
    }
  } catch (error) {
    console.error("Error reading language from localStorage:", error);
  }
  // Default to IsiXhosa if nothing is saved or error occurs
  return "xh"; // Changed from "en" to "xh"
};

// Function to save language preference
const saveLanguagePreference = (languageCode) => {
  try {
    const languageName = languageCode === "xh" ? "IsiXhosa" : "English";
    localStorage.setItem("isipython_language", languageName);
  } catch (error) {
    console.error("Error saving language to localStorage:", error);
  }
};

i18n
  .use(HttpBackend) // Load translations from /public/locales
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(), // Use saved language or default to IsiXhosa
    fallbackLng: "xh", // Changed from "en" to "xh" - IsiXhosa as fallback
    interpolation: { escapeValue: false },

    // Add backend configuration to load from public/locales
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
  });

// Listen for language changes and save to localStorage
i18n.on("languageChanged", (lng) => {
  saveLanguagePreference(lng);
  console.log("Language changed to:", lng);
});

// Set IsiXhosa as default if no language is saved rege
if (!localStorage.getItem("isipython_language")) {
  localStorage.setItem("isipython_language", "IsiXhosa");
  i18n.changeLanguage("xh");
}

export default i18n;
