"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Download } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { useDocTeach } from "@/app/docTeach/hooks/useDocTeach";
import { ScheduledSession } from "@/app/generateTable/generateTable.type";

interface NavbarProps {
  timetableData?: { data: { scheduled_sessions: ScheduledSession[] } };
  roomLookup: Map<string, string>;
  teacherLookup: Map<string, string>;
}

export const Navbar: React.FC<NavbarProps> = ({
  timetableData,
  roomLookup,
  teacherLookup,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();

  const { fetchAll } = useDocTeach();
  const { data: teachers } = fetchAll;

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

  const handleExportPDF = async () => {
    if (timetableData?.data?.scheduled_sessions) {
      await exportToPDF(
        timetableData,
        roomLookup,
        teacherLookup,
        `timetable_${new Date().toISOString().split("T")[0]}.pdf`,
        teachers || []
      );
    }
  };

  const handleExportExcel = () => {
    if (timetableData?.data?.scheduled_sessions) {
      exportToExcel(
        timetableData,
        roomLookup,
        teacherLookup,
        `timetable_${new Date().toISOString().split("T")[0]}.xlsx`,
        teachers || []
      );
    }
  };

  const isRTL = mounted && i18n.language === "ar";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse space-x-2" : "space-x-2"
            }`}
          >
            <div className="flex-shrink-0">
              <Image
                src="/Ebla.png"
                alt="Ebla Private University Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t("Ebla Private University")}
            </span>
          </div>

          {/* Navigation Items */}
          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse space-x-4" : "space-x-4"
            }`}
          >
            {/* Export Buttons - Desktop View */}
            <div
              className={`hidden md:flex ${
                isRTL ? "space-x-reverse space-x-2" : "space-x-2"
              } gap-2`}
            >
              <button
                onClick={handleExportPDF}
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-800/50"
                disabled={!timetableData?.data?.scheduled_sessions}
              >
                <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("Export PDF")}
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800/50"
                disabled={!timetableData?.data?.scheduled_sessions}
              >
                <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("Export Excel")}
              </button>
            </div>

            {/* Export Dropdown - Mobile View */}
            <div className="md:hidden relative group">
              <button
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={!timetableData?.data?.scheduled_sessions}
              >
                <Download className="w-5 h-5" />
              </button>
              <div
                className={`absolute ${
                  isRTL ? "left-0" : "right-0"
                } mt-2 w-48 ${
                  isRTL ? "origin-top-left" : "origin-top-right"
                } bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 hidden group-hover:block`}
              >
                <button
                  onClick={handleExportPDF}
                  className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  disabled={!timetableData?.data?.scheduled_sessions}
                >
                  {t("Export PDF")}
                </button>
                <button
                  onClick={handleExportExcel}
                  className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  disabled={!timetableData?.data?.scheduled_sessions}
                >
                  {t("Export Excel")}
                </button>
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
