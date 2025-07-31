"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Navbar } from "@/components/ui/Navbar";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Home,
  Layers,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Define types for our module data
type ModuleColorClass = {
  bg: string;
  from: string;
  to: string;
  text: string;
  bgLight: string;
  bgLighter: string;
  rgb: string;
  darkBg: string;
  darkFrom: string;
  darkTo: string;
  darkText: string;
  darkBgLight: string;
  darkBgLighter: string;
  darkRgb: string;
};

type ManagementModule = {
  title: string;
  titleKey: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  descriptionKey: string;
  color: string;
  colorClass: ModuleColorClass;
  accessKey: string;
};

// Type for ModuleCard props
type ModuleCardProps = {
  module: ManagementModule;
  isLoading: string | null;
  onNavigate: (path: string) => void;
  dir: "ltr" | "rtl";
  isDarkMode: boolean;
};

const ModuleCard = ({
  module,
  isLoading,
  onNavigate,
  dir,
  isDarkMode,
}: ModuleCardProps) => {
  const { t } = useTranslation("common");
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const getRotationStyle = (): React.CSSProperties => {
    if (!isHovered)
      return { transform: "perspective(1000px) rotateX(0) rotateY(0)" };

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return {};

    const cardWidth = rect.width;
    const cardHeight = rect.height;

    const rotateY =
      (mousePosition.x / cardWidth - 0.5) * 8 * (dir === "rtl" ? -1 : 1);
    const rotateX = (0.5 - mousePosition.y / cardHeight) * 8;

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: isHovered ? "transform 0.1s ease" : "transform 0.5s ease-out",
    };
  };

  const getGlowEffect = (): React.CSSProperties => {
    if (!isHovered || !cardRef.current) return {};

    const rect = cardRef.current.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    const xPercent = Math.round((mousePosition.x / cardWidth) * 100);
    const yPercent = Math.round((mousePosition.y / cardHeight) * 100);

    const rgbValue = isDarkMode
      ? module.colorClass.darkRgb
      : module.colorClass.rgb;

    return {
      background: `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
      boxShadow: `0 10px 30px -5px rgba(0, 0, 0, ${
        isDarkMode ? "0.4" : "0.1"
      }), 
                  0 0 0 1px rgba(${
                    isDarkMode ? "255, 255, 255, 0.05" : "0, 0, 0, 0.05"
                  }),
                  0 0 20px 5px rgba(${rgbValue}, ${
        isDarkMode ? "0.25" : "0.1"
      })`,
    };
  };

  // Get the appropriate color classes based on the theme
  const bg = isDarkMode ? module.colorClass.darkBg : module.colorClass.bg;
  const from = isDarkMode ? module.colorClass.darkFrom : module.colorClass.from;
  const to = isDarkMode ? module.colorClass.darkTo : module.colorClass.to;
  const text = isDarkMode ? module.colorClass.darkText : module.colorClass.text;
  const bgLight = isDarkMode
    ? module.colorClass.darkBgLight
    : module.colorClass.bgLight;
  const bgLighter = isDarkMode
    ? module.colorClass.darkBgLighter
    : module.colorClass.bgLighter;

  return (
    <div
      ref={cardRef}
      className={`
        relative h-full rounded-xl overflow-hidden
        transition-all duration-500 cursor-pointer
        ${isLoading === module.path ? "pointer-events-none" : ""}
      `}
      onClick={() => onNavigate(module.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={getRotationStyle()}
      dir={dir}
      aria-label={`Navigate to ${module.title}`}
    >
      <div
        className={`
          relative h-full rounded-xl shadow-md overflow-hidden
          ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }
          ${isHovered ? "border-transparent" : ""}
          transform transition-all duration-500
          ${isHovered ? "scale-[1.02]" : "scale-100"}
        `}
        style={getGlowEffect()}
      >
        <div
          className={`absolute inset-0 ${bg} to-white dark:to-gray-900
          opacity-100 group-hover:opacity-0 transition-opacity duration-300`}
        ></div>

        <div
          className={`absolute inset-0 ${from} ${to} 
          opacity-0 transition-opacity duration-500 ${
            isHovered ? "opacity-95" : ""
          }`}
        ></div>

        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div
            className={`
            w-full h-full rounded-full ${bgLight} 
            transform ${
              isHovered ? "scale-125 translate-x-4 -translate-y-4" : "scale-100"
            }
            transition-all duration-700 ease-out
          `}
          ></div>
        </div>

        <div className="absolute -bottom-12 -left-12">
          <div
            className={`
            w-40 h-40 rounded-full ${bgLighter} 
            opacity-20 
            transform ${
              isHovered ? "scale-110 translate-x-2 translate-y-2" : "scale-100"
            }
            transition-all duration-700 ease-out
          `}
          ></div>
        </div>

        <div className="relative z-10 h-full flex flex-col p-6">
          <div
            className={`
              w-14 h-14 rounded-lg flex items-center justify-center
              mb-6 transition-all duration-500
              ${
                isHovered
                  ? "bg-white bg-opacity-20 rotate-3 scale-110"
                  : bgLight
              }
            `}
          >
            <div
              className={`
                transition-all duration-500
                ${isHovered ? "text-black  scale-110" : text}
              `}
            >
              {module.icon}
            </div>
          </div>

          <h3
            className={`
              text-xl font-semibold mb-2 
              transform transition-all duration-500
              ${
                isHovered
                  ? "text-black -translate-y-1 scale-105"
                  : isDarkMode
                  ? "text-gray-100"
                  : "text-gray-900"
              }
            `}
          >
            {t(`modules.${module.titleKey}`)}
          </h3>

          <p
            className={`
              mb-6 transition-all duration-500
              ${
                isHovered
                  ? "text-gray-400 -translate-y-1 opacity-90"
                  : isDarkMode
                  ? "text-gray-400 opacity-90"
                  : "text-gray-600 opacity-90"
              }
            `}
          >
            {t(`modules.${module.descriptionKey}`)}
          </p>

          <div className="mt-auto">
            {isLoading === module.path ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div
                  className={`
                  flex items-center space-x-1 rounded-full py-2 px-4
                  transition-all duration-500 ease-out
                  ${
                    isHovered
                      ? "bg-white bg-opacity-80 translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }
                `}
                >
                  <span className="text-sm font-medium text-gray-500">
                    {t(`modules.${module.accessKey}`)}
                  </span>
                  {dir === "rtl" ? (
                    <ArrowLeft
                      className={`
                      h-4 w-4 text-gray-500
                      transform transition-all duration-700 
                      ${isHovered ? "-translate-x-1" : "translate-x-0"}
                    `}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight
                      className={`
                      h-4 w-4 text-gray-500
                      transform transition-all duration-700 
                      ${isHovered ? "translate-x-1" : "translate-x-0"}
                    `}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className={`
              absolute bottom-0 left-0 right-0 h-1 
              ${isDarkMode ? "bg-gray-400" : "bg-gray-400"} bg-opacity-80
              transform origin-left transition-all duration-700 ease-out
              ${isHovered ? "scale-x-100" : "scale-x-0"}
            `}
          ></div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const currentLanguage = i18n.language;
  const dir = currentLanguage === "ar" ? "rtl" : "ltr";
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    setLoadingPath(path);
    router.push(path);
  };

  const managementModules: ManagementModule[] = [
    {
      title: t("modules.modules"),
      titleKey: "modules",
      path: "/modules",
      icon: <BookOpen className="h-8 w-8" aria-hidden="true" />,
      description: t("modules.modules_desc"),
      descriptionKey: "modules_desc",
      color: "indigo",
      colorClass: {
        bg: "bg-indigo-50",
        from: "from-indigo-600",
        to: "to-indigo-800",
        text: "text-indigo-600",
        bgLight: "bg-indigo-100",
        bgLighter: "bg-indigo-200",
        rgb: "79, 70, 229",
        darkBg: "bg-indigo-900",
        darkFrom: "from-indigo-500",
        darkTo: "to-indigo-700",
        darkText: "text-indigo-400",
        darkBgLight: "bg-indigo-800",
        darkBgLighter: "bg-indigo-700",
        darkRgb: "99, 102, 241",
      },
      accessKey: "modules.access",
    },
    {
      title: t("modules.time"),
      titleKey: "time",
      path: "/hours",
      icon: <Clock className="h-8 w-8" aria-hidden="true" />,
      description: t("modules.time_desc"),
      descriptionKey: "time_desc",
      color: "emerald",
      colorClass: {
        bg: "bg-emerald-50",
        from: "from-emerald-600",
        to: "to-emerald-800",
        text: "text-emerald-600",
        bgLight: "bg-emerald-100",
        bgLighter: "bg-emerald-200",
        rgb: "16, 185, 129",
        darkBg: "bg-emerald-900",
        darkFrom: "from-emerald-500",
        darkTo: "to-emerald-700",
        darkText: "text-emerald-400",
        darkBgLight: "bg-emerald-800",
        darkBgLighter: "bg-emerald-700",
        darkRgb: "5, 150, 105",
      },
      accessKey: "time.access",
    },
    {
      title: t("modules.student"),
      titleKey: "student",
      path: "/student",
      icon: <Users className="h-8 w-8" aria-hidden="true" />,
      description: t("modules.student_desc"),
      descriptionKey: "student_desc",
      color: "blue",
      colorClass: {
        bg: "bg-blue-50",
        from: "from-blue-600",
        to: "to-blue-800",
        text: "text-blue-600",
        bgLight: "bg-blue-100",
        bgLighter: "bg-blue-200",
        rgb: "59, 130, 246",
        darkBg: "bg-blue-900",
        darkFrom: "from-blue-500",
        darkTo: "to-blue-700",
        darkText: "text-blue-400",
        darkBgLight: "bg-blue-800",
        darkBgLighter: "bg-blue-700",
        darkRgb: "37, 99, 235",
      },
      accessKey: "student.access",
    },
    {
      title: t("modules.room"),
      titleKey: "room",
      path: "/room",
      icon: <Home className="h-8 w-8" aria-hidden="true" />,
      description: t("modules.room_desc"),
      descriptionKey: "room_desc",
      color: "amber",
      colorClass: {
        bg: "bg-amber-50",
        from: "from-amber-600",
        to: "to-amber-800",
        text: "text-amber-600",
        bgLight: "bg-amber-100",
        bgLighter: "bg-amber-200",
        rgb: "245, 158, 11",
        darkBg: "bg-amber-900",
        darkFrom: "from-amber-500",
        darkTo: "to-amber-700",
        darkText: "text-amber-400",
        darkBgLight: "bg-amber-800",
        darkBgLighter: "bg-amber-700",
        darkRgb: "217, 119, 6",
      },
      accessKey: "room.access",
    },
    // {
    //   title: t("modules.section"),
    //   titleKey: "section",
    //   path: "/theoretical",
    //   icon: <Layers className="h-8 w-8" aria-hidden="true" />,
    //   description: t("modules.section_desc"),
    //   descriptionKey: "section_desc",
    //   color: "purple",
    //   colorClass: {
    //     bg: "bg-purple-50",
    //     from: "from-purple-600",
    //     to: "to-purple-800",
    //     text: "text-purple-600",
    //     bgLight: "bg-purple-100",
    //     bgLighter: "bg-purple-200",
    //     rgb: "139, 92, 246",
    //     darkBg: "bg-purple-900",
    //     darkFrom: "from-purple-500",
    //     darkTo: "to-purple-700",
    //     darkText: "text-purple-400",
    //     darkBgLight: "bg-purple-800",
    //     darkBgLighter: "bg-purple-700",
    //     darkRgb: "124, 58, 237",
    //   },
    //   accessKey: "section.access",
    // },
    {
      title: t("modules.faculty"),
      titleKey: "faculty",
      path: "/docTeach",
      icon: <UserCheck className="h-8 w-8" aria-hidden="true" />,
      description: t("modules.faculty_desc"),
      descriptionKey: "faculty_desc",
      color: "rose",
      colorClass: {
        bg: "bg-rose-50",
        from: "from-rose-600",
        to: "to-rose-800",
        text: "text-rose-600",
        bgLight: "bg-rose-100",
        bgLighter: "bg-rose-200",
        rgb: "244, 63, 94",
        darkBg: "bg-rose-900",
        darkFrom: "from-rose-500",
        darkTo: "to-rose-700",
        darkText: "text-rose-400",
        darkBgLight: "bg-rose-800",
        darkBgLighter: "bg-rose-700",
        darkRgb: "225, 29, 72",
      },
      accessKey: "faculty.access",
    },
  ];

  useEffect(() => {
    managementModules.forEach((module) => {
      router.prefetch(module.path);
    });
  }, [router, currentLanguage]);

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
        dir={dir}
      >
        <div className="pt-20 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4 transition-colors duration-300`}
              >
                {t("dashboard.title")}
              </h1>
              <p
                className={`text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } max-w-3xl mx-auto transition-colors duration-300`}
              >
                {t("dashboard.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {managementModules.map((module, index) => (
                <div
                  key={module.path}
                  className={`transform transition-all duration-500 ${
                    mounted
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <ModuleCard
                    module={module}
                    isLoading={loadingPath}
                    onNavigate={handleNavigation}
                    dir={dir}
                    isDarkMode={isDarkMode}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
