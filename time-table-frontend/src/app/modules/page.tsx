"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ModuleForm from "./Components/moduleForm";
import ModuleButton from "./Components/moduleButton";
import ModuleResponsiveView from "./Components/moduleCard";
import { Module } from "./modules.type";
import { useModules } from "./hooks/useModules"; // Using our custom backend hooks
import { toast } from "sonner";
import { Navbar } from "@/components/nav";

const ModulesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRTL = dir === "rtl";

  // --- State for UI control ---
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this configurable

  // --- Custom Backend Hooks ---
  const {
    modules,
    loading: isLoadingModules,
    error: modulesError,
    deleteModule,
  } = useModules();

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModules = modules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(modules.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  // --- Callbacks ---
  const handleEdit = useCallback(
    (id: string) => {
      const moduleToEdit = modules.find((m) => m._id == id);
      if (moduleToEdit) {
        setEditingModule(moduleToEdit);
        setShowForm(true);
      } else {
        toast.error(t("Module not found for editing."));
      }
    },
    [modules, t]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteModule(id);
        toast.success(t("Module deleted successfully"));
        // Reset to first page if the last item on the current page was deleted
        if (currentModules.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`${t("Failed to delete module")}: ${errorMessage}`);
        console.error("Failed to delete module:", error);
      }
    },
    [deleteModule, t, currentModules.length, currentPage]
  );

  const handleAddNewModule = useCallback(() => {
    setEditingModule(null); // Ensure form is in 'create' mode
    setShowForm(true);
  }, []);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingModule(null);
  }, []);

  const handleFormSuccess = useCallback(
    (module: Module) => {
      console.log(
        editingModule ? "Module updated:" : "Module created:",
        module
      );
      setShowForm(false);
      setEditingModule(null);
      toast.success(
        editingModule
          ? t("Module updated successfully")
          : t("Module created successfully")
      );
      // If creating a new module, go to the first page to see it
      if (!editingModule) {
        setCurrentPage(1);
      }
    },
    [editingModule, t]
  );

  // --- Render Logic ---
  if (isLoadingModules) {
    return (
      <>
        <Navbar />
        <div
          className={`container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16 flex flex-col justify-center items-center ${
            isRTL ? "text-right" : "text-left"
          }`}
          dir={dir}
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-lg dark:text-white">{t("Loading modules...")}</p>
        </div>
      </>
    );
  }

  if (modulesError) {
    return (
      <>
        <Navbar />
        <div
          className={`container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16 flex flex-col justify-center items-center ${
            isRTL ? "text-right" : "text-left"
          }`}
          dir={dir}
        >
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <p className="text-lg text-red-500 dark:text-red-400">
            {t("Error fetching modules")}: {modulesError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isRTL ? "ml-4" : "mr-4"
            }`}
          >
            {t("Retry")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className={`container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16 ${
          isRTL ? "text-right" : "text-left"
        }`}
        dir={dir}
      >
        <div
          className={`flex ${
            isRTL ? "flex-row-reverse" : "flex-row"
          } justify-between items-center mb-6`}
        >
          <h1 className="text-2xl font-semibold dark:text-white">
            {t("Modules Management")}
          </h1>
          {!showForm && (
            <ModuleButton onClick={handleAddNewModule} isRTL={isRTL} />
          )}
        </div>

        {showForm ? (
          <ModuleForm
            key={editingModule?._id || "create-module"}
            onSuccess={handleFormSuccess}
            initialData={editingModule || undefined}
            mode={editingModule ? "edit" : "create"}
            onCancel={handleFormCancel}
            isRTL={isRTL}
          />
        ) : modules.length > 0 ? (
          <>
            <ModuleResponsiveView
              modules={currentModules}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isRTL={isRTL}
            />

            {/* Pagination Controls - Centered */}
            <div className="mt-6 flex flex-col items-center">
              <div
                className={`flex ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                } items-center space-x-2`}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${
                    currentPage === 1
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {isRTL ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === number
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${
                    currentPage === totalPages
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {isRTL ? (
                    <ChevronLeft size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-800 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <div className="mb-4">
              <button
                onClick={handleAddNewModule}
                className={`inline-flex items-center px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-black hover:bg-gray-800 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-400 ${
                  isRTL ? "ml-4" : "mr-4"
                }`}
              >
                {t("Add Your First Module")}
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {t("No modules found. Get started by adding your first module!")}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ModulesPage;
