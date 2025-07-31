"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import dynamic from "next/dynamic";

// Dynamically import components that use i18n with no SSR
const DynamicLanguageToggle = dynamic(() => import("./LanguageToggle"), {
  ssr: false,
});

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();
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

  if (!mounted) {
    // Return a neutral version during SSR
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <Image
                  src="/Ebla.png"
                  alt="Ebla Private University Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 mr-3"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Ebla Private University
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
      }`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className={`flex items-center space-x-2 ${
              direction === "rtl" ? "rtl:space-x-reverse" : ""
            }`}
          >
            <div className="flex-shrink-0">
              <Image
                src="/Ebla.png"
                alt="Ebla Private University Logo"
                width={40}
                height={40}
                className="h-10 w-10 mr-3"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t("Ebla Private University")}
            </span>
          </div>
          <div
            className={`flex items-center space-x-4 ${
              direction === "rtl" ? "rtl:space-x-reverse" : ""
            }`}
          >
            <DynamicLanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
