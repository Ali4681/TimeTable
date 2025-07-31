import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const isClient = typeof window !== "undefined";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: isClient ? undefined : "en",
    debug: false,
    supportedLngs: ["en", "ar"],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
    detection: {
      order: isClient ? ["localStorage", "navigator"] : [],
      caches: isClient ? ["localStorage"] : [],
    },
    react: {
      useSuspense: false,
    },
  });

// Set dir="rtl" or "ltr" based on language
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  }
});

export default i18n;
