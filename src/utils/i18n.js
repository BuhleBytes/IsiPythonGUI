import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // Load translations from /public/locales
  .use(initReactI18next)
  .init({
    lng: "xh", // Default language
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
