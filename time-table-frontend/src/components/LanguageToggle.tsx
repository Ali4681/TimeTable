"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../components/ThemeProvider";

interface LanguageOption {
  value: string;
  label: string;
  native?: string;
}

const defaultLanguages: LanguageOption[] = [
  { value: "en", label: "English (en)", native: "English" },
  { value: "ar", label: "العربية (ar)", native: "العربية" },
];

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageOption[]>(defaultLanguages);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch("/locales/languages.json");
        if (!response.ok) throw new Error("Failed to load languages");
        const languages = await response.json();
        const langArray = Object.entries(languages).map(
          ([code, name]: [string, any]) => ({
            value: code,
            label: `${name} (${code})`,
            native:
              typeof name === "object" && name.native ? name.native : name,
          })
        );
        setAvailableLanguages(langArray);
      } catch (error) {
        console.error("Error loading languages:", error);
        setAvailableLanguages(defaultLanguages);
      }
    };

    loadLanguages();
  }, []);

  const changeLanguage = (selectedOption: LanguageOption) => {
    i18n.changeLanguage(selectedOption.value);
    setIsOpen(false);
  };

  const currentLanguage =
    availableLanguages.find((lang) => lang.value === i18n.language) ||
    availableLanguages[0];

  const isRTL = mounted && i18n.language === "ar";

  if (!mounted) {
    return <div className="w-32 h-8" />;
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 cursor-pointer me-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe
          size={16}
          className={isDarkMode ? "text-gray-300" : "text-gray-600"}
        />
        <span className="text-sm font-medium">
          {currentLanguage.value.toUpperCase()}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={`absolute mt-1 ${
              isRTL ? "left-0" : "right-0"
            } rounded-md shadow-lg z-50 max-h-60 overflow-auto min-w-[120px] ${
              isDarkMode
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-slate-200"
            }`}
          >
            {availableLanguages.map((lang) => (
              <div
                key={lang.value}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  lang.value === currentLanguage.value
                    ? isDarkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDarkMode
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                } ${isRTL ? "text-right" : "text-left"}`}
                onClick={() => changeLanguage(lang)}
              >
                <div
                  className={`flex items-center ${
                    isRTL ? "flex-row-reverse" : "flex-row"
                  } gap-2`}
                >
                  <span className="font-medium">
                    {lang.native || lang.label.split(" ")[0]}
                  </span>
                  <span className="text-xs opacity-75">
                    ({lang.value.toUpperCase()})
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageToggle;
