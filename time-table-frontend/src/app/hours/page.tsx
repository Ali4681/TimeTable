"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HoursForm } from "./Components/HoursForm";
import { useHours } from "./hooks/useHours";
import AllHoursTable from "./Components/allHoursTable";
import { Hours, UpdateHoursDto } from "./hours.type";
import { useDays } from "../days/hooks/useDays";
import { Navbar } from "@/components/nav";

const HoursPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Use the useHours hook to fetch and manage hours data
  const { hours, loading, error, createHours, updateHours, deleteHours } =
    useHours();

  const { data: daysData } = useDays();

  console.log("Hours:", hours);

  // State for the currently selected day
  const [selectedDay, setSelectedDay] = useState<string>("");

  // Handler for day selection
  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  // Set document direction and language
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  return (
    <>
      <Navbar />

      <main
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 md:px-8 transition-colors duration-300 mt-8 ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1
              className={`text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("hours.title", "Manage Operating Hours")}
            </h1>
          </div>

          <div className="mb-8 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
            <p
              className={`text-gray-700 dark:text-gray-300 italic ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t(
                "hours.description",
                "View and manage the available time slots for each day."
              )}
            </p>
          </div>

          <div
            className={`grid gap-8 md:grid-cols-1 lg:grid-cols-12 ${
              isRTL ? "lg:grid-flow-col-dense" : ""
            }`}
          >
            {/* HoursForm Section */}
            <div
              className={`${
                isRTL ? "lg:col-start-1 lg:col-span-5" : "lg:col-span-5"
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-2xl">
                <h2
                  className={`text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.editSchedule", "Edit Schedule by Day")}
                </h2>
                <HoursForm
                  selectedDay={selectedDay}
                  onDaySelect={handleDaySelect}
                  hours={hours}
                />
              </div>
            </div>
          </div>

          {/* All Hours Table Section */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-2xl">
            <h2
              className={`text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t(
                "hours.allBackendSlotsTitle",
                "All Backend Time Slots (Raw Data View)"
              )}
            </h2>
            <AllHoursTable
              rawHours={hours}
              days={daysData}
              loading={loading}
              isRTL={isRTL}
              onEdit={(id, newValue) =>
                updateHours({ id, data: { value: newValue } })
              }
              onDelete={deleteHours}
              deleteHour={function (id: string) {
                return deleteHours(id);
              }}
              updateHours={function (params: {
                id: string;
                data: UpdateHoursDto;
              }) {
                return updateHours({
                  id: params.id,
                  data: { ...params.data, daysId: params.data.daysId },
                });
              }}
              error={error?.message + " dasdsad"}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default HoursPage;
