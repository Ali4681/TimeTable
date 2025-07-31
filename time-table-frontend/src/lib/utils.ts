import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiClient = axios.create({
  baseURL: "http://localhost:8000",
});

export function tConvert(time: any) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}

// Custom hook for hydration-safe translations
export function useHydrationSafeTranslation(namespace?: string) {
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation(namespace);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Provide safe defaults for SSR
  const safeT = (key: string, fallback?: string) => {
    if (!mounted) {
      // Return fallback or key during SSR
      return fallback || key;
    }
    return t(key);
  };

  const safeDir: "ltr" | "rtl" = mounted && i18n.language === "ar" ? "rtl" : "ltr";

  return {
    t: safeT,
    i18n,
    mounted,
    dir: safeDir,
    isRTL: mounted && i18n.language === "ar"
  };
}
