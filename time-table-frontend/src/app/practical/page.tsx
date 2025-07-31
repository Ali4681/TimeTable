"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import PracticalButton from "./Components/PracticalButton";
import PracticalForm from "./Components/PracticalForm";
import PracticalTable from "./Components/PracticalCard";
import { toast } from "sonner";
import {
  usePracticals,
  useCreatePractical,
  useUpdatePractical,
  useDeletePractical,
} from "./hooks/usePractical";
import { Practical, PracticalDto } from "./practical.type";
import { Navbar } from "@/components/nav";

export default function PracticalPage() {
  const { t, i18n } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [currentPractical, setCurrentPractical] = useState<Practical | null>(
    null
  );

  // React Query hooks
  const { data: practicals = [], isLoading, error } = usePracticals();
  const createMutation = useCreatePractical();
  const updateMutation = useUpdatePractical();
  const deleteMutation = useDeletePractical();

  const handleFormSubmit = async (practical: PracticalDto) => {
    try {
      const practicalData: PracticalDto = {
        theoretical: practical.theoretical,
        CategoryCode: practical.CategoryCode,
        capacity: practical.capacity,
      };

      if (currentPractical) {
        // Update existing practical
        await updateMutation.mutateAsync({
          id: currentPractical._id,
          data: practicalData,
        });
        toast.success(t("Practical session updated successfully"));
      } else {
        // Create new practical
        await createMutation.mutateAsync(practicalData);
        toast.success(t("Practical session created successfully"));
      }

      setShowForm(false);
      setCurrentPractical(null);
    } catch (error) {
      console.error("Error saving practical:", error);
      toast.error(t("Failed to save practical session"));
    }
  };

  const handleDeletePractical = async (practicalId: string) => {
    try {
      await deleteMutation.mutateAsync(practicalId);
      toast.success(t("Practical session deleted successfully"));
    } catch (error) {
      console.error("Error deleting practical:", error);
      toast.error(t("Failed to delete practical session"));
    }
  };

  const handleEditButtonClick = (practical: Practical) => {
    setCurrentPractical(practical);
    setShowForm(true);
  };

  const handleAddNewPractical = () => {
    setCurrentPractical(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentPractical(null);
  };

  // Dynamically set the text direction based on language
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div
          className="container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16"
          dir={direction}
        >
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">
              {t("Loading practical sessions...")}
            </span>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div
          className="container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16"
          dir={direction}
        >
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-red-500 dark:text-red-400 text-center">
              <h2 className="text-xl font-semibold mb-2">
                {t("Error Loading Data")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {error.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t("Retry")}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        className="container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16"
        dir={direction}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold dark:text-white">
            {t("Practical Sessions")}
          </h1>
          {!showForm && (
            <PracticalButton
              onClick={handleAddNewPractical}
              disabled={createMutation.isPending}
            />
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <PracticalForm
                onSubmit={handleFormSubmit}
                mode={currentPractical ? "edit" : "create"}
                initialData={currentPractical || undefined}
                onClose={handleCloseForm}
                onDelete={currentPractical ? handleDeletePractical : undefined}
                isLoading={
                  currentPractical
                    ? updateMutation.isPending
                    : createMutation.isPending
                }
                isDeleting={deleteMutation.isPending}
              />
            </div>
          </div>
        )}

        {practicals.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <PracticalTable
              practicals={practicals}
              onEdit={handleEditButtonClick}
              onDelete={handleDeletePractical}
              isDeleting={deleteMutation.isPending}
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="mb-4">
              <button
                onClick={handleAddNewPractical}
                disabled={createMutation.isPending}
                className="inline-flex items-center px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-black hover:bg-gray-800 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("Adding...")}
                  </>
                ) : (
                  t("Add Your First Practical Session")
                )}
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {t(
                "No practical sessions found. Get started by adding your first session!"
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
