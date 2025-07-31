"use client";

import { useState, useEffect, useMemo } from "react";
import { TheoreticalButton } from "./Components/TheoreticalButton";
import { TheoreticalForm } from "./Components/TheoreticalForm";
import {
  TheoreticalCard,
  TheoreticalTable,
} from "./Components/TheoreticalCard";
import { toast } from "sonner";
import { Plus, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import {
  useTheoretical,
  useCreateTheoretical,
  useUpdateTheoretical,
  useDeleteTheoretical,
  useTheoreticals,
} from "./hooks/useTheoretical";
import { Theoretical, TheoreticalDto } from "./theoretical.type";
import { Navbar } from "@/components/nav";

// Import types - adjust paths as needed

// Type aliases for consistency with your existing code
type CreateTheoreticalDto = TheoreticalDto;
type UpdateTheoreticalDto = TheoreticalDto;

export default function TheoreticalPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const {
    data: theoreticals,
    isLoading,
    isError,
    error,
    refetch,
  } = useTheoreticals();
  const createMutation = useCreateTheoretical();
  const updateMutation = useUpdateTheoretical();
  const deleteMutation = useDeleteTheoretical();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const currentEditData = useMemo(
    () => theoreticals?.find((item) => item._id === editId),
    [editId, theoreticals]
  );

  const handleAddOrUpdateTheoretical = async (
    data: CreateTheoreticalDto | UpdateTheoreticalDto
  ) => {
    try {
      if (editId) {
        // Fix: Pass the correct structure for update mutation
        await updateMutation.mutateAsync({ id: editId, dto: data });
        toast.success(t("toast.moduleUpdated"));
      } else {
        await createMutation.mutateAsync(data as CreateTheoreticalDto);
        toast.success(t("toast.moduleAdded"));
      }
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("toast.operationFailed")
      );
    }
  };

  const handleEdit = (theoretical: Theoretical) => {
    setEditId(theoretical._id);
    setShowForm(true);
  };

  const handleDelete = async (theoretical: Theoretical) => {
    try {
      await deleteMutation.mutateAsync(theoretical._id);
      toast.success(t("toast.moduleDeleted"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("toast.deletionFailed")
      );
    }
  };

  const handleRetry = () => refetch();

  // Toast feedback for mutations - simplified approach
  useEffect(() => {
    if (createMutation.isPending) {
      toast.loading(t("toast.creating"));
    } else if (updateMutation.isPending) {
      toast.loading(t("toast.updating"));
    } else if (deleteMutation.isPending) {
      toast.loading(t("toast.deleting"));
    } else {
      toast.dismiss();
    }
  }, [
    createMutation.isPending,
    updateMutation.isPending,
    deleteMutation.isPending,
    t,
  ]);

  // Handle mutation errors
  useEffect(() => {
    if (createMutation.isError) {
      toast.error(
        createMutation.error instanceof Error
          ? createMutation.error.message
          : t("toast.createFailed")
      );
    }
  }, [createMutation.isError, createMutation.error, t]);

  useEffect(() => {
    if (updateMutation.isError) {
      toast.error(
        updateMutation.error instanceof Error
          ? updateMutation.error.message
          : t("toast.updateFailed")
      );
    }
  }, [updateMutation.isError, updateMutation.error, t]);

  useEffect(() => {
    if (deleteMutation.isError) {
      toast.error(
        deleteMutation.error instanceof Error
          ? deleteMutation.error.message
          : t("toast.deleteFailed")
      );
    }
  }, [deleteMutation.isError, deleteMutation.error, t]);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <Navbar />
      <div
        className="container mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen mt-16"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold dark:text-white">
            {t("theoretical.title")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/practical")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              {t("theoretical.goToPractical")}
            </button>
            <TheoreticalButton
              onClick={() => {
                setEditId(null);
                setShowForm(true);
              }}
              isRTL={isRTL}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <TheoreticalForm
                onSubmit={handleAddOrUpdateTheoretical}
                onDelete={
                  editId && currentEditData
                    ? () => handleDelete(currentEditData)
                    : undefined
                }
                initialData={currentEditData}
                onClose={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                isSubmitting={
                  createMutation.isPending || updateMutation.isPending
                }
                isDeleting={deleteMutation.isPending}
                isRTL={isRTL}
                isDarkMode={false}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 rounded-full border-gray-900 dark:border-gray-100 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("theoretical.loading")}
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-500 dark:text-red-300 mb-2">
              {t("theoretical.loadError")}
            </p>
            <p className="text-sm text-red-400 dark:text-red-400 mb-4">
              {error instanceof Error
                ? error.message
                : t("theoretical.unknownError")}
            </p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? t("theoretical.retrying") : t("theoretical.retry")}
            </button>
          </div>
        )}

        {/* Success */}
        {!isLoading && !isError && theoreticals && (
          <>
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {theoreticals.length === 0 ? (
                <EmptyState onAdd={() => setShowForm(true)} t={t} />
              ) : (
                theoreticals.map((theoretical) => (
                  <TheoreticalCard
                    key={theoretical._id}
                    theoretical={theoretical}
                    onEdit={() => handleEdit(theoretical)}
                    onDelete={() => handleDelete(theoretical)}
                    isRTL={isRTL}
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === theoretical._id
                    }
                  />
                ))
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              {theoreticals.length === 0 ? (
                <EmptyState onAdd={() => setShowForm(true)} t={t} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                  <TheoreticalTable
                    theoreticals={theoreticals}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isRTL={isRTL}
                    deletingId={
                      deleteMutation.isPending
                        ? deleteMutation.variables
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Status Indicator */}
        {isPending && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 rounded-full border-white" />
            <span className="text-sm">
              {createMutation.isPending && t("theoretical.creating")}
              {updateMutation.isPending && t("theoretical.updating")}
              {deleteMutation.isPending && t("theoretical.deleting")}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

const EmptyState = ({ onAdd, t }: { onAdd: () => void; t: any }) => (
  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <FlaskConical className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
    <p className="text-gray-500 dark:text-gray-400 mb-2">
      {t("theoretical.noModules")}
    </p>
    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
      {t("theoretical.noModulesDescription")}
    </p>
    <button
      onClick={onAdd}
      className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-md"
    >
      <Plus className="h-4 w-4 inline mr-1" />
      {t("theoretical.addFirstModule")}
    </button>
  </div>
);
