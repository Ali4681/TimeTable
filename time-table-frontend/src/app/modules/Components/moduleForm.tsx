// Components/moduleForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Module, ModuleDto } from "../modules.type";
import { useModules } from "../hooks/useModules";
import { useDocTeach } from "@/app/docTeach/hooks/useDocTeach";

interface ModuleFormProps {
  onSuccess: (module: Module) => void;
  onCancel: () => void;
  initialData?: Module;
  mode: "create" | "edit";
  isOpen?: boolean;
  isRTL: boolean;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isRTL,
  mode,
  isOpen,
}) => {
  const { t } = useTranslation();
  const { createModule, updateModule } = useModules();
  const { fetchAll: docTeachQuery } = useDocTeach();

  // Form state
  const [formData, setFormData] = useState<ModuleDto>({
    name: "",
    code: "",
    hours: 3,
    years: 1,
    doctors: "",
    teacher: "",
    erolledStudents: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ModuleDto, string>>
  >({});

  // Dropdown states
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [isHoursDropdownOpen, setIsHoursDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Search states
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  const hoursOptions = [2, 3, 6];
  const yearOptions = [1, 2, 3, 4, 5];

  // Get doctors and teachers from the hook using the new DocTeach interface
  const docTeachData = docTeachQuery.data || [];
  const doctors = docTeachData.filter((item) => item.doctor.isDoctor === true);
  // Include both teachers and doctors in the teacher dropdown
  const teachers = docTeachData; // All items (both doctors and teachers)

  // Filter functions for search
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.doctor.name.toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.doctor.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        hours: initialData.hours,
        years: initialData.years,
        doctors: initialData.doctorsId._id,
        teacher: initialData.teacherId._id,
        erolledStudents: initialData.erolledStudents,
      });
    }
  }, [initialData, mode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDoctorDropdownOpen(false);
      setIsTeacherDropdownOpen(false);
      setIsHoursDropdownOpen(false);
      setIsYearDropdownOpen(false);
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  // Clear search terms when dropdowns close
  useEffect(() => {
    if (!isDoctorDropdownOpen) {
      setDoctorSearchTerm("");
    }
  }, [isDoctorDropdownOpen]);

  useEffect(() => {
    if (!isTeacherDropdownOpen) {
      setTeacherSearchTerm("");
    }
  }, [isTeacherDropdownOpen]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ModuleDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("Module name is required");
    }

    if (!formData.code.trim()) {
      newErrors.code = t("Module code is required");
    }

    if (!hoursOptions.includes(formData.hours)) {
      newErrors.hours = t("Please select valid hours");
    }

    if (!yearOptions.includes(formData.years)) {
      newErrors.years = t("Please select valid year");
    }

    if (!formData.doctors.trim()) {
      newErrors.doctors = t("Doctor selection is required");
    }

    if (!formData.teacher.trim()) {
      newErrors.teacher = t("Teacher selection is required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ModuleDto]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle dropdown selections
  const handleHoursSelect = (hours: number) => {
    setFormData((prev) => ({ ...prev, hours }));
    setIsHoursDropdownOpen(false);
    if (errors.hours) {
      setErrors((prev) => ({ ...prev, hours: undefined }));
    }
  };

  const handleYearSelect = (year: number) => {
    setFormData((prev) => ({ ...prev, years: year }));
    setIsYearDropdownOpen(false);
    if (errors.years) {
      setErrors((prev) => ({ ...prev, years: undefined }));
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setFormData((prev) => ({ ...prev, doctors: doctorId }));
    setIsDoctorDropdownOpen(false);
    setDoctorSearchTerm("");
    if (errors.doctors) {
      setErrors((prev) => ({ ...prev, doctors: undefined }));
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setFormData((prev) => ({ ...prev, teacher: teacherId }));
    setIsTeacherDropdownOpen(false);
    setTeacherSearchTerm("");
    if (errors.teacher) {
      setErrors((prev) => ({ ...prev, teacher: undefined }));
    }
  };

  // Search input handlers
  const handleDoctorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setDoctorSearchTerm(e.target.value);
  };

  const handleTeacherSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setTeacherSearchTerm(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("Please fix the errors in the form"));
      return;
    }

    setIsSubmitting(true);

    try {
      let result: Module;

      if (mode === "edit" && initialData && initialData._id) {
        // Validate ObjectId format before sending
        if (!/^[0-9a-fA-F]{24}$/.test(initialData._id)) {
          throw new Error("Invalid module ID format");
        }
        result = await updateModule({
          id: initialData._id,
          moduleData: formData,
        });
        toast.success(t("Module updated successfully"));
      } else {
        result = await createModule(formData);
        toast.success(t("Module created successfully"));
      }

      onSuccess(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`${t("Failed to save module")}: ${errorMessage}`);
      console.error("Failed to save module:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && isOpen !== undefined) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "edit" ? t("Edit Module") : t("Create New Module")}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Module Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Module Name")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("Enter module name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Module Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Module Code")} *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("Enter module code")}
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            {/* Hours Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Hours")} *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHoursDropdownOpen(!isHoursDropdownOpen);
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center ${
                    errors.hours ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span>{formData.hours}</span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                {isHoursDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    {hoursOptions.map((hours) => (
                      <button
                        key={`hours-${hours}`}
                        type="button"
                        onClick={() => handleHoursSelect(hours)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white transition-colors"
                      >
                        {hours}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.hours && (
                <p className="text-red-500 text-sm mt-1">{errors.hours}</p>
              )}
            </div>

            {/* Student count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Students")} *
              </label>
              <input
                type="number"
                name="erolledStudents"
                value={formData.erolledStudents}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.erolledStudents ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("Enter Students Count ")}
              />
              {errors.erolledStudents && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.erolledStudents}
                </p>
              )}
            </div>

            {/* Year Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Year")} *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsYearDropdownOpen(!isYearDropdownOpen);
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center ${
                    errors.years ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span>
                    {t("Year")} {formData.years}
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                {isYearDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    {yearOptions.map((year) => (
                      <button
                        key={`year-${year}`}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white transition-colors"
                      >
                        {t("Year")} {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.years && (
                <p className="text-red-500 text-sm mt-1">{errors.years}</p>
              )}
            </div>

            {/* Doctor Dropdown with Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Doctor")} *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDoctorDropdownOpen(!isDoctorDropdownOpen);
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center ${
                    errors.doctors ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span>
                    {formData.doctors
                      ? doctors.find((d) => d.doctor._id === formData.doctors)
                          ?.doctor.name || t("Select a doctor")
                      : t("Select a doctor")}
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                {isDoctorDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={doctorSearchTerm}
                          onChange={handleDoctorSearch}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={t("Search doctors...")}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor: any) => (
                          <button
                            key={`doctor-${doctor.doctor._id}`}
                            type="button"
                            onClick={() =>
                              handleDoctorSelect(doctor.doctor._id)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white transition-colors"
                          >
                            {doctor.doctor.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {doctorSearchTerm
                            ? t("No doctors found")
                            : t("No doctors available")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.doctors && (
                <p className="text-red-500 text-sm mt-1">{errors.doctors}</p>
              )}
            </div>

            {/* Teacher Dropdown with Search (includes both doctors and teachers) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Teacher")} *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTeacherDropdownOpen(!isTeacherDropdownOpen);
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center ${
                    errors.teacher ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span>
                    {formData.teacher
                      ? teachers.find((t) => t.doctor._id === formData.teacher)
                          ?.doctor.name || t("Select a teacher")
                      : t("Select a teacher")}
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                {isTeacherDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={teacherSearchTerm}
                          onChange={handleTeacherSearch}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={t("Search teachers and doctors...")}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher: any) => (
                          <button
                            key={`teacher-${teacher.doctor._id}`}
                            type="button"
                            onClick={() =>
                              handleTeacherSelect(teacher.doctor._id)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white transition-colors flex items-center justify-between"
                          >
                            <span>{teacher.doctor.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {teacher.doctor.isDoctor
                                ? t("Doctor")
                                : t("Teacher")}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {teacherSearchTerm
                            ? t("No teachers found")
                            : t("No teachers available")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.teacher && (
                <p className="text-red-500 text-sm mt-1">{errors.teacher}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isSubmitting
                  ? t("Saving...")
                  : mode === "edit"
                  ? t("Update Module")
                  : t("Create Module")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleForm;
