"use client";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { IRoom, IRoomCreate } from "../room.type";
import { useModules } from "@/app/modules/hooks/useModules";

// Constants
const MAX_CAPACITY = 100;
const MIN_CAPACITY = 1;

// Zod Schema for Validation
export const roomSchema = z.object({
  name: z.string().min(2, { message: "roomNameMinLength" }),
  capacity: z
    .number()
    .min(MIN_CAPACITY, { message: "capacityMin" })
    .max(MAX_CAPACITY, { message: "capacityMax" }),
  modules: z.array(z.string()).default([]),
  theoretical: z.boolean({ required_error: "required" }), // ✅ Required field
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
  onSubmit: (room: IRoomCreate) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Partial<IRoom>;
  mode?: "create" | "edit";
  onClose: () => void;
  isLoading?: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  onDelete,
  initialData = {},
  mode = "create",
  onClose,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const isRTL = i18n.language === "ar";
  const { isDarkMode, setTheme } = useTheme();
  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
  } = useModules();

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: initialData.name || "",
      capacity: initialData.capacity || MIN_CAPACITY,
      modules: initialData.modules || [],
      theoretical:
        typeof initialData.theoretical === "boolean"
          ? initialData.theoretical
          : true, // Default to theoretical
    },
  });

  const { watch, setValue, handleSubmit, formState } = form;
  const currentModules = watch("modules");

  // // Auto-update theoretical based on lecture hall selection
  // useEffect(() => {
  //   setValue("theoretical", isLectureHall);
  // }, [isLectureHall, setValue]);

  const handleAddModule = () => {
    if (selectedModule && !currentModules.includes(selectedModule)) {
      setValue("modules", [...currentModules, selectedModule], {
        shouldValidate: true,
      });
      setSelectedModule("");
    }
  };

  const handleRemoveModule = (moduleToRemove: string) => {
    setValue(
      "modules",
      currentModules.filter((module) => module !== moduleToRemove),
      { shouldValidate: true }
    );
  };

  const processSubmit = async (data: RoomFormValues) => {
    try {
      await onSubmit(data);
      if (mode === "create") {
        form.reset();
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleDelete = async () => {
    if (onDelete && initialData._id) {
      try {
        await onDelete(initialData._id);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  };

  const availableModules = modules
    .map((module) => module._id) // Using module ID as the value
    .filter((moduleId) => !currentModules.includes(moduleId));

  const getModuleName = (moduleId: string) => {
    const module = modules.find((m) => m._id === moduleId);
    return module ? module.name : moduleId;
  };

  const formTitle = mode === "create" ? t("createRoom") : t("editRoom");
  const submitButtonText =
    mode === "create" ? t("createRoomButton") : t("saveChanges");

  const translateError = (error: { message?: string } | undefined): string => {
    return error?.message ? t(error.message) : "";
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  // Theme-aware classes
  const themeClasses = {
    card: isDarkMode
      ? "bg-gray-900 text-white border-t-purple-500"
      : "bg-white text-gray-900 border-t-black",
    input: isDarkMode
      ? "bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
      : "bg-white border-gray-300 focus:ring-black",
    selectTrigger: isDarkMode
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300",
    selectContent: isDarkMode
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300",
    selectItem: isDarkMode
      ? "hover:bg-gray-700 focus:bg-gray-700"
      : "hover:bg-gray-100 focus:bg-gray-100",
    badge: isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50",
    button: {
      primary: isDarkMode
        ? "bg-purple-600 hover:bg-purple-700 text-white"
        : "bg-black hover:bg-gray-500 text-white",
      destructive: isDarkMode
        ? "bg-red-700 hover:bg-red-800"
        : "bg-red-600 hover:bg-red-700",
      outline: isDarkMode ? "border-gray-700 hover:bg-gray-700 text-white" : "",
    },
    text: {
      label: isDarkMode ? "text-gray-200" : "",
      description: isDarkMode ? "text-gray-400" : "text-gray-500",
    },
  };

  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto shadow-lg border-t-4 transition-colors duration-200",
        themeClasses.card
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn("flex items-center gap-2", themeClasses.text.label)}
          >
            {mode === "create" ? (
              <Plus className="h-5 w-5" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            <span>{formTitle}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={
                isDarkMode ? t("switchToLightMode") : t("switchToDarkMode")
              }
            ></Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isLoading}
              aria-label={t("close")}
              className={isDarkMode ? "text-gray-300 hover:text-white" : ""}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Form {...form}>
          <form onSubmit={handleSubmit(processSubmit)} className="space-y-5">
            {/* Room Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={cn("font-medium", themeClasses.text.label)}
                  >
                    {t("roomName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder={t("roomNamePlaceholder")}
                      className={cn("focus:ring-2", themeClasses.input)}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500">
                    {translateError(formState.errors.name)}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={cn("font-medium", themeClasses.text.label)}
                  >
                    {t("capacity")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={MIN_CAPACITY}
                      max={MAX_CAPACITY}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                      className={cn("focus:ring-2", themeClasses.input)}
                    />
                  </FormControl>
                  <FormDescription
                    className={cn(
                      "flex items-center gap-1",
                      themeClasses.text.description
                    )}
                  >
                    <Info className="h-4 w-4" />
                    {t("capacityDescription", {
                      min: MIN_CAPACITY,
                      max: MAX_CAPACITY,
                    })}
                  </FormDescription>
                  <FormMessage className="text-red-500">
                    {translateError(formState.errors.capacity)}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Room Type - Single checkbox: checked = theoretical, unchecked = practical */}
            <FormField
              control={form.control}
              name="theoretical"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    {/* Static label */}
                    <FormLabel
                      className={cn("font-medium", themeClasses.text.label)}
                    >
                      Type
                    </FormLabel>

                    {/* Checkbox with state label */}
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div
                            className={cn(
                              "h-5 w-5 border-2 rounded-sm flex items-center justify-center transition-colors",
                              field.value
                                ? "bg-purple-600 border-purple-600"
                                : "bg-white border-gray-400 dark:border-gray-600"
                            )}
                          >
                            {field.value && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-sm select-none",
                              field.value
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            {field.value ? "Lecture Hall" : "Lab"}
                          </span>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                      </FormControl>
                    </div>

                    {/* Dynamic description */}
                    <FormDescription
                      className={cn("text-sm", themeClasses.text.description)}
                    >
                      {field.value
                        ? "For lectures and presentations"
                        : "For hands-on activities and labs"}
                    </FormDescription>
                  </div>
                  <FormMessage className="text-red-500">
                    {translateError(formState.errors.theoretical)}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Modules
            <div className="space-y-3">
              <FormLabel className={cn("font-medium", themeClasses.text.label)}>
                {t("modules.title")}
              </FormLabel>

              {modulesError && (
                <p className="text-red-500 text-sm">
                  {t("errorLoadingModules")}
                </p>
              )}

              <div className="flex gap-2">
                <Select
                  value={selectedModule}
                  onValueChange={setSelectedModule}
                  disabled={
                    availableModules.length === 0 || isLoading || modulesLoading
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "flex-1 focus:ring-2 focus:ring-primary focus:outline-none",
                      themeClasses.selectTrigger
                    )}
                  >
                    <SelectValue
                      placeholder={
                        modulesLoading
                          ? t("loadingModules")
                          : availableModules.length === 0
                          ? t("noModulesAvailable")
                          : t("selectModule")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className={themeClasses.selectContent}>
                    {availableModules.map((moduleId) => (
                      <SelectItem
                        key={moduleId}
                        value={moduleId}
                        className={themeClasses.selectItem}
                      >
                        {getModuleName(moduleId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant={isDarkMode ? "outline" : "secondary"}
                  onClick={handleAddModule}
                  disabled={!selectedModule || isLoading || modulesLoading}
                  aria-label={t("addModule")}
                  className={cn(
                    "transition-colors",
                    isDarkMode
                      ? "border-gray-700 hover:bg-gray-700 text-white"
                      : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                  )}
                >
                  {t("add")}
                </Button>
              </div>

              {currentModules.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentModules.map((moduleId) => (
                    <Badge
                      key={moduleId}
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1 py-1 px-3 rounded-full border text-sm",
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-800",
                        themeClasses.badge
                      )}
                    >
                      {getModuleName(moduleId)}
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(moduleId)}
                        disabled={isLoading}
                        className={cn(
                          "transition-colors",
                          isDarkMode
                            ? "text-gray-400 hover:text-white"
                            : "text-gray-500 hover:text-red-600"
                        )}
                        aria-label={t("removeModule", {
                          module: getModuleName(moduleId),
                        })}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div> */}

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-3">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2",
                  themeClasses.button.primary
                )}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitButtonText}
              </Button>

              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center gap-2",
                    themeClasses.button.destructive
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("deleteRoomButton")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RoomForm;
