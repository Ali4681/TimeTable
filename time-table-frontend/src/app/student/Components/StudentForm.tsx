"use client";

import {
  AlertCircle,
  BookMarked,
  BookOpen,
  Brain,
  Calendar,
  Check,
  Code,
  Dna,
  FlaskConical,
  Landmark,
  Layers,
  LineChart,
  Palette,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Select, { MultiValueGenericProps, OptionProps } from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "sonner";

import { useModules } from "@/app/modules/hooks/useModules";
import {
  useCreateStudent,
  useDeleteStudent,
  useRegisterToModule,
  useUnregisterFromModule,
  useUpdateStudent,
} from "../hooks/useStudent";
import { Student, StudentDto, Module } from "../student.type";

interface StudentFormProps {
  onClose: () => void;
  initialData?: Student;
  mode?: "create" | "edit";
  onSuccess?: () => void; // Add this line
}

interface ModuleOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface YearOption {
  value: string;
  label: string;
  status: {
    label: string;
    color: string;
  };
}

// Internal form state that uses string arrays for module IDs
interface StudentFormData {
  _id?: string;
  name: string;
  years: string;
  phoneNumber: string;
  moduleIds: string[]; // Array of module IDs for form handling
}

const StudentForm: React.FC<StudentFormProps> = ({
  onClose,
  initialData,
  mode = "create",
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isDarkMode = document.documentElement.classList.contains("dark");

  // TanStack Query hooks
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const registerToModuleMutation = useRegisterToModule();
  const unregisterFromModuleMutation = useUnregisterFromModule();

  // Modules data
  const { modules, loading: modulesLoading } = useModules();

  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    years: "",
    phoneNumber: "",
    moduleIds: [],
  });

  useEffect(() => {
    console.log("sadasda: ", formData);
  }, [formData]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Loading states from mutations
  const isSubmitting =
    createStudentMutation.isPending || updateStudentMutation.isPending;
  const isDeleting = deleteStudentMutation.isPending;
  const isLoading = isSubmitting || isDeleting;

  const yearOptions: YearOption[] = [
    {
      value: "1",
      label: t("years.year1"),
      status: {
        label: t("years.freshman"),
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      },
    },
    {
      value: "2",
      label: t("years.year2"),
      status: {
        label: t("years.sophomore"),
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      },
    },
    {
      value: "3",
      label: t("years.year3"),
      status: {
        label: t("years.junior"),
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
      },
    },
    {
      value: "4",
      label: t("years.year4"),
      status: {
        label: t("years.senior"),
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
      },
    },
    {
      value: "5",
      label: t("years.year5"),
      status: {
        label: t("years.graduate"),
        color:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
      },
    },
  ];
  const getAvailableModules = (
    allModules: Module[],
    currentModuleIds: string[]
  ): ModuleOption[] => {
    return allModules
      .filter((module) => !currentModuleIds.includes(module._id))
      .map((module) => ({
        value: module._id,
        label: module.name,
        icon: getModuleIcon(module.name),
      }));
  };
  // Map modules to module options
  const moduleOptions: ModuleOption[] = useMemo(() => {
    return modules.map((module) => ({
      value: module._id,
      label: module.name,
      icon: getModuleIcon(module.name),
    }));
  }, [modules]);
  const handleModuleChange = (selectedOptions: readonly ModuleOption[]) => {
    // Remove duplicates (just in case)
    const uniqueModuleIds = Array.from(
      new Set(selectedOptions.map((opt) => opt.value))
    );

    setFormData({
      ...formData,
      moduleIds: uniqueModuleIds,
    });

    if (validationErrors.modules) {
      setValidationErrors({ ...validationErrors, modules: "" });
    }
  };

  function getModuleIcon(moduleName: string): React.ReactNode {
    const iconMap: Record<string, React.ReactNode> = {
      Mathematics: <Code className="h-5 w-5 text-blue-500" />,
      Physics: <FlaskConical className="h-5 w-5 text-purple-500" />,
      Biology: <Dna className="h-5 w-5 text-green-500" />,
      Chemistry: <FlaskConical className="h-5 w-5 text-yellow-500" />,
      Art: <Palette className="h-5 w-5 text-pink-500" />,
      Economics: <LineChart className="h-5 w-5 text-indigo-500" />,
      Literature: <BookMarked className="h-5 w-5 text-red-500" />,
      History: <Landmark className="h-5 w-5 text-amber-500" />,
      Psychology: <Brain className="h-5 w-5 text-teal-500" />,
    };

    return iconMap[moduleName] || <Layers className="h-5 w-5 text-gray-500" />;
  }

  useEffect(() => {
    if (initialData) {
      // Safely extract module IDs
      let moduleIds: string[] = [];

      if (Array.isArray(initialData.modules)) {
        moduleIds = initialData.modules
          .map((mod) => {
            // Handle different possible module reference formats:
            // 1. Nested { module: { _id: string } } (common in populated queries)
            if (mod?.module?._id) return mod.module._id;
            // 2. Direct _id reference
            if (mod?._id) return mod._id;
            // 3. String ID
            if (typeof mod === "string") return mod;
            return null;
          })
          .filter((id): id is string => id !== null);
      }

      setFormData({
        _id: initialData._id,
        name: initialData.name,
        years: initialData.years,
        phoneNumber: initialData.phoneNumber,
        moduleIds, // This should now contain the correct module IDs
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        years: "",
        phoneNumber: "",
        moduleIds: [],
      });
    }
  }, [initialData, modules]);

  // Also add some debugging to see what's happening
  useEffect(() => {
    console.log("Form data moduleIds:", formData.moduleIds);
    console.log("Initial data modules:", initialData?.modules);
  }, [formData.moduleIds, initialData?.modules]); // Also add some debugging to see what's happening
  useEffect(() => {
    console.log("Form data moduleIds:", formData.moduleIds);
    console.log("Initial data modules:", initialData?.modules);
  }, [formData.moduleIds, initialData?.modules]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      errors.name = t("validation.nameMinLength");
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = t("validation.phoneRequired");
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = t("validation.phoneInvalid");
    }

    if (!formData.years) {
      errors.year = t("validation.yearRequired");
    }

    if (!formData.moduleIds || formData.moduleIds.length === 0) {
      errors.modules = t("validation.modulesRequired");
    }

    // Check for duplicates (extra safety)
    const uniqueModuleIds = Array.from(new Set(formData.moduleIds));
    if (uniqueModuleIds.length !== formData.moduleIds.length) {
      errors.modules = t("validation.duplicateModules");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(t("validation.formErrors"));
      return;
    }

    try {
      const studentData: StudentDto = {
        name: formData.name,
        years: formData.years,
        phoneNumber: formData.phoneNumber,
        modules: formData.moduleIds,
      };

      let savedStudent: Student;
      if (mode === "edit" && formData._id) {
        // Update existing student
        savedStudent = await updateStudentMutation.mutateAsync({
          id: formData._id,
          data: studentData,
        });

        // Handle module changes for existing student - SAFE VERSION
        const currentModuleIds = Array.isArray(initialData?.modules)
          ? initialData.modules
              .map((sm) => {
                // Handle different possible module reference formats
                if (sm?.module?._id) return sm.module._id;
                if (sm?._id) return sm._id;
                if (typeof sm === "string") return sm;
                return null;
              })
              .filter((id): id is string => id !== null)
          : [];

        const newModuleIds = formData.moduleIds;

        // Find modules to unregister (in current but not in new)
        const modulesToUnregister = currentModuleIds.filter(
          (moduleId) => !newModuleIds.includes(moduleId)
        );

        // Find modules to register (in new but not in current)
        const modulesToRegister = newModuleIds.filter(
          (moduleId) => !currentModuleIds.includes(moduleId)
        );

        // Unregister removed modules - SAFE VERSION
        const unregisterPromises = modulesToUnregister.map(async (moduleId) => {
          try {
            if (!Array.isArray(initialData?.modules)) return;

            const studentModule = initialData.modules.find((sm) => {
              // Handle different possible module reference formats
              if (sm?.module?._id === moduleId) return true;
              if (sm?._id === moduleId) return true;
              if (typeof sm === "string" && sm === moduleId) return true;
              return false;
            });

            if (studentModule) {
              await unregisterFromModuleMutation.mutateAsync({
                studentId: savedStudent._id,
                moduleId:
                  typeof studentModule === "string"
                    ? studentModule
                    : studentModule._id || studentModule.module?._id,
              });
            }
          } catch (error) {
            console.error(`Failed to unregister module ${moduleId}:`, error);
          }
        });

        // Register new modules
        const registerPromises = modulesToRegister.map(async (moduleId) => {
          try {
            await registerToModuleMutation.mutateAsync({
              studentId: savedStudent._id,
              data: {
                moduleId,
                practicalId: moduleId,
              },
            });
          } catch (error) {
            console.error(`Failed to register module ${moduleId}:`, error);
          }
        });

        await Promise.allSettled([...unregisterPromises, ...registerPromises]);
      } else {
        // Create new student
        savedStudent = await createStudentMutation.mutateAsync(studentData);

        // Register selected modules for new student
        if (formData.moduleIds.length > 0) {
          const modulePromises = formData.moduleIds.map(async (moduleId) => {
            try {
              await registerToModuleMutation.mutateAsync({
                studentId: savedStudent._id,
                data: {
                  moduleId,
                  practicalId: moduleId, // Assuming practicalId is same as moduleId, adjust as needed
                },
              });
            } catch (error) {
              console.error(`Failed to register module ${moduleId}:`, error);
            }
          });

          await Promise.allSettled(modulePromises);
        }
      }

      toast.success(
        mode === "edit" ? t("toast.studentUpdated") : t("toast.studentCreated")
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error(t("toast.errorOccurred"));
    }
  };

  const handleDelete = async () => {
    if (!formData._id) return;

    try {
      await deleteStudentMutation.mutateAsync(formData._id);
      toast.success(t("toast.studentDeleted"));
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(t("toast.deleteFailed"));
    }
  };

  const animatedComponents = makeAnimated();

  const Option: React.FC<OptionProps<ModuleOption>> = ({
    children,
    ...props
  }) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="mr-3">{data.icon}</div>
        <div>
          <div className="font-medium dark:text-white">{data.label}</div>
        </div>
      </div>
    );
  };

  const MultiValueLabel: React.FC<MultiValueGenericProps<ModuleOption>> = ({
    children,
    ...props
  }) => {
    const { data } = props;
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
        {data.label}
      </span>
    );
  };

  const getInputStyles = (fieldName: string) => {
    return validationErrors[fieldName]
      ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30 focus:border-red-500 dark:focus:border-red-500"
      : "border-gray-300 dark:border-gray-700 focus:ring-blue-200 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-500";
  };

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      paddingLeft: "2.5rem",
      borderColor:
        validationErrors.year || validationErrors.modules
          ? "#ef4444"
          : state.isFocused
          ? "#3b82f6"
          : isDarkMode
          ? "#4b5563"
          : "#d1d5db",
      borderWidth: "1px",
      minHeight: "44px",
      boxShadow:
        validationErrors.year || validationErrors.modules
          ? "0 0 0 1px #ef4444"
          : state.isFocused
          ? "0 0 0 2px rgba(59, 130, 246, 0.2)"
          : "none",
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      borderRadius: "0.5rem",
      "&:hover": {
        borderColor:
          validationErrors.year || validationErrors.modules
            ? "#ef4444"
            : state.isFocused
            ? "#3b82f6"
            : isDarkMode
            ? "#6b7280"
            : "#9ca3af",
      },
      transition: "all 0.2s ease",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDarkMode
          ? "#374151"
          : "#e5e7eb"
        : state.isFocused
        ? isDarkMode
          ? "#374151"
          : "#f3f4f6"
        : isDarkMode
        ? "#1f2937"
        : "#fff",
      color: isDarkMode ? "#f3f4f6" : "#111827",
      "&:active": {
        backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "#111827",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      ":hover": {
        backgroundColor: isDarkMode ? "#4b5563" : "#d1d5db",
        color: isDarkMode ? "#f3f4f6" : "#111827",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "#111827",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "#111827",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-5 border-b dark:border-gray-800 flex justify-between items-center backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {mode === "edit" ? t("form.editStudent") : t("form.addStudent")}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label={t("form.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.fullName")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (validationErrors.name)
                      setValidationErrors({ ...validationErrors, name: "" });
                  }}
                  placeholder={t("form.enterStudentName")}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getInputStyles(
                    "name"
                  )} ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                />
                {validationErrors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.phoneNumber")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value });
                    if (validationErrors.phoneNumber)
                      setValidationErrors({
                        ...validationErrors,
                        phoneNumber: "",
                      });
                  }}
                  placeholder={t("form.enterPhoneNumber")}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getInputStyles(
                    "phoneNumber"
                  )} ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                />
                {validationErrors.phoneNumber && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {validationErrors.phoneNumber}
                </p>
              )}
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.academicYear")}
              </label>
              <div
                className={`relative rounded-lg shadow-sm ${
                  validationErrors.year ? "ring-1 ring-red-500" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <Select
                  options={yearOptions}
                  value={yearOptions.find(
                    (opt) => opt.value === formData.years
                  )}
                  onChange={(option) => {
                    setFormData({ ...formData, years: option?.value || "" });
                    if (validationErrors.year)
                      setValidationErrors({ ...validationErrors, year: "" });
                  }}
                  placeholder={t("form.selectYear")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                  isDisabled={isLoading}
                />
              </div>
              {validationErrors.year && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {validationErrors.year}
                </p>
              )}
            </div>

            {/* Modules Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.modules")}
              </label>
              <div
                className={`relative rounded-lg shadow-sm ${
                  validationErrors.modules ? "ring-1 ring-red-500" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <Select
                  isMulti
                  options={moduleOptions}
                  value={moduleOptions.filter((opt) =>
                    formData.moduleIds.includes(opt.value)
                  )}
                  onChange={handleModuleChange}
                  placeholder={t("form.selectModules")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  components={{
                    ...animatedComponents,
                    Option,
                    MultiValueLabel,
                  }}
                  styles={selectStyles}
                  isLoading={modulesLoading}
                  isDisabled={isLoading}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false} // Change this to false so selected options remain visible
                  // Remove the isOptionDisabled prop as it might interfere with editing
                />
              </div>
              {validationErrors.modules && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {validationErrors.modules}
                </p>
              )}

              {/* Show selected modules count */}
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {formData.moduleIds.length > 0 && (
                  <span>
                    {formData.moduleIds.length}{" "}
                    {formData.moduleIds.length === 1 ? "module" : "modules"}{" "}
                    selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            className={`flex ${
              isRTL ? "flex-row-reverse" : ""
            } justify-between pt-5 border-t dark:border-gray-800`}
          >
            <div>
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`flex items-center px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRTL ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Trash2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {isDeleting ? t("form.deleting") : t("form.deleteStudent")}
                </button>
              )}
            </div>
            <div
              className={`flex space-x-3 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors dark:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center px-5 py-2.5 bg-black dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-900 transition-colors font-medium shadow-sm disabled:cursor-not-allowed ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className={`animate-spin h-4 w-4 text-white ${
                        isRTL ? "ml-2" : "mr-2"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                    {t("form.processing")}
                  </>
                ) : mode === "edit" ? (
                  <>
                    <Check className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("form.updateStudent")}
                  </>
                ) : (
                  <>
                    <User className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("form.addStudent")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
