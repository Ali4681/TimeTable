"use client";

import React, { useEffect } from "react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Practical, PracticalDto } from "../practical.type";
import { useTheoreticals } from "@/app/theoretical/hooks/useTheoretical";

// Type for our select options
type SelectOption = {
  value: string;
  label: string;
};

// Updated validation schema to match backend DTO
const practicalSchema = z.object({
  id: z.string().optional(), // ID is optional for create mode
  theoretical: z.string().min(1, "Please select a theoretical module"),
  CategoryCode: z.string().min(1, "Category code is required"), // Changed from sectionCode to CategoryCode
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity must not exceed 1000"), // Increased max limit
});

interface PracticalFormProps {
  onSubmit: (practical: PracticalDto) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  initialData?: Partial<Practical>;
  mode?: "create" | "edit";
  isLoading?: boolean; // Loading state for submit
  isDeleting?: boolean; // Loading state for delete
}

const PracticalForm: React.FC<PracticalFormProps> = ({
  onSubmit,
  onDelete,
  onClose,
  initialData,
  mode = "create",
  isLoading = false,
  isDeleting = false,
}) => {
  const { t, i18n } = useTranslation();
  const animatedComponents = makeAnimated();

  // Use the theoretical hook
  const { data: theoreticalArray = [], isLoading: isLoadingTheoreticals } =
    useTheoreticals();

  // Create select options from the fetched data
  const theoreticalOptions: SelectOption[] = theoreticalArray.map((theory) => ({
    value: theory._id,
    label: `${theory.categoryCode}`,
  }));

  const form = useForm<z.infer<typeof practicalSchema>>({
    resolver: zodResolver(practicalSchema),
    defaultValues: {
      id: "",
      theoretical: "",
      CategoryCode: "",
      capacity: 0,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData._id || "",
        theoretical: initialData.theoretical?._id || "",
        CategoryCode: initialData.CategoryCode,
        capacity: initialData.capacity,
      });
    } else {
      form.reset({
        id: "",
        theoretical: "",
        CategoryCode: "",
        capacity: 0,
      });
    }
  }, [initialData, form, theoreticalArray]);

  const handleSubmit = async (data: z.infer<typeof practicalSchema>) => {
    // Transform form data to match PracticalType
    const practicalData: PracticalDto = {
      theoretical: data.theoretical,
      CategoryCode: data.CategoryCode,
      capacity: data.capacity,
    };

    await onSubmit(practicalData);

    // Reset form only in create mode and after successful submission
    if (mode === "create" && !isLoading) {
      form.reset();
    }
  };

  const handleDelete = async () => {
    if (onDelete && initialData?._id) {
      await onDelete(initialData._id);
    }
  };

  // Handle form submission with loading states
  const onFormSubmit = form.handleSubmit(handleSubmit);

  // Prevent form interaction during loading
  const isFormDisabled = isLoading || isDeleting || isLoadingTheoreticals;

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isFormDisabled ? "#f9fafb" : "#ffffff",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: isFormDisabled ? "#d1d5db" : "#3b82f6",
      },
      minHeight: "40px",
      color: "#111827",
      cursor: isFormDisabled ? "not-allowed" : "default",
      opacity: isFormDisabled ? 0.6 : 1,
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#ffffff",
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "transparent",
      color: state.isSelected ? "white" : "#111827",
      cursor: isFormDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        backgroundColor: isFormDisabled ? "transparent" : "#f3f4f6",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#111827",
    }),
    input: (base: any) => ({
      ...base,
      color: "#111827",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#6b7280",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      cursor: isFormDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        color: isFormDisabled ? "#9ca3af" : "#111827",
      },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      cursor: isFormDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        color: isFormDisabled ? "#9ca3af" : "#111827",
      },
    }),
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg dark:border-gray-700"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          {mode === "create" ? (
            <Plus className="text-primary" />
          ) : (
            <RefreshCw className="text-primary" />
          )}
          {mode === "create" ? t("Create Practical") : t("Edit Practical")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose}
          disabled={isFormDisabled}
          aria-label={t("Close form")}
        >
          <X size={20} />
        </Button>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={onFormSubmit} className="space-y-4">
            {/* Theoretical Select */}
            <FormField
              control={form.control}
              name="theoretical"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Select Theoretical")}</FormLabel>
                  <FormControl>
                    <Controller
                      name="theoretical"
                      control={form.control}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <Select<SelectOption>
                          {...rest}
                          value={theoreticalOptions.find(
                            (option) => option.value === value
                          )}
                          onChange={(option) => {
                            if (!option || isFormDisabled) return;
                            onChange(option.value);

                            const selectedTheory = theoreticalArray.find(
                              (theory) => theory._id === option.value
                            );

                            if (selectedTheory) {
                              form.setValue(
                                "CategoryCode",
                                selectedTheory.categoryCode
                              );
                              form.setValue(
                                "capacity",
                                selectedTheory.capacity
                              );
                            }
                          }}
                          options={theoreticalOptions}
                          components={animatedComponents}
                          styles={customSelectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isMulti={false}
                          isDisabled={isFormDisabled}
                          placeholder={
                            isLoadingTheoreticals
                              ? t("Loading theoretical modules...")
                              : t("Select a theoretical module")
                          }
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Code */}
            <FormField
              control={form.control}
              name="CategoryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Category Code")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Auto-filled from theoretical selection")}
                      {...field}
                      disabled={isFormDisabled}
                      className="dark:border-gray-600 disabled:opacity-60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Capacity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("Enter capacity")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isFormDisabled}
                      className="dark:border-gray-600 disabled:opacity-60"
                      min="1"
                      max="1000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isFormDisabled}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? t("Creating...") : t("Updating...")}
                  </>
                ) : (
                  <>
                    {mode === "create"
                      ? t("Submit Practical")
                      : t("Update Practical")}
                  </>
                )}
              </Button>

              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full"
                  disabled={isFormDisabled}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Deleting...")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2" />
                      {t("Delete Practical")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PracticalForm;
