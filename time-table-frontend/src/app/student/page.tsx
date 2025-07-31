"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import StudentButton from "./Components/StudentButton";
import StudentForm from "./Components/StudentForm";
import StudentTable from "./Components/StudentCard";
import { Student } from "./student.type";
import {
  useStudents,
  useDeleteStudent,
  useStudent,
  useStudentModules,
} from "./hooks/useStudent";
import { Navbar } from "@/components/nav";

const StudentPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: students = [], isLoading, error } = useStudents();
  const deleteStudentMutation = useDeleteStudent();

  const [showForm, setShowForm] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | undefined>();
  const [editingStudentId, setEditingStudentId] = useState<
    string | undefined
  >();

  const { data: detailedStudent, isLoading: isLoadingStudent } = useStudent(
    editingStudentId || "",
    !!editingStudentId
  );

  const { data: studentModules, isLoading: isLoadingModules } =
    useStudentModules(editingStudentId || "", !!editingStudentId);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(students.length / itemsPerPage));

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm(t("confirm.deleteStudent"))) return;

    try {
      await deleteStudentMutation.mutateAsync(id);
      toast.success(t("toast.studentDeleted"));

      if (currentStudent?._id === id) {
        handleCloseForm();
      }

      // Reset to first page if the last item on the current page was deleted
      if (currentStudents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student._id);
    setCurrentStudent(student);
    setShowForm(true);
  };

  const handleAddStudent = () => {
    setEditingStudentId(undefined);
    setCurrentStudent(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentStudent(undefined);
    setEditingStudentId(undefined);
  };

  const getStudentForEdit = (): Student | undefined => {
    if (!currentStudent) return undefined;

    if (!detailedStudent) {
      return currentStudent;
    }

    return {
      ...detailedStudent,
      modules: studentModules || [],
    };
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    // When creating a new student, go to first page to see it
    if (!currentStudent) {
      setCurrentPage(1);
    }
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 md:p-6 space-y-6 dark:bg-gray-900 min-h-screen mt-12">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 md:p-6 space-y-6 dark:bg-gray-900 min-h-screen mt-12">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 dark:text-red-400 text-center">
              <h2 className="text-xl font-semibold mb-2">
                {t("error.loadingFailed")}
              </h2>
              <p>
                {error instanceof Error ? error.message : t("error.unknown")}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="container mx-auto p-4 md:p-6 space-y-6 dark:bg-gray-900 min-h-screen mt-12"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div
          className={`flex ${
            isRTL ? "flex-row-reverse" : ""
          } justify-between items-center`}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("studentManagement.title")}
          </h1>
          <StudentButton onClick={handleAddStudent} darkMode>
            {t("studentManagement.addStudent")}
          </StudentButton>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50">
            {editingStudentId && (isLoadingStudent || isLoadingModules) ? (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                  <span className="text-gray-900 dark:text-white">
                    {t("loading.studentDetails") ||
                      "Loading student details..."}
                  </span>
                </div>
              </div>
            ) : (
              <StudentForm
                onClose={handleCloseForm}
                initialData={getStudentForEdit()}
                mode={currentStudent ? "edit" : "create"}
                onSuccess={handleFormSuccess}
              />
            )}
          </div>
        )}

        {students.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <StudentButton onClick={handleAddStudent} darkMode>
              {t("studentManagement.addFirstStudent")}
            </StudentButton>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {t("studentManagement.noStudents")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <StudentTable
                students={currentStudents}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                isLoading={deleteStudentMutation.isPending}
                isRTL={isRTL}
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center mt-6">
              <div
                className={`flex ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                } items-center gap-2`}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md border ${
                    currentPage === 1
                      ? "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-label={t("pagination.previous")}
                >
                  {isRTL ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md text-sm min-w-[36px] ${
                        currentPage === number
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md border ${
                    currentPage === totalPages
                      ? "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-label={t("pagination.next")}
                >
                  {isRTL ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StudentPage;
