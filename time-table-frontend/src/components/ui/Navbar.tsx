"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageToggle from "../LanguageToggle";
import ThemeToggle from "../ThemeToggle";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { CalendarPlus } from "lucide-react";
import { useHydrationSafeTranslation } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t: originalT, i18n } = useTranslation();
  const { t, dir } = useHydrationSafeTranslation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGenerateTimetable = () => {
    router.push("/generateTable");
  };

  const isRTL = mounted && i18n.language === "ar";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
        : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
        }`}
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <div className="flex-shrink-0">
              <Image
                src="/Ebla.png"
                alt="Ebla Private University Logo"
                width={40}
                height={40}
                className="h-10 w-10 "
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t("Ebla Private University", "Ebla Private University")}
            </span>
          </div>

          {/* Navigation Items */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            {/* Generate Timetable Button */}
            <div className={`relative group ${isRTL ? 'ml-3' : 'mr-3'}`}>
              <button
                onClick={handleGenerateTimetable}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                aria-label={t("Generate Timetable", "Generate Timetable")}
              >
                <CalendarPlus className="w-5 h-5" />
              </button>

              {/* Tooltip */}
              <div className={`absolute hidden md:block -bottom-8 ${isRTL ? 'right-1/2 transform translate-x-1/2' : 'left-1/2 transform -translate-x-1/2'} bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-60`}>
                {t("Generate Timetable", "Generate Timetable")}
              </div>
            </div>

            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
