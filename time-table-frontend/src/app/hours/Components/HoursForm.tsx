"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useHours } from "../hooks/useHours";
import { Hours } from "../hours.type";
import { useDays } from "@/app/days/hooks/useDays";

// Generate all days of the week with full data

const formSchema = z.object({
  day: z.string().min(1, "validation.required"),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to format time with AM/PM
const formatTime = (timeString: string): string => {
  if (!timeString || !timeString.includes(":")) return "N/A";
  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

interface HoursFormProps {
  selectedDay: string;
  onDaySelect: (day: string) => void;
  hours: Hours[];
}

export const HoursForm: React.FC<HoursFormProps> = ({
  selectedDay,
  onDaySelect,
  hours,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { updateHours, createHours, loading, error: fetchError } = useHours();
  const { data: daysData } = useDays();

  const daysOfWeek =
    daysData && daysData?.length > 0
      ? daysData?.map((item) => {
          return {
            value: item._id,
            label: item.name,
          };
        })
      : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: selectedDay || "",
    },
  });

  const [editingTime, setEditingTime] = useState<Hours | null>(null);
  const [newTime, setNewTime] = useState<string>("");
  const [timeSlotToAdd, setTimeSlotToAdd] = useState<string>("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDay && selectedDay !== form.getValues("day")) {
      form.setValue("day", selectedDay);
      setMutationError(null);
      setEditingTime(null);
    }
  }, [selectedDay, form]);

  // In your HoursForm component, replace the filteredHours logic with this:

  const filteredHours = hours
    .filter((item) => {
      console.log("item : ", item);

      // Add null check here
      if (!item.daysId) {
        console.warn("Item with null daysId found:", item);
        return false;
      }

      const day = daysOfWeek.find((d) => d.value === item.daysId._id);
      return day?.label === selectedDay;
    })
    .sort((a, b) => {
      const [aHours, aMins] = a.value.split(":").map(Number);
      const [bHours, bMins] = b.value.split(":").map(Number);
      return aHours * 60 + aMins - (bHours * 60 + bMins);
    });
  const handleEditTime = (hour: Hours) => {
    setEditingTime(hour);
    setNewTime(
      hour.value.includes(":")
        ? hour.value
        : `${String(hour.value).padStart(2, "0")}:00`
    );
    setMutationError(null);
  };

  const handleSaveTime = async () => {
    if (!editingTime || !newTime) return;
    setMutationError(null);
    setIsSubmitting(true);
    try {
      await updateHours({ id: editingTime._id, data: { value: newTime } });
      setEditingTime(null);
      setNewTime("");
    } catch (err) {
      console.error("Failed to update time slot:", err);
      setMutationError(
        t(
          "hours.updateTimeFailedError",
          "Failed to update the time slot. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewTimeSlot = async (e: FormEvent) => {
    e.preventDefault();
    setMutationError(null);

    if (!timeSlotToAdd || !selectedDay) {
      setMutationError(
        t(
          "hours.addTimeError",
          "Please enter a time and ensure a day is selected."
        )
      );
      return;
    }

    const dayObject = daysOfWeek.find((d) => d.label === selectedDay);
    if (!dayObject) {
      setMutationError(t("hours.invalidDayError", "Invalid day selected."));
      return;
    }

    setIsSubmitting(true);
    try {
      await createHours({ value: timeSlotToAdd, daysId: dayObject.value });
      setTimeSlotToAdd("");
    } catch (err) {
      console.error("Failed to add time slot:", err);
      setMutationError(
        t(
          "hours.addTimeFailedError",
          "Failed to add the time slot. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTranslatedDayName = (dayName: string): string => {
    if (!dayName) return "";
    return t(`days.${dayName.toLowerCase()}`, dayName);
  };

  if (loading && !hours.length) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full dark:border-gray-600 dark:border-t-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          {t("hours.loading", "Loading hours...")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Card className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-0 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="p-6">
          <CardTitle
            className={`text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 mb-0 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("hours.chooseDay", "Choose a Day to Edit Hours")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
                        isRTL ? "text-right block" : "text-left block"
                      }`}
                    >
                      {t("hours.dayLabel", "Day")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onDaySelect(value);
                        setEditingTime(null);
                        setMutationError(null);
                      }}
                      value={field.value}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`h-11 bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-sky-500 dark:focus:border-sky-500 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <SelectValue
                            placeholder={t(
                              "hours.selectDayPlaceholder",
                              "Select a day"
                            )}
                            className="dark:text-gray-300"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                        {daysOfWeek.map((day) => (
                          <SelectItem
                            key={day.value}
                            value={day.label}
                            className={`hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-700 dark:text-gray-200 ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            {getTranslatedDayName(day.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {mutationError && (
            <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-300">
              {mutationError}
            </div>
          )}

          {selectedDay && (
            <div className="mt-6 space-y-4">
              <h3
                className={`text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("hours.availableHoursFor", {
                  day: getTranslatedDayName(selectedDay),
                  defaultValue: `Available Hours for ${getTranslatedDayName(
                    selectedDay
                  )}`,
                })}
              </h3>
              {filteredHours.length === 0 && !loading && (
                <p
                  className={`text-sm text-gray-500 dark:text-gray-400 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t(
                    "hours.noAvailableHours",
                    "No time slots scheduled for this day yet."
                  )}
                </p>
              )}
              <div
                className={`flex flex-wrap gap-2 ${
                  isRTL ? "justify-end" : "justify-start"
                }`}
              >
                {filteredHours.map((hour) => (
                  <div key={hour._id} className="relative group">
                    {editingTime?.value === hour._id ? (
                      <div
                        className={`flex gap-2 items-center p-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-lg shadow ${
                          isRTL ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-32 h-9 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                          step="300"
                          dir="ltr"
                          disabled={isSubmitting}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveTime}
                          className="h-9 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                          disabled={!newTime || isSubmitting || loading}
                        >
                          {isSubmitting
                            ? t("common.saving", "Saving...")
                            : t("common.save", "Save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTime(null)}
                          className="h-9 px-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                          disabled={isSubmitting || loading}
                        >
                          {t("common.cancel", "Cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-sm font-medium px-3 py-1.5 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleEditTime(hour)}
                      >
                        {formatTime(hour.value)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleAddNewTimeSlot}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3"
              >
                <label
                  htmlFor="newTimeSlotInput"
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.addNewSlotLabel", "Add New Time Slot for ")}{" "}
                  {getTranslatedDayName(selectedDay)}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="newTimeSlotInput"
                    type="time"
                    value={timeSlotToAdd}
                    onChange={(e) => setTimeSlotToAdd(e.target.value)}
                    className="w-40 h-10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-sky-500 dark:focus:border-sky-500"
                    step="300"
                    dir="ltr"
                    disabled={isSubmitting || loading}
                  />
                  <Button
                    type="submit"
                    size="default"
                    className="h-10 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                    disabled={!timeSlotToAdd || isSubmitting || loading}
                  >
                    <PlusCircle
                      size={18}
                      className={`${isRTL ? "ml-2" : "mr-2"}`}
                    />
                    {isSubmitting
                      ? t("common.adding", "Adding...")
                      : t("hours.addSlotButton", "Add Slot")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
