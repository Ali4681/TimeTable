"use client";

import { useState } from "react";
import DocTeachForm from "./Components/DocTeachForm";
import {
  DocTeachCard,
  DocTeachTableRow,
  DocTeachTableHeader,
  DocTeachListView,
} from "./Components/DocTeachCard";
import DocTeachButton from "./Components/DocTeachButton";
import { DocTeach, Doctor, DoctorWithHours } from "./docTeach.type";
import { useDocTeach } from "./hooks/useDocTeach";
import { useTheme } from "@/components/ThemeProvider";
import { Navbar } from "@/components/nav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocTeachPage() {
  const [showForm, setShowForm] = useState(false);
  const [editDocTeach, setEditDocTeach] = useState<DoctorWithHours | null>(
    null
  );
  const { isDarkMode } = useTheme();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    fetchAll: { data: docTeachers = [], isLoading, isError },
    create,
    update,
    remove,
  } = useDocTeach();

  // Separate doctors and teachers
  const doctors = docTeachers.filter((dt) => dt.doctor.isDoctor);
  const teachers = docTeachers.filter((dt) => !dt.doctor.isDoctor);

  // Pagination calculations for each tab
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalDoctorPages = Math.max(
    1,
    Math.ceil(doctors.length / itemsPerPage)
  );

  const indexOfLastTeacher = currentPage * itemsPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - itemsPerPage;
  const currentTeachers = teachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );
  const totalTeacherPages = Math.max(
    1,
    Math.ceil(teachers.length / itemsPerPage)
  );

  const handleAddDocTeach = async (newDocTeach: DocTeach) => {
    await create.mutateAsync(newDocTeach);
    setShowForm(false);
    setCurrentPage(1); // Reset to first page after adding
  };

  const handleEditDocTeach = async (updatedDocTeach: DocTeach) => {
    if (!updatedDocTeach?._id) return;
    await update.mutateAsync({
      id: updatedDocTeach._id,
      data: updatedDocTeach,
    });
    setShowForm(false);
    setEditDocTeach(null);
  };

  const handleDeleteDocTeach = async (id: string) => {
    await remove.mutateAsync(id);
    // Adjust page if last item on current page was deleted
    const currentItems =
      currentDoctors.length > 0 ? currentDoctors : currentTeachers;
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditDocTeach(null);
  };

  const getDoctorKey = (docTeach: DoctorWithHours, index: number) => {
    return (
      docTeach?.doctor?._id ||
      `doctor-${index}-${docTeach?.doctor?.name || "unknown"}`
    );
  };

  const paginate = (pageNumber: number, tab: "doctors" | "teachers") => {
    const totalPages = tab === "doctors" ? totalDoctorPages : totalTeacherPages;
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleNextPage = (tab: "doctors" | "teachers") => {
    const totalPages = tab === "doctors" ? totalDoctorPages : totalTeacherPages;
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = (tab: "doctors" | "teachers") => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const themeClasses = {
    container: isDarkMode
      ? "bg-[#111827] text-white min-h-screen"
      : "bg-gray-50 text-gray-900 min-h-screen",
    card: isDarkMode
      ? "bg-[#1F2937] border border-[#374151]"
      : "bg-white border border-gray-200",
    table: isDarkMode
      ? "bg-[#1F2937] border border-[#374151]"
      : "bg-white border border-gray-200",
    tableHeader: isDarkMode
      ? "bg-[#374151] border-b border-[#4B5563]"
      : "bg-gray-50 border-b border-gray-200",
    tableHeaderText: isDarkMode ? "text-gray-300" : "text-gray-500",
    tableRow: isDarkMode
      ? "border-b border-[#374151] hover:bg-[#374151] transition-colors"
      : "border-b border-gray-200 hover:bg-gray-50 transition-colors",
    tableRowEven: isDarkMode ? "bg-[#111827]" : "bg-white",
    tableRowOdd: isDarkMode ? "bg-[#1F2937]" : "bg-gray-50",
    emptyState: isDarkMode
      ? "bg-[#1F2937] border border-[#374151] text-gray-300"
      : "bg-white border border-gray-200 text-gray-500",
    button: isDarkMode
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white",
    loadingText: isDarkMode ? "text-gray-300" : "text-gray-600",
    errorText: isDarkMode ? "text-red-400" : "text-red-600",
    modalOverlay: "bg-black/60 backdrop-blur-sm",
    titleText: isDarkMode ? "text-white" : "text-black",
    iconColor: isDarkMode ? "text-gray-400" : "text-gray-400",
    paginationButton: isDarkMode
      ? "border border-[#374151] text-gray-300 hover:bg-[#374151]"
      : "border border-gray-300 text-gray-700 hover:bg-gray-100",
    paginationActive: isDarkMode
      ? "bg-blue-600 text-white"
      : "bg-blue-600 text-white",
    paginationDisabled: isDarkMode
      ? "border border-[#374151] text-[#4B5563] cursor-not-allowed"
      : "border border-gray-300 text-gray-400 cursor-not-allowed",
    tabTrigger: isDarkMode
      ? "data-[state=active]:bg-[#343D4E] data-[state=active]:text-white"
      : "data-[state=active]:bg-white data-[state=active]:text-gray-900",
  };

  const PaginationControls = ({
    totalPages,
    tab,
  }: {
    totalPages: number;
    tab: "doctors" | "teachers";
  }) => (
    <div className="flex items-center justify-center mt-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePrevPage(tab)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? themeClasses.paginationDisabled
              : themeClasses.paginationButton
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number, tab)}
            className={`px-3 py-1 rounded-md text-sm min-w-[36px] ${
              currentPage === number
                ? themeClasses.paginationActive
                : themeClasses.paginationButton
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handleNextPage(tab)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? themeClasses.paginationDisabled
              : themeClasses.paginationButton
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div
        className={`${themeClasses.container} transition-colors duration-200`}
      >
        <div className="space-y-6 p-4 max-w-7xl mx-auto mt-14">
          <div className="flex justify-between items-center">
            <h1 className={`text-3xl font-bold ${themeClasses.titleText}`}>
              Doctor Teacher Management
            </h1>
            <DocTeachButton
              onClick={() => {
                setEditDocTeach(null);
                setShowForm(true);
              }}
            />
          </div>

          {showForm && (
            <div
              className={`fixed inset-0 ${themeClasses.modalOverlay} flex items-center justify-center p-4 z-50`}
            >
              <div className="w-full max-w-4xl">
                <DocTeachForm
                  onSubmit={(docTeach) =>
                    editDocTeach
                      ? handleEditDocTeach(docTeach)
                      : handleAddDocTeach(docTeach)
                  }
                  onDelete={
                    editDocTeach?.doctor?._id
                      ? () => {
                          handleDeleteDocTeach(editDocTeach.doctor._id);
                          handleFormClose();
                        }
                      : undefined
                  }
                  initialData={editDocTeach?.doctor ? editDocTeach : undefined}
                  mode={editDocTeach ? "edit" : "create"}
                  onClose={handleFormClose}
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className={`text-center py-16 ${themeClasses.loadingText}`}>
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg">Loading...</span>
              </div>
            </div>
          ) : isError ? (
            <div className={`text-center py-16 ${themeClasses.errorText}`}>
              <div className="inline-flex items-center space-x-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg">Failed to load data</span>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="doctors" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="doctors"
                  className={`${themeClasses.tabTrigger} relative transition-all duration-200 ease-in-out rounded-md font-medium text-sm px-6 py-3 group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 data-[state=active]:bg-[#DBFCE7] data-[state=active]:text-green-800 data-[state=active]:shadow-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-green-300`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Doctors ({doctors.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="teachers"
                  className={`${themeClasses.tabTrigger} relative transition-all duration-200 ease-in-out rounded-md font-medium text-sm px-6 py-3 group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 data-[state=active]:bg-[#F3E8FF] data-[state=active]:text-purple-800 data-[state=active]:shadow-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-purple-300`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Teachers ({teachers.length})
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="doctors"
                className="transition-opacity duration-200 ease-in-out"
              >
                <div className="lg:hidden space-y-4">
                  {currentDoctors.length === 0 ? (
                    <div
                      className={`${themeClasses.emptyState} rounded-lg shadow-md p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        No doctors found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please adjust your search criteria or add a new doctor
                      </p>
                    </div>
                  ) : (
                    currentDoctors.map((docTeach, index) => (
                      <div
                        key={getDoctorKey(docTeach, index)}
                        className="transition-all duration-200 hover:shadow-lg"
                      >
                        <DocTeachCard
                          docTeach={docTeach}
                          onEdit={() => {
                            setEditDocTeach(docTeach);
                            setShowForm(true);
                          }}
                          onDelete={() => {
                            if (docTeach?.doctor?._id) {
                              handleDeleteDocTeach(docTeach.doctor._id);
                            }
                          }}
                        />
                      </div>
                    ))
                  )}
                  {doctors.length > 0 && (
                    <div className="mt-8">
                      <PaginationControls
                        totalPages={totalDoctorPages}
                        tab="doctors"
                      />
                    </div>
                  )}
                </div>

                <div className="hidden lg:block">
                  {currentDoctors.length === 0 ? (
                    <div
                      className={`${themeClasses.emptyState} rounded-lg shadow-md p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        No doctors found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please adjust your search criteria or add a new doctor
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${themeClasses.table} rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <DocTeachTableHeader />
                            <tbody
                              className={`divide-y ${
                                isDarkMode
                                  ? "divide-gray-700"
                                  : "divide-gray-200"
                              }`}
                            >
                              {currentDoctors.map((docTeach, index) => (
                                <tr
                                  key={getDoctorKey(docTeach, index)}
                                  className={`${themeClasses.tableRow} ${
                                    index % 2 === 0
                                      ? `${themeClasses.tableRowEven} bg-white dark:bg-gray-800`
                                      : `${themeClasses.tableRowOdd} bg-gray-50 dark:bg-gray-900`
                                  } transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                  <DocTeachTableRow
                                    docTeach={docTeach}
                                    onEdit={() => {
                                      setEditDocTeach(docTeach);
                                      setShowForm(true);
                                    }}
                                    onDelete={() => {
                                      if (docTeach?.doctor?._id) {
                                        handleDeleteDocTeach(
                                          docTeach.doctor._id
                                        );
                                      }
                                    }}
                                  />
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mt-8">
                        <PaginationControls
                          totalPages={totalDoctorPages}
                          tab="doctors"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="teachers"
                className="transition-opacity duration-200 ease-in-out"
              >
                <div className="lg:hidden space-y-4">
                  {currentTeachers.length === 0 ? (
                    <div
                      className={`${themeClasses.emptyState} rounded-lg shadow-md p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        No teachers found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please adjust your search criteria or add a new teacher
                      </p>
                    </div>
                  ) : (
                    currentTeachers.map((docTeach, index) => (
                      <div
                        key={getDoctorKey(docTeach, index)}
                        className="transition-all duration-200 hover:shadow-lg"
                      >
                        <DocTeachCard
                          docTeach={docTeach}
                          onEdit={() => {
                            setEditDocTeach(docTeach);
                            setShowForm(true);
                          }}
                          onDelete={() => {
                            if (docTeach?.doctor?._id) {
                              handleDeleteDocTeach(docTeach.doctor._id);
                            }
                          }}
                        />
                      </div>
                    ))
                  )}
                  {teachers.length > 0 && (
                    <div className="mt-8">
                      <PaginationControls
                        totalPages={totalTeacherPages}
                        tab="teachers"
                      />
                    </div>
                  )}
                </div>

                <div className="hidden lg:block">
                  {currentTeachers.length === 0 ? (
                    <div
                      className={`${themeClasses.emptyState} rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 border border-emerald-200/50 dark:border-gray-700/50`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 dark:from-emerald-500/10 dark:to-teal-500/10"></div>
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-10 h-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          No teachers found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Try adjusting your search or add a new teacher
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${themeClasses.table} rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <DocTeachTableHeader />
                            <tbody
                              className={`divide-y ${
                                isDarkMode
                                  ? "divide-gray-700"
                                  : "divide-gray-200"
                              }`}
                            >
                              {currentTeachers.map((docTeach, index) => (
                                <tr
                                  key={getDoctorKey(docTeach, index)}
                                  className={`${themeClasses.tableRow} ${
                                    index % 2 === 0
                                      ? `${themeClasses.tableRowEven} bg-white dark:bg-gray-800`
                                      : `${themeClasses.tableRowOdd} bg-gray-50 dark:bg-gray-900`
                                  } transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                  <DocTeachTableRow
                                    docTeach={docTeach}
                                    onEdit={() => {
                                      setEditDocTeach(docTeach);
                                      setShowForm(true);
                                    }}
                                    onDelete={() => {
                                      if (docTeach?.doctor?._id) {
                                        handleDeleteDocTeach(
                                          docTeach.doctor._id
                                        );
                                      }
                                    }}
                                  />
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mt-8">
                        <PaginationControls
                          totalPages={totalTeacherPages}
                          tab="teachers"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
