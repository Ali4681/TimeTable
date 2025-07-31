"use client";
import { Navbar } from "@/components/NavbarTable";
import { useTheme } from "@/components/ThemeProvider";
import { tConvert } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Search,
  User,
  Users,
  ChevronDown,
  X,
} from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDocTeach } from "../docTeach/hooks/useDocTeach";
import { useRoomInfoGenerate, useRooms } from "../room/hooks/useRoom";
import { ScheduledSession } from "./generateTable.type";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "./hooks/useIsMobile";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Friday",
  "Saturday",
];

interface TimetableCell {
  time: string;
  room_id: string;
  room_name: string;
  session_type: string;
  teacher_name: string;
  doctor_name: string;
  session_id: string;
  module_name: string;
  enrollment: number;
  is_graduation_critical: boolean;
}

const TimetablePage: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const { isDarkMode, isLoading: themeLoading } = useTheme();
  const { data: roomsData, isLoading: roomsLoading } = useRooms();
  const { fetchAll } = useDocTeach();
  const { data: docTeachData, isLoading: docTeachLoading } = fetchAll;

  // Fetch timetable data from API
  const {
    data: timetableData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useRoomInfoGenerate();

  const isRTL = i18n.dir() === "rtl";

  // Searchable dropdown states
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [showAllModules, setShowAllModules] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "timetable" | "unscheduled" | "system" | "split"
  >("timetable");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to get localized string
  const getLocalizedString = (obj: any, lang: string = "en"): string => {
    if (typeof obj === "string") return obj;

    if (obj && typeof obj === "object") {
      if (lang === "ar" && obj.ar) return obj.ar;
      if (obj.en) return obj.en;
    }

    return String(obj);
  };

  // Build lookups for room and teacher names
  const { roomLookup, teacherLookup } = useMemo(() => {
    const roomMap = new Map<string, string>();
    const teacherMap = new Map<string, string>();

    if (roomsData && Array.isArray(roomsData)) {
      roomsData.forEach((room: any) => {
        if (room._id && room.name) {
          roomMap.set(room._id, room.name);
        }
      });
    }

    if (docTeachData && Array.isArray(docTeachData)) {
      docTeachData.forEach((teacher: any) => {
        if (teacher._id && teacher.name) {
          teacherMap.set(teacher._id, teacher.name);
        }
        // Also map doctor data if available
        if (teacher.doctor && teacher.doctor._id && teacher.doctor.name) {
          teacherMap.set(teacher.doctor._id, teacher.doctor.name);
        }
      });
    }

    return {
      roomLookup: roomMap,
      teacherLookup: teacherMap,
    };
  }, [roomsData, docTeachData]);

  // Build timetable grid from scheduled_sessions
  const timetableGrid = useMemo(() => {
    if (!timetableData?.data?.scheduled_sessions) {
      return {};
    }

    const sessions: ScheduledSession[] = timetableData.data.scheduled_sessions;
    const grid: Record<string, Record<string, TimetableCell[]>> = {};

    // Get unique module IDs from the scheduled sessions
    const moduleIds = [
      ...new Set(sessions.map((session) => session.module_id)),
    ];

    // Initialize grid structure
    moduleIds.forEach((moduleId) => {
      grid[moduleId] = {};
      DAYS_OF_WEEK.forEach((day) => {
        grid[moduleId][day] = [];
      });
    });

    // Populate grid with session data
    sessions.forEach((session) => {
      // Ensure the day exists in our DAYS_OF_WEEK array
      if (!DAYS_OF_WEEK.includes(session.day)) {
        console.warn(`Day ${session.day} not found in DAYS_OF_WEEK array`);
        return;
      }

      const cell: TimetableCell = {
        time: session.time,
        room_id: session.room_id,
        room_name: getLocalizedString(session.room_name),
        session_type: session.session_type,
        teacher_name: getLocalizedString(session.teacher_name),
        doctor_name: getLocalizedString(session.doctor_name),
        session_id: `${session.module_id}-${session.day}-${session.time}`,
        module_name: getLocalizedString(session.module_name),
        enrollment: session.enrollment,
        is_graduation_critical: session.is_graduation_critical,
      };

      grid[session.module_id][session.day].push(cell);
    });

    // Sort sessions within each cell by time
    Object.keys(grid).forEach((moduleId) => {
      DAYS_OF_WEEK.forEach((day) => {
        grid[moduleId][day].sort((a, b) => {
          // Convert time to comparable format (assuming HH:MM format)
          const timeA = a.time.split(":").map((num) => parseInt(num));
          const timeB = b.time.split(":").map((num) => parseInt(num));

          if (timeA[0] !== timeB[0]) {
            return timeA[0] - timeB[0]; // Compare hours
          }
          return timeA[1] - timeB[1]; // Compare minutes
        });
      });
    });

    return grid;
  }, [timetableData, i18n.language]);

  const moduleIds = Object.keys(timetableGrid);

  // Get module options with names
  const moduleOptions = useMemo(() => {
    const allOption = { id: "all", name: t("filter.allModules") };

    const moduleOptionsArray = moduleIds.map((moduleId) => {
      const moduleName =
        timetableGrid[moduleId] &&
        Object.values(timetableGrid[moduleId]).flat().length > 0
          ? getLocalizedString(
              Object.values(timetableGrid[moduleId]).flat()[0].module_name
            )
          : moduleId;

      return {
        id: moduleId,
        name: `${moduleId} - ${moduleName}`,
      };
    });

    return [allOption, ...moduleOptionsArray];
  }, [moduleIds, timetableGrid, t, i18n.language]);

  // Filter modules based on dropdown search
  const filteredModuleOptions = useMemo(() => {
    if (!dropdownSearch) return moduleOptions;

    return moduleOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
        option.id.toLowerCase().includes(dropdownSearch.toLowerCase())
    );
  }, [moduleOptions, dropdownSearch]);

  const filteredModuleIds = useMemo(() => {
    let modules = moduleIds;

    if (!showAllModules) {
      // Filter modules that have at least one session scheduled
      modules = moduleIds.filter((moduleId) =>
        Object.values(timetableGrid[moduleId]).some(
          (daySessions) => daySessions.length > 0
        )
      );
    }

    return modules.filter(
      (moduleId) => selectedModule === "all" || moduleId === selectedModule
    );
  }, [moduleIds, selectedModule, timetableGrid, showAllModules]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const isMobile = useIsMobile();

  // Handle module selection
  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setDropdownOpen(false);
    setDropdownSearch("");
  };

  // Get selected module display name
  const getSelectedModuleDisplay = () => {
    const selectedOption = moduleOptions.find(
      (option) => option.id === selectedModule
    );
    return selectedOption ? selectedOption.name : t("filter.allModules");
  };

  const isLoadingData =
    timetableLoading || roomsLoading || docTeachLoading || themeLoading;

  // Theme-aware classes
  const getBackgroundClass = () => {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-900 to-slate-800"
      : "bg-gradient-to-br from-slate-50 to-blue-50";
  };

  const getCardClass = () => {
    return isDarkMode
      ? "bg-gray-800/80 backdrop-blur-sm border-gray-700/20 text-white"
      : "bg-white/80 backdrop-blur-sm border-white/20 text-gray-900";
  };

  const getTextClass = (
    variant: "primary" | "secondary" | "muted" = "primary"
  ) => {
    if (isDarkMode) {
      switch (variant) {
        case "secondary":
          return "text-gray-300";
        case "muted":
          return "text-gray-400";
        default:
          return "text-white";
      }
    } else {
      switch (variant) {
        case "secondary":
          return "text-gray-600";
        case "muted":
          return "text-gray-500";
        default:
          return "text-gray-900";
      }
    }
  };

  const getInputClass = () => {
    return isDarkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400"
      : "border-gray-200 focus:ring-blue-500 focus:border-transparent";
  };

  const getDropdownClass = () => {
    return isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-200 text-gray-900";
  };

  const getButtonClass = () => {
    return isDarkMode
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900";
  };

  const getTableHeaderClass = () => {
    return isDarkMode
      ? "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600"
      : "bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200";
  };

  const getTableRowClass = (index: number) => {
    const baseClass = "hover:bg-opacity-50 transition-colors";
    if (isDarkMode) {
      return `${baseClass} hover:bg-gray-700 ${
        index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-700/50"
      }`;
    } else {
      return `${baseClass} hover:bg-blue-50/50 ${
        index % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
      }`;
    }
  };

  const getCellClass = (
    type: string,
    isGraduationCritical: boolean = false
  ) => {
    const baseClasses = "transition-all hover:shadow-md";
    const criticalBorder = isGraduationCritical ? "ring-2 ring-red-400" : "";

    if (isDarkMode) {
      switch (type) {
        case "theoretical":
          return `${baseClasses} bg-blue-900/50 border-blue-400 hover:bg-blue-800/50 ${criticalBorder}`;
        case "practical":
          return `${baseClasses} bg-green-900/50 border-green-400 hover:bg-green-800/50 ${criticalBorder}`;
        default:
          return `${baseClasses} bg-purple-900/50 border-purple-400 hover:bg-purple-800/50 ${criticalBorder}`;
      }
    } else {
      switch (type) {
        case "theoretical":
          return `${baseClasses} bg-blue-50 border-blue-400 hover:bg-blue-100 ${criticalBorder}`;
        case "practical":
          return `${baseClasses} bg-green-50 border-green-400 hover:bg-green-100 ${criticalBorder}`;
        default:
          return `${baseClasses} bg-purple-50 border-purple-400 hover:bg-purple-100 ${criticalBorder}`;
      }
    }
  };

  const getBadgeClass = (type: string) => {
    if (isDarkMode) {
      switch (type) {
        case "theoretical":
          return "bg-blue-800 text-blue-200";
        case "practical":
          return "bg-green-800 text-green-200";
        default:
          return "bg-purple-800 text-purple-200";
      }
    } else {
      switch (type) {
        case "theoretical":
          return "bg-blue-100 text-blue-800";
        case "practical":
          return "bg-green-100 text-green-800";
        default:
          return "bg-purple-100 text-purple-800";
      }
    }
  };

  // View mode specific classes
  const getCellPaddingClass = () => {
    return viewMode === "compact" ? "p-2" : "p-3";
  };

  const getTimeDisplayClass = () => {
    return viewMode === "compact" ? "text-xs" : "text-sm";
  };

  const getDetailDisplayClass = () => {
    return viewMode === "compact" ? "hidden" : "block";
  };

  const getCellHeightClass = () => {
    return viewMode === "compact" ? "min-h-[60px]" : "min-h-[100px]";
  };

  if (isLoadingData) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className={`text-lg font-medium ${getTextClass()}`}>
              {t("loading.timetable")}
            </p>
            <p className={`text-sm ${getTextClass("muted")} mt-1`}>
              {t("loading.message")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (timetableError) {
    console.log(timetableError?.message);
    return (
      <div className={`min-h-screen ${getBackgroundClass()} p-6`}>
        <div className="max-w-md mx-auto mt-20">
          <div
            className={`${getCardClass()} rounded-2xl shadow-xl border border-red-100 p-8`}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3
              className={`text-xl font-semibold ${getTextClass()} text-center mb-2`}
            >
              {t("errorr.title")}
            </h3>
            <p className={`${getTextClass("secondary")} text-center`}>
              {timetableError?.message || t("errorr.unexpected")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!timetableData?.data?.scheduled_sessions || moduleIds.length === 0) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} p-6`}>
        <div className="max-w-md mx-auto mt-20">
          <div
            className={`${getCardClass()} rounded-2xl shadow-xl border border-yellow-100 p-8`}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
            <h3
              className={`text-xl font-semibold ${getTextClass()} text-center mb-2`}
            >
              {t("noData.title")}
            </h3>
            <p className={`${getTextClass("secondary")} text-center`}>
              {t("noData.message")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen ${getBackgroundClass()} mt-16`}>
        {/* Header */}
        <Navbar
          timetableData={timetableData}
          roomLookup={roomLookup}
          teacherLookup={teacherLookup}
        />
        <div className={`max-w-7xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`}>
          {/* Statistics Summary */}
          {timetableData?.data?.stats_report && (
            <div
              className={`mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 ${
                isRTL ? "rtl" : "ltr"
              }`}
            >
              <div className={`${getCardClass()} rounded-xl p-4 border`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTextClass()}`}>
                    {timetableData.data.stats_report.overview.total_scheduled}
                  </div>
                  <div className={`text-sm ${getTextClass("secondary")}`}>
                    {t("stats.scheduled")}
                  </div>
                </div>
              </div>
              <div className={`${getCardClass()} rounded-xl p-4 border`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTextClass()}`}>
                    {timetableData.data.stats_report.overview.total_unscheduled}
                  </div>
                  <div className={`text-sm ${getTextClass("secondary")}`}>
                    {t("stats.unscheduled")}
                  </div>
                </div>
              </div>
              <div className={`${getCardClass()} rounded-xl p-4 border`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTextClass()}`}>
                    {Math.round(
                      timetableData.data.stats_report.overview
                        .overall_success_rate
                    )}
                    %
                  </div>
                  <div className={`text-sm ${getTextClass("secondary")}`}>
                    {t("stats.successRate")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tabs Component */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="w-full"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <TabsList
              className={`grid w-full ${
                isMobile
                  ? "grid-cols-3 max-w-[120px] mx-auto gap-0"
                  : "grid-cols-3 gap-1"
              } ${
                isDarkMode
                  ? "bg-transparent border-gray-700"
                  : `${getCardClass()} border`
              } mb-6 p-1 rounded-xl shadow-lg`}
            >
              <TabsTrigger
                value="timetable"
                className={`relative transition-all duration-200 ${
                  isMobile ? "p-2 rounded-full" : "rounded-lg py-3 px-4"
                } ${
                  activeTab === "timetable"
                    ? isDarkMode
                      ? "bg-gray-800/30 text-white shadow-md"
                      : "bg-blue-100 text-gray-900 shadow-md"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-gray-800/20 hover:text-white border border-gray-600/50"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                } font-medium flex items-center justify-center gap-2`}
              >
                {isMobile ? (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "timetable"
                        ? isDarkMode
                          ? "bg-blue-400"
                          : "bg-blue-500"
                        : isDarkMode
                        ? "bg-gray-500"
                        : "bg-gray-300"
                    }`}
                  />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{t("tabs.timetable")}</span>
                  </>
                )}
                {!isMobile && activeTab === "timetable" && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      isDarkMode ? "bg-blue-400" : "bg-blue-500"
                    } rounded-b-lg`}
                  ></span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="unscheduled"
                className={`relative transition-all duration-200 ${
                  isMobile ? "p-2 rounded-full" : "rounded-lg py-3 px-4"
                } ${
                  activeTab === "unscheduled"
                    ? isDarkMode
                      ? "bg-[#182031] text-white shadow-md"
                      : "bg-amber-100 text-gray-900 shadow-md"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-[#182031]/80 hover:text-white border border-gray-600"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                } font-medium flex items-center justify-center gap-2`}
              >
                {isMobile ? (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "unscheduled"
                        ? isDarkMode
                          ? "bg-amber-400"
                          : "bg-amber-500"
                        : isDarkMode
                        ? "bg-gray-500"
                        : "bg-gray-300"
                    }`}
                  />
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>{t("tabs.unscheduled")}</span>
                    {timetableData?.data.unscheduled_sessions && (
                      <span
                        className={`ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                          isDarkMode
                            ? activeTab === "unscheduled"
                              ? "bg-amber-500 text-amber-900"
                              : "bg-[#182031] text-amber-200"
                            : activeTab === "unscheduled"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {timetableData.data.unscheduled_sessions.length}
                      </span>
                    )}
                  </>
                )}
                {!isMobile && activeTab === "unscheduled" && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      isDarkMode ? "bg-amber-400" : "bg-amber-500"
                    } rounded-b-lg`}
                  ></span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="split"
                className={`relative transition-all duration-200 ${
                  isMobile ? "p-2 rounded-full" : "rounded-lg py-3 px-4"
                } ${
                  activeTab === "split"
                    ? isDarkMode
                      ? "bg-[#182031] text-white shadow-md"
                      : "bg-emerald-100 text-gray-900 shadow-md"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-[#182031]/80 hover:text-white border border-gray-600"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                } font-medium flex items-center justify-center gap-2`}
              >
                {isMobile ? (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "split"
                        ? isDarkMode
                          ? "bg-emerald-400"
                          : "bg-emerald-500"
                        : isDarkMode
                        ? "bg-gray-500"
                        : "bg-gray-300"
                    }`}
                  />
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>{t("tabs.split")}</span>
                    {timetableData?.data.split_modules && (
                      <span
                        className={`ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                          isDarkMode
                            ? activeTab === "split"
                              ? "bg-emerald-500 text-emerald-900"
                              : "bg-[#182031] text-emerald-200"
                            : activeTab === "split"
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {timetableData.data.split_modules.length}
                      </span>
                    )}
                  </>
                )}
                {!isMobile && activeTab === "split" && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      isDarkMode ? "bg-emerald-400" : "bg-emerald-500"
                    } rounded-b-lg`}
                  ></span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div className={`${isRTL ? "rtl" : "ltr"}`}>
              <TabsContent value="split">
                {timetableData?.data?.split_modules &&
                timetableData.data.split_modules.length > 0 ? (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-6`}
                  >
                    <h2
                      className={`text-xl font-bold ${getTextClass()} mb-4 flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      {t("splitModules.title")} (
                      {timetableData.data.split_modules.length})
                    </h2>
                    <div className="space-y-4">
                      {timetableData.data.split_modules.map(
                        (splitModule, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700/50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${getTextClass()}`}>
                                {getLocalizedString(
                                  splitModule.original_module.module_name
                                )}
                              </h3>
                              {splitModule.is_graduation_critical && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  {t("critical.graduation")}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm ${getTextClass(
                                "secondary"
                              )} mb-3`}
                            >
                              {t("splitModules.reason")}: {splitModule.reason}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4
                                  className={`font-medium ${getTextClass()} mb-2`}
                                >
                                  {t("splitModules.branches")}:
                                </h4>
                                <ul className="space-y-1">
                                  {splitModule.split_branches.map(
                                    (branch, bidx) => (
                                      <li
                                        key={bidx}
                                        className={`text-sm ${getTextClass(
                                          "secondary"
                                        )} ${isRTL ? "text-right" : ""}`}
                                      >
                                        •{" "}
                                        {getLocalizedString(branch.module_name)}{" "}
                                        ({branch.enrollment}{" "}
                                        {t("splitModules.students")})
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                              {splitModule.practical_sessions.length > 0 && (
                                <div>
                                  <h4
                                    className={`font-medium ${getTextClass()} mb-2`}
                                  >
                                    {t("splitModules.practicalSessions")}:
                                  </h4>
                                  <ul className="space-y-1">
                                    {splitModule.practical_sessions.map(
                                      (practical, pidx) => (
                                        <li
                                          key={pidx}
                                          className={`text-sm ${getTextClass(
                                            "secondary"
                                          )} ${isRTL ? "text-right" : ""}`}
                                        >
                                          •{" "}
                                          {getLocalizedString(
                                            practical.module_name
                                          )}{" "}
                                          ({practical.enrollment}{" "}
                                          {t("splitModules.students")})
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-8 text-center`}
                  >
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                      {t("splitModules.noSplitModules")}
                    </h3>
                    <p className={`mt-2 ${getTextClass("secondary")}`}>
                      {t("splitModules.noModulesSplit")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Timetable Tab */}
              <TabsContent value="timetable">
                {/* View Mode Toggle and Filters */}
                <div
                  className={`mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isRTL ? "rtl" : "ltr"
                  }`}
                >
                  <h1 className={`text-2xl font-bold ${getTextClass()}`}>
                    {t("timetable.title")}
                  </h1>
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          viewMode === "grid"
                            ? "bg-blue-600 text-white"
                            : getButtonClass()
                        }`}
                      >
                        <span>{t("vieww.grid")}</span>
                      </button>
                      <button
                        onClick={() => setViewMode("compact")}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          viewMode === "compact"
                            ? "bg-blue-600 text-white"
                            : getButtonClass()
                        }`}
                      >
                        <span>{t("vieww.compact")}</span>
                      </button>
                    </div>

                    {/* Searchable Dropdown */}
                    <div className="relative w-full md:w-80" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full px-4 py-2 rounded-lg border ${getDropdownClass()} transition-colors flex items-center justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="truncate">
                          {getSelectedModuleDisplay()}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            dropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div
                          className={`absolute top-full left-0 right-0 mt-1 ${getDropdownClass()} rounded-lg border shadow-lg z-50 max-h-80 overflow-hidden`}
                        >
                          {/* Search input inside dropdown */}
                          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                              <Search
                                className={`absolute ${
                                  isRTL ? "right-3" : "left-3"
                                } top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                              />
                              <input
                                type="text"
                                placeholder={t("search.modules")}
                                value={dropdownSearch}
                                onChange={(e) =>
                                  setDropdownSearch(e.target.value)
                                }
                                className={`w-full ${
                                  isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                                } py-2 rounded border ${getInputClass()} text-sm`}
                                dir={isRTL ? "rtl" : "ltr"}
                              />
                              {dropdownSearch && (
                                <button
                                  onClick={() => setDropdownSearch("")}
                                  className={`absolute ${
                                    isRTL ? "left-2" : "right-2"
                                  } top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Options list */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredModuleOptions.length > 0 ? (
                              filteredModuleOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleModuleSelect(option.id)}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                                    selectedModule === option.id
                                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                                      : ""
                                  } ${isRTL ? "text-right" : ""}`}
                                >
                                  <div className="truncate">{option.name}</div>
                                </button>
                              ))
                            ) : (
                              <div
                                className={`px-4 py-3 text-center text-gray-500 dark:text-gray-400 ${
                                  isRTL ? "text-right" : ""
                                }`}
                              >
                                {t("search.noResults")}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Timetable */}
                <div
                  className={`${getCardClass()} rounded-2xl shadow-xl border overflow-hidden`}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`${getTableHeaderClass()} border-b`}>
                          <th
                            className={`px-4 py-4 text-sm font-semibold ${getTextClass(
                              "secondary"
                            )} sticky ${
                              isRTL ? "right-0" : "left-0"
                            } ${getTableHeaderClass()} z-10 border-r min-w-32 ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            {t("table.module")}
                          </th>
                          {DAYS_OF_WEEK.map((day) => (
                            <th
                              key={day}
                              className={`px-3 py-4 text-center text-sm font-semibold ${getTextClass(
                                "secondary"
                              )} min-w-36`}
                            >
                              <div
                                className={`flex items-center justify-center gap-2 ${
                                  isRTL ? "flex-row-reverse" : ""
                                }`}
                              >
                                <Calendar className="w-4 h-4" />
                                {t(`days.${day.toLowerCase()}`)}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          isDarkMode ? "divide-gray-700" : "divide-gray-100"
                        }`}
                      >
                        {filteredModuleIds.map((moduleId, index) => (
                          <tr
                            key={moduleId}
                            className={getTableRowClass(index)}
                          >
                            <td
                              className={`px-4 py-6 font-semibold ${getTextClass()} sticky ${
                                isRTL ? "right-0" : "left-0"
                              } bg-inherit z-10 border-r ${
                                isDarkMode
                                  ? "border-gray-700"
                                  : "border-gray-200"
                              } ${isRTL ? "text-right" : "text-left"}`}
                            >
                              <div
                                className={`flex items-center gap-2 ${
                                  isRTL ? "flex-row-reverse" : ""
                                }`}
                              >
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                  <div className="text-sm font-bold">
                                    {moduleId}
                                  </div>
                                  {timetableGrid[moduleId] &&
                                    Object.values(
                                      timetableGrid[moduleId]
                                    ).flat().length > 0 && (
                                      <div className="text-xs text-gray-500">
                                        {
                                          Object.values(
                                            timetableGrid[moduleId]
                                          ).flat()[0]?.module_name
                                        }
                                      </div>
                                    )}
                                </div>
                              </div>
                            </td>
                            {DAYS_OF_WEEK.map((day) => (
                              <td
                                key={`${moduleId}-${day}`}
                                className="px-2 py-4 align-top"
                              >
                                <div className="space-y-2">
                                  {timetableGrid[moduleId] &&
                                    timetableGrid[moduleId][day] &&
                                    timetableGrid[moduleId][day].map(
                                      (cell, cellIndex) => {
                                        // Get room name from lookup or use cell data
                                        const roomName =
                                          roomLookup.get(cell.room_id) ||
                                          cell.room_name;

                                        // Get teacher name from lookup or use cell data
                                        const teacherName =
                                          cell.session_type == "theoretical"
                                            ? cell.doctor_name
                                            : cell.teacher_name;

                                        return (
                                          <div
                                            key={`${cell.session_id}-${cellIndex}`}
                                            className={`${getCellPaddingClass()} ${getCellHeightClass()} rounded-lg shadow-sm border-l-4 ${getCellClass(
                                              cell.session_type,
                                              cell.is_graduation_critical
                                            )}`}
                                          >
                                            <div
                                              className={`flex items-center gap-2 ${
                                                isRTL ? "flex-row-reverse" : ""
                                              }`}
                                            >
                                              <Clock
                                                className={`w-3 h-3 ${getTextClass(
                                                  "secondary"
                                                )}`}
                                              />
                                              <span
                                                className={`font-semibold ${getTimeDisplayClass()} ${getTextClass()}`}
                                              >
                                                {tConvert(cell.time)}
                                              </span>
                                              {cell.is_graduation_critical && (
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                              )}
                                            </div>

                                            <div
                                              className={`${getDetailDisplayClass()} space-y-1 text-xs mt-2`}
                                            >
                                              <div
                                                className={`flex items-center gap-1 ${getTextClass(
                                                  "secondary"
                                                )} ${
                                                  isRTL
                                                    ? "flex-row-reverse"
                                                    : ""
                                                }`}
                                              >
                                                <MapPin className="w-3 h-3" />
                                                <span className="font-medium">
                                                  {t("table.room")}:
                                                </span>
                                                <span className="truncate">
                                                  {roomName}
                                                </span>
                                              </div>

                                              <div
                                                className={`flex items-center gap-1 ${getTextClass(
                                                  "secondary"
                                                )} ${
                                                  isRTL
                                                    ? "flex-row-reverse"
                                                    : ""
                                                }`}
                                              >
                                                <User className="w-3 h-3" />
                                                <span className="font-medium">
                                                  {t("table.teacher")}:
                                                </span>
                                                <span className="truncate">
                                                  {teacherName}
                                                </span>
                                              </div>

                                              <div
                                                className={`flex items-center gap-1 ${getTextClass(
                                                  "secondary"
                                                )} ${
                                                  isRTL
                                                    ? "flex-row-reverse"
                                                    : ""
                                                }`}
                                              >
                                                <Users className="w-3 h-3" />
                                                <span className="font-medium">
                                                  {t("table.students")}:
                                                </span>
                                                <span>{cell.enrollment}</span>
                                              </div>
                                            </div>

                                            <div
                                              className={`mt-2 flex justify-between items-center ${
                                                isRTL ? "flex-row-reverse" : ""
                                              }`}
                                            >
                                              <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(
                                                  cell.session_type
                                                )}`}
                                              >
                                                {t(
                                                  `types.${cell.session_type}`
                                                )}
                                              </span>
                                              {cell.is_graduation_critical && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                  {t("critical.short")}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredModuleIds.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar
                      className={`w-12 h-12 ${getTextClass(
                        "muted"
                      )} mx-auto mb-4`}
                    />
                    <p className={getTextClass("secondary")}>
                      {t("filters.noResults")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Unscheduled Sessions Tab */}
              <TabsContent value="unscheduled">
                {timetableData?.data.unscheduled_sessions &&
                timetableData.data.unscheduled_sessions.length > 0 ? (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-6`}
                  >
                    <h2
                      className={`text-xl font-bold ${getTextClass()} mb-4 flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      {t("unscheduledNotess.title")} (
                      {timetableData.data.unscheduled_sessions.length})
                    </h2>
                    <ul className="space-y-4">
                      {timetableData.data.unscheduled_sessions.map(
                        (session, idx) => (
                          <li
                            key={idx}
                            className={`border-l-4 border-yellow-400 pl-4 ${
                              isRTL ? "border-l-0 border-r-4 pr-4 pl-0" : ""
                            }`}
                          >
                            <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                              {t("unscheduledNotes.module")}:{" "}
                              <span className="font-bold">
                                {session.module_name}
                              </span>{" "}
                              ({t(`types.${session.session_type}`)})
                              {session.is_graduation_critical && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  {t("critical.graduation")}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                              {t("unscheduledNotes.conflict")}:{" "}
                              {getLocalizedString(
                                session.conflict_description,
                                i18n.language
                              )}
                            </div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                              {t("unscheduledNotes.enrollment")}:{" "}
                              {session.enrollment} |{" "}
                              {t("unscheduledNotes.teacher")}:{" "}
                              {session.teacher_name}
                            </div>
                            {session.recommendations &&
                              session.recommendations.length > 0 && (
                                <div
                                  className={`ml-2 mt-1 ${
                                    isRTL ? "mr-2 ml-0" : ""
                                  }`}
                                >
                                  <div className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                    {t("unscheduledNotes.recommendations")}
                                  </div>
                                  <ul
                                    className={`list-disc ${
                                      isRTL ? "pl-0 pr-5" : "pl-5"
                                    } space-y-1`}
                                  >
                                    {session.recommendations.map(
                                      (rec, ridx) => (
                                        <li
                                          key={ridx}
                                          className={`text-xs text-yellow-900 dark:text-yellow-100 ${
                                            isRTL ? "text-right" : ""
                                          }`}
                                        >
                                          <span className="font-semibold">
                                            {session.session_type ===
                                            "theoretical"
                                              ? t("unscheduledNotes.doctor")
                                              : t("unscheduledNotes.teacher")}
                                          </span>
                                          :{" "}
                                          {session.session_type ===
                                          "theoretical"
                                            ? session.doctor_name
                                            : session.teacher_name}{" "}
                                          <br />
                                          <span className="font-semibold">
                                            {t("unscheduledNotes.action")}
                                          </span>
                                          :{" "}
                                          {getLocalizedString(
                                            rec.action,
                                            i18n.language
                                          )}{" "}
                                          |{" "}
                                          <span className="font-semibold">
                                            {t("unscheduledNotes.details")}
                                          </span>
                                          :{" "}
                                          {getLocalizedString(
                                            rec.details,
                                            i18n.language
                                          )}{" "}
                                          <span className="italic">
                                            [{t("unscheduledNotes.priority")}:{" "}
                                            {rec.priority},{" "}
                                            {t("unscheduledNotes.recType")}:{" "}
                                            {t(
                                              `recommendationTypes.${rec.type}`
                                            )}
                                            ]
                                          </span>
                                          {rec.alternatives &&
                                            rec.alternatives.length > 0 && (
                                              <ul
                                                className={`list-disc ${
                                                  isRTL ? "pl-0 pr-4" : "pl-4"
                                                } mt-1`}
                                              >
                                                {rec.alternatives.map(
                                                  (alt, aid) => (
                                                    <li key={aid}>
                                                      {getLocalizedString(
                                                        alt,
                                                        i18n.language
                                                      )}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-8 text-center`}
                  >
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                      {t("unscheduledNotes.noSessions")}
                    </h3>
                    <p className={`mt-2 ${getTextClass("secondary")}`}>
                      {t("unscheduledNotes.allScheduled")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* System Info Tab */}
              <TabsContent value="system">
                {timetableData?.data?.system_info ? (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-6`}
                  >
                    <h2 className={`text-xl font-bold ${getTextClass()} mb-4`}>
                      {t("systemInfo.title")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`text-sm ${getTextClass("secondary")}`}>
                          {t("systemInfo.totalTimeSlots")}
                        </div>
                        <div
                          className={`text-lg font-semibold ${getTextClass()}`}
                        >
                          {timetableData.data.system_info.total_time_slots}
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`text-sm ${getTextClass("secondary")}`}>
                          {t("systemInfo.theoreticalRooms")}
                        </div>
                        <div
                          className={`text-lg font-semibold ${getTextClass()}`}
                        >
                          {
                            timetableData.data.system_info
                              .total_theoretical_rooms
                          }
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`text-sm ${getTextClass("secondary")}`}>
                          {t("systemInfo.practicalCapacity")}
                        </div>
                        <div
                          className={`text-lg font-semibold ${getTextClass()}`}
                        >
                          {
                            timetableData.data.system_info
                              .practical_lab_capacity
                          }
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`text-sm ${getTextClass("secondary")}`}>
                          {t("systemInfo.graduationPriority")}
                        </div>
                        <div
                          className={`text-lg font-semibold ${getTextClass()}`}
                        >
                          {timetableData.data.system_info
                            .graduation_priority_enabled
                            ? t("common.enabled")
                            : t("common.disabled")}
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`text-sm ${getTextClass("secondary")}`}>
                          {t("systemInfo.finalYearThreshold")}
                        </div>
                        <div
                          className={`text-lg font-semibold ${getTextClass()}`}
                        >
                          {timetableData.data.system_info.final_year_threshold}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${getCardClass()} rounded-2xl shadow-xl border p-8 text-center`}
                  >
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                      {t("systemInfo.noData")}
                    </h3>
                    <p className={`mt-2 ${getTextClass("secondary")}`}>
                      {t("systemInfo.noSystemInfo")}
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Generation Timestamp */}
          {timetableData?.data?.timestamp && (
            <div className="mt-6 text-center">
              <p className={`text-sm ${getTextClass("muted")}`}>
                {t("timetable.generatedAt")}:{" "}
                {new Date(timetableData.data.timestamp).toLocaleString(
                  i18n.language
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TimetablePage;
