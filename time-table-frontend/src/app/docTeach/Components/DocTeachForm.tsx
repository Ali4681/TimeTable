"use client";

import { getDayNames, useDays } from "@/app/days/hooks/useDays";
import { useHours } from "@/app/hours/hooks/useHours";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tConvert } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DocTeach, DoctorWithHours } from "../docTeach.type";

interface HourOption {
  label: string;
  value: string;
  dayId: string;
}

interface DayHourSelectorProps {
  dayOptions: { label: string; value: string }[];
  hourOptions: HourOption[];
  selectedDays: string[];
  dayHours: Record<string, string[]>;
  onDaysChange: (days: string[]) => void;
  onDayHoursChange: (dayId: string, hours: string[]) => void;
  daysLoading: boolean;
  hoursLoading: boolean;
  mode?: "create" | "edit";
}

const docTeachSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  hours: z.array(z.string()).optional(),
  days: z.array(z.string()).optional(),
  dayHours: z.record(z.string(), z.array(z.string())).optional(),
  isDoctor: z.boolean().optional(),
});

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = ({
  options,
  value = [],
  onChange,
  placeholder,
  className,
}: MultiSelectProps) => {
  const handleSelect = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newValue);
  };

  const removeItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    onChange(value.filter((item) => item !== itemToRemove));
  };

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Select onValueChange={handleSelect} value="">
        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={`text-gray-900 dark:text-gray-100 ${
                value.includes(option.value)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 min-h-[3rem]">
          {value.map((item) => {
            const option = options.find((opt) => opt.value === item);
            return (
              <Badge
                key={item}
                variant="secondary"
                className="pl-3 pr-1 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
              >
                <span className="mr-1">{option?.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeItem(e, item)}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center"
                  aria-label={`Remove ${option?.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DayHourSelector = ({
  dayOptions,
  hourOptions,
  selectedDays,
  dayHours,
  onDaysChange,
  onDayHoursChange,
  daysLoading,
  hoursLoading,
  mode = "create",
}: DayHourSelectorProps) => {
  const [dayHourAvailability, setDayHourAvailability] = useState<
    Record<string, string[]>
  >({});

  const getAvailableHoursForDay = (dayId: string) => {
    const day = dayOptions.find((d) => d.value === dayId);
    if (!day) return hourOptions;

    const dayName = day.label.toLowerCase();
    const isWeekend =
      dayName.includes("saturday") || dayName.includes("sunday");

    return hourOptions.filter((hour) => {
      const hourValue = parseInt(hour.label.split(":")[0]);

      if (isWeekend) {
        // Weekend hours: 9AM to 5PM
        return hourValue >= 9 && hourValue <= 17;
      } else {
        // Weekday hours: 8AM to 8PM
        return hourValue >= 8 && hourValue <= 20;
      }
    });
  };

  useEffect(() => {
    const newAvailability: Record<string, string[]> = {};
    selectedDays.forEach((dayId) => {
      newAvailability[dayId] = getAvailableHoursForDay(dayId).map(
        (h) => h.value
      );
    });
    setDayHourAvailability(newAvailability);
  }, [selectedDays, hourOptions]);

  const handleDaySelect = (selectedValue: string) => {
    const isSelected = selectedDays.includes(selectedValue);
    let newDays: string[];
    if (isSelected) {
      newDays = selectedDays.filter((d) => d !== selectedValue);
    } else {
      newDays = [...selectedDays, selectedValue];
    }
    onDaysChange(newDays);
  };

  const removeDayAndHours = (e: React.MouseEvent, dayToRemove: string) => {
    e.stopPropagation();
    const newDays = selectedDays.filter((day) => day !== dayToRemove);
    onDaysChange(newDays);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select onValueChange={handleDaySelect} value="">
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <SelectValue
              placeholder={
                daysLoading ? "Loading days..." : "Select available days"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {dayOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={`text-gray-900 dark:text-gray-100 ${
                  selectedDays.includes(option.value)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedDays.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 min-h-[3rem]">
            {selectedDays.map((dayId) => {
              const dayOption = dayOptions.find((opt) => opt.value === dayId);
              const hoursCount = dayHours[dayId]?.length || 0;
              return (
                <Badge
                  key={dayId}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                >
                  <span className="mr-1">
                    {dayOption?.label} {hoursCount > 0 && `(${hoursCount}h)`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => removeDayAndHours(e, dayId)}
                    className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center"
                    aria-label={`Remove ${dayOption?.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {selectedDays.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Select Hours for Each Day
            </span>
          </div>

          {selectedDays.map((dayId) => {
            const dayOption = dayOptions.find((opt) => opt.value === dayId);
            const daySpecificHours = dayHours[dayId] || [];

            // FIXED: In edit mode, show only hours that belong to this day and are either:
            // 1. Already selected for this day, OR
            // 2. Available hours for this day (for adding new ones)
            let availableHours;
            if (mode === "edit") {
              // In edit mode, show selected hours + available hours for this day
              // Fix for the TypeScript error in DayHourSelector component
              // Replace the problematic section around line 260-280

              // In edit mode, show selected hours + available hours for this day
              const selectedHourObjects = daySpecificHours
                .map((hourId) => {
                  const hour = hourOptions.find((h) => h.value === hourId);
                  return hour
                    ? {
                        ...hour,
                        label: tConvert(hour.label) || hour.label,
                      }
                    : null;
                })
                .filter(
                  (
                    item
                  ): item is { label: string; value: string; dayId: string } =>
                    item !== null
                );

              const availableHourObjects = hourOptions
                .filter(
                  (h) =>
                    h.dayId === dayId && !daySpecificHours.includes(h.value)
                )
                .map((h) => ({
                  ...h,
                  label: tConvert(h.label) || h.label,
                }));

              availableHours = [
                ...selectedHourObjects,
                ...availableHourObjects,
              ];
            } else {
              // In create mode, show all available hours for this day
              availableHours = hourOptions
                .filter((h) => h.dayId === dayId)
                .map((h) => ({
                  ...h,
                  label: tConvert(h.label) || h.label,
                }));
            }

            return (
              <div
                key={dayId}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {dayOption?.label}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                  >
                    {daySpecificHours.length} hour
                    {daySpecificHours.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <MultiSelect
                  options={availableHours}
                  value={daySpecificHours}
                  onChange={(hours) => onDayHoursChange(dayId, hours)}
                  placeholder={
                    hoursLoading
                      ? "Loading hours..."
                      : "Select hours for this day"
                  }
                  className="w-full"
                />

                <div className="mt-2 flex flex-wrap gap-1">
                  {daySpecificHours.map((hourId) => {
                    const hour = hourOptions.find((h) => h.value === hourId);
                    const hourLabel = hour
                      ? tConvert(hour.label) || hour.label
                      : hourId;
                    return (
                      <Badge
                        key={hourId}
                        variant="outline"
                        className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                      >
                        {hourLabel}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ScheduleOverviewProps {
  selectedDays: string[];
  dayHours: Record<string, string[]>;
  daysList: any[];
  hoursList: any[];
}

const ScheduleOverview = ({
  selectedDays,
  dayHours,
  daysList,
  hoursList,
}: ScheduleOverviewProps) => {
  if (selectedDays.length === 0) {
    return null;
  }

  const getTotalHours = () => {
    return Object.values(dayHours).reduce(
      (total, hours) => total + hours.length,
      0
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Schedule Overview
          </h3>
        </div>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            <strong>{selectedDays.length}</strong> days
          </span>
          <span>
            <strong>{getTotalHours()}</strong> total hours
          </span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hours Count
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time Slots
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {selectedDays.map((dayId) => {
                const dayName = getDayNames(dayId, daysList);
                const daySpecificHours = dayHours[dayId] || [];
                const hoursCount = daySpecificHours.length;

                return (
                  <tr
                    key={dayId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {dayName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant={hoursCount > 0 ? "default" : "secondary"}
                          className={
                            hoursCount > 0
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }
                        >
                          {hoursCount} hour{hoursCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {hoursCount > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {/* MODIFIED: Show only hours assigned to this specific day */}
                            {daySpecificHours.slice(0, 4).map((hourId) => {
                              const hour = hoursList.find(
                                (h) => h._id === hourId
                              );
                              const hourLabel =
                                hour?.name || hour?.value || hourId;
                              return (
                                <Badge
                                  key={hourId}
                                  variant="outline"
                                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                                >
                                  {tConvert(hourLabel)}
                                </Badge>
                              );
                            })}
                            {daySpecificHours.length > 4 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              >
                                +{daySpecificHours.length - 4} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                            No hours selected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface DocTeachFormProps {
  onSubmit: (docTeach: DocTeach) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  initialData?: DoctorWithHours | null;
  mode?: "create" | "edit";
  onDeleteSuccess?: () => void;
}

const DocTeachForm: React.FC<DocTeachFormProps> = ({
  onSubmit,
  onDelete,
  onClose,
  initialData = null,
  mode = "create",
  onDeleteSuccess,
}) => {
  const { hours, loading: hoursLoading } = useHours();
  const { data: days = [], isLoading: daysLoading } = useDays();

  const dayOptions = days.map((day) => ({
    label: day.name || day._id,
    value: day._id,
  }));

  const hourOptions = hours.map((hour) => ({
    label: hour.value,
    value: hour._id,
    dayId: hour.daysId?._id,
  }));

  const form = useForm<z.infer<typeof docTeachSchema>>({
    resolver: zodResolver(docTeachSchema),
    defaultValues: {
      _id: "",
      name: "",
      hours: [],
      days: [],
      dayHours: {},
      isDoctor: false,
    },
  });

  const selectedDays = form.watch("days") || [];
  const dayHours = form.watch("dayHours") || {};

  useEffect(() => {
    if (initialData) {
      form.reset({
        _id: initialData.doctor._id || "",
        name: initialData.doctor.name,
        days: (initialData as any).days || [],
        dayHours: (initialData as any).dayHours || {},
        isDoctor: initialData.doctor.isDoctor || false,
        hours: initialData.hours.map((item) => item._id) || [],
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    const currentDayHours = form.getValues("dayHours") || {};
    const newDayHours = { ...currentDayHours };

    selectedDays.forEach((dayId) => {
      if (!newDayHours[dayId]) {
        newDayHours[dayId] = [];
      }
    });

    Object.keys(newDayHours).forEach((dayId) => {
      if (!selectedDays.includes(dayId)) {
        delete newDayHours[dayId];
      }
    });

    form.setValue("dayHours", newDayHours);
  }, [selectedDays, form]);

  const handleDaysChange = (newDays: string[]) => {
    form.setValue("days", newDays);
  };

  const handleDayHoursChange = (dayId: string, hours: string[]) => {
    const currentDayHours = form.getValues("dayHours") || {};
    form.setValue("dayHours", {
      ...currentDayHours,
      [dayId]: hours,
    });
  };

  const handleSubmit = (data: z.infer<typeof docTeachSchema>) => {
    const allHours = Object.values(data.dayHours || {}).flat();
    const uniqueHours = [...new Set(allHours)];

    const cleanData: DocTeach = {
      name: data.name,
      ...(data._id && data._id !== "" && { _id: data._id }),
      hourIds: uniqueHours,
      ...(data.days && { days: data.days }),
      ...(data.dayHours && { dayHours: data.dayHours }),
      isDoctor: data.isDoctor ?? false,
    };

    onSubmit(cleanData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && initialData?.doctor._id) {
      onDelete(initialData.doctor._id);
      onDeleteSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === "create" ? "Create" : "Edit"} Doctor/Teacher
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mode === "edit" && (
                  <FormField
                    control={form.control}
                    name="_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ID"
                            {...field}
                            disabled={true}
                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem
                      className={mode === "create" ? "sm:col-span-2" : ""}
                    >
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDoctor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 sm:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Is Doctor
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Available Days & Hours
                      </FormLabel>
                      <FormControl>
                        <DayHourSelector
                          dayOptions={dayOptions}
                          hourOptions={hourOptions}
                          selectedDays={selectedDays}
                          dayHours={dayHours}
                          onDaysChange={handleDaysChange}
                          onDayHoursChange={handleDayHoursChange}
                          daysLoading={daysLoading}
                          hoursLoading={hoursLoading}
                          mode={mode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ScheduleOverview
                selectedDays={selectedDays}
                dayHours={dayHours}
                daysList={days}
                hoursList={hours}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900 mt-6 -mx-6 px-6 pb-6">
                {mode === "edit" && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className="gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                  >
                    <X size={16} />
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                  {mode === "create" ? "Create" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocTeachForm;
