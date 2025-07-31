"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { BookOpen, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Theoretical, TheoreticalDto } from "../theoretical.type";

// Import the correct types

// Updated schema to match the backend DTO structure
const createSchema = z.object({
  categoryCode: z.string().min(1, "validation.categoryRequired"),
  capacity: z
    .number()
    .min(1, "validation.capacityMin")
    .max(500, "validation.capacityMax"),
});

const updateSchema = z.object({
  categoryCode: z.string().min(1, "validation.categoryRequired"),
  capacity: z
    .number()
    .min(1, "validation.capacityMin")
    .max(500, "validation.capacityMax"),
});

// Form data type that matches what the form actually handles
type FormData = TheoreticalDto;

interface TheoreticalFormProps {
  onClose?: () => void;
  onSubmit?: (data: TheoreticalDto) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: Theoretical;
  categoryOptions?: { value: string; label: string }[];
  isDarkMode?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  isRTL?: boolean;
}

export const TheoreticalForm: React.FC<TheoreticalFormProps> = ({
  onClose,
  onSubmit: externalOnSubmit,
  onDelete: externalOnDelete,
  initialData,
  categoryOptions = [
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
    { value: "C3", label: "C3" },
    { value: "C4", label: "C4" },
  ],
  isDarkMode: propIsDarkMode,
  isSubmitting = false,
  isDeleting = false,
  isRTL = false,
}) => {
  const { t } = useTranslation();

  // Use prop isDarkMode if provided, otherwise check document
  const isDarkMode =
    propIsDarkMode ??
    (typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  const isEditing = !!initialData;
  const schema = isEditing ? updateSchema : createSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          categoryCode: initialData.categoryCode,
          capacity: initialData.capacity,
        }
      : {
          categoryCode: "",
          capacity: 1,
        },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Watch form values for validation feedback
  const watchedValues = watch();

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      if (externalOnSubmit) {
        await externalOnSubmit(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("root", {
        message: "form.submitError",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!initialData || !externalOnDelete) return;

    try {
      await externalOnDelete();
    } catch (error) {
      console.error("Delete error:", error);
      setError("root", {
        message: "form.deleteError",
      });
    }
  };

  // Theme styles
  const styles = {
    container: isDarkMode ? "bg-gray-800" : "bg-white",
    text: {
      primary: isDarkMode ? "text-white" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      error: isDarkMode ? "text-red-400" : "text-red-600",
      muted: isDarkMode ? "text-gray-400" : "text-gray-500",
    },
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    input: {
      background: isDarkMode ? "bg-gray-700" : "bg-white",
      disabled: isDarkMode ? "bg-gray-600" : "bg-gray-100",
      border: isDarkMode ? "border-gray-600" : "border-gray-300",
      focus: isDarkMode ? "focus:border-blue-400" : "focus:border-blue-500",
      error: "border-red-500",
    },
    button: {
      primary: isDarkMode
        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary: isDarkMode
        ? "bg-gray-600 hover:bg-gray-500 border-gray-600"
        : "bg-white hover:bg-gray-50 border-gray-300",
      danger: isDarkMode
        ? "bg-red-700 hover:bg-red-600"
        : "bg-red-600 hover:bg-red-700",
      cancel: isDarkMode
        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
        : "border-gray-300 hover:bg-gray-100 text-gray-700",
    },
    header: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    alert: isDarkMode
      ? "bg-red-900/20 border-red-700 text-red-300"
      : "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div
          className={cn(
            "rounded-xl shadow-2xl overflow-hidden border",
            styles.container,
            styles.border
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className={cn("p-6 border-b", styles.header, styles.border)}>
            <div className="flex justify-between items-center">
              <div
                className={cn(
                  "flex items-center",
                  isRTL ? "space-x-reverse space-x-3" : "space-x-3"
                )}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className={cn("text-xl font-bold", styles.text.primary)}>
                    {isEditing ? t("form.editModule") : t("form.newModule")}
                  </h2>
                  <p className={cn("text-sm", styles.text.muted)}>
                    {isEditing
                      ? t("form.editModuleDescription")
                      : t("form.newModuleDescription")}
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    styles.text.muted,
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={t("form.close")}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Error Message */}
            {errors.root && (
              <div
                className={cn(
                  "mb-6 p-4 rounded-lg border-l-4 flex items-start",
                  styles.alert
                )}
              >
                <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t("form.error")}</p>
                  <p className="text-sm mt-1">
                    {t(errors.root.message as string)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Category Code Field */}
              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    styles.text.secondary
                  )}
                >
                  {t("form.category")} <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="categoryCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={categoryOptions}
                      value={categoryOptions.find(
                        (o) => o.value === field.value
                      )}
                      onChange={(option) => field.onChange(option?.value || "")}
                      isDisabled={isSubmitting}
                      placeholder={t("form.categoryPlaceholder")}
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: isDarkMode ? "#374151" : "#fff",
                          borderColor: errors.categoryCode
                            ? "#ef4444"
                            : state.isFocused
                            ? isDarkMode
                              ? "#60a5fa"
                              : "#3b82f6"
                            : isDarkMode
                            ? "#4b5563"
                            : "#d1d5db",
                          boxShadow: state.isFocused
                            ? `0 0 0 1px ${isDarkMode ? "#60a5fa" : "#3b82f6"}`
                            : "none",
                          "&:hover": {
                            borderColor: errors.categoryCode
                              ? "#ef4444"
                              : isDarkMode
                              ? "#6b7280"
                              : "#9ca3af",
                          },
                          minHeight: "48px",
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: isDarkMode ? "#374151" : "#fff",
                          border: `1px solid ${
                            isDarkMode ? "#4b5563" : "#d1d5db"
                          }`,
                        }),
                        option: (base, { isFocused, isSelected }) => ({
                          ...base,
                          backgroundColor: isSelected
                            ? isDarkMode
                              ? "#3b82f6"
                              : "#3b82f6"
                            : isFocused
                            ? isDarkMode
                              ? "#4b5563"
                              : "#f3f4f6"
                            : "transparent",
                          color: isSelected
                            ? "#fff"
                            : isDarkMode
                            ? "#f3f4f6"
                            : "#111827",
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: isDarkMode ? "#f3f4f6" : "#111827",
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: isDarkMode ? "#9ca3af" : "#6b7280",
                        }),
                      }}
                    />
                  )}
                />
                {errors.categoryCode && (
                  <p className={cn("mt-2 text-sm", styles.text.error)}>
                    {t(errors.categoryCode.message as string)}
                  </p>
                )}
              </div>

              {/* Capacity Field */}
              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    styles.text.secondary
                  )}
                >
                  {t("form.capacity")} <span className="text-red-500">*</span>
                  <span className={cn("text-xs ml-2", styles.text.muted)}>
                    ({t("form.capacityRange")})
                  </span>
                </label>
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        {...field}
                        type="number"
                        min="1"
                        max="500"
                        placeholder={t("form.capacityPlaceholder")}
                        disabled={isSubmitting}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                        className={cn(
                          "w-full p-3 rounded-lg border transition-colors",
                          styles.input.background,
                          styles.text.primary,
                          errors.capacity
                            ? styles.input.error
                            : cn(styles.input.border, styles.input.focus),
                          "placeholder:text-gray-400",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      />
                      {watchedValues.capacity > 0 && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span
                            className={cn("text-sm", styles.text.muted)}
                          ></span>
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.capacity && (
                  <p className={cn("mt-2 text-sm", styles.text.error)}>
                    {t(errors.capacity.message as string)}
                  </p>
                )}
              </div>

              {/* Display ID for editing */}
              {isEditing && initialData && (
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      styles.text.secondary
                    )}
                  >
                    {t("form.moduleId")}
                  </label>
                  <div
                    className={cn(
                      "w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-600",
                      styles.border,
                      styles.text.muted
                    )}
                  >
                    {initialData._id}
                  </div>
                  <p className={cn("mt-1 text-xs", styles.text.muted)}>
                    {t("form.idCannotBeChanged")}
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div
              className={cn(
                "flex items-center justify-between pt-6 mt-6 border-t",
                styles.border
              )}
            >
              {/* Delete Button */}
              <div>
                {isEditing &&
                  externalOnDelete &&
                  (showDeleteConfirm ? (
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className={cn(
                          "px-4 py-2 text-sm rounded-lg border transition-colors",
                          styles.button.cancel
                        )}
                        disabled={isDeleting}
                      >
                        {t("form.cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          handleDelete();
                        }}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors",
                          isDeleting
                            ? "bg-red-400 cursor-not-allowed"
                            : styles.button.danger
                        )}
                        disabled={isDeleting}
                      >
                        {isDeleting && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {t("form.confirmDelete")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
                        isDarkMode
                          ? "text-red-400 hover:bg-red-900/30"
                          : "text-red-600 hover:bg-red-50"
                      )}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("form.delete")}
                    </button>
                  ))}
              </div>

              {/* Submit/Cancel Buttons */}
              <div className="flex items-center space-x-3">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      "px-6 py-2 text-sm rounded-lg border transition-colors",
                      styles.button.cancel
                    )}
                    disabled={isSubmitting || isDeleting}
                  >
                    {t("form.cancel")}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className={cn(
                    "flex items-center px-6 py-2 text-sm text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isSubmitting || isDeleting
                      ? "bg-gray-500 cursor-not-allowed"
                      : styles.button.primary
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isEditing ? t("form.updating") : t("form.creating")}
                    </>
                  ) : isEditing ? (
                    t("form.update")
                  ) : (
                    t("form.create")
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
