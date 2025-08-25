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
  return "xh";
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
  .use(HttpBackend) // Load translations from /public
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(), // Use saved language or default to IsiXhosa
    fallbackLng: "en", // Use English as fallback (no translation, just show original English)

    // Debug mode - turn this on to see what's happening
    debug: true,

    interpolation: {
      escapeValue: false,
    },

    // Backend configuration
    backend: {
      // Updated path to match your file structure
      loadPath: "/{{lng}}/translation.json",

      // Add these options for better loading
      requestOptions: {
        cache: "default",
        credentials: "same-origin",
        mode: "cors",
      },
    },

    // Add resource configuration
    resources: {
      // English will use the keys as values (no translation file needed)
      en: {
        translation: {}, // Empty - will show keys as-is
      },
    },

    // Configure how missing translations are handled
    parseMissingKeyHandler: (key) => {
      console.log("Missing translation key:", key);
      return key; // Return the key itself if translation is missing
    },
  });

// Listen for language changes and save to localStorage
i18n.on("languageChanged", (lng) => {
  saveLanguagePreference(lng);
  console.log("Language changed to:", lng);
  console.log("Translation store:", i18n.store.data);
});

// Set IsiXhosa as default if no language is saved
if (!localStorage.getItem("isipython_language")) {
  localStorage.setItem("isipython_language", "IsiXhosa");
  i18n.changeLanguage("xh");
}

// Add initialization event listener to debug loading
i18n.on("initialized", (options) => {
  console.log("i18n initialized with options:", options);
  console.log("Available resources:", i18n.store.data);
});

// Add loaded event listener
i18n.on("loaded", (loaded) => {
  console.log("Translation resources loaded:", loaded);
});

// Add failedLoading event listener
i18n.on("failedLoading", (lng, ns, msg) => {
  console.error("Failed to load translations:", lng, ns, msg);
});

export default i18n;
