import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/en.json";
import viTranslation from "./locales/vi/vi.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "vi", // Default language
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
