"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Practical } from "../practical.type";
import { useTheoreticals } from "@/app/theoretical/hooks/useTheoretical";

interface PracticalTableProps {
  practicals: Practical[];
  onEdit?: (practical: Practical) => void;
  onDelete?: (practicalId: string) => void;
  onView?: (practical: Practical) => void;
  isDeleting?: boolean; // Add this prop
}

const PracticalTable: React.FC<PracticalTableProps> = ({
  practicals,
  onEdit,
  onDelete,
  onView,
  isDeleting = false, // Add default value
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // Use the theoretical hook to get real data
  const { data: theoreticalArray = [], isLoading: isLoadingTheoreticals } =
    useTheoreticals();

  const MobileCardView = ({ practical }: { practical: Practical }) => {
    const selectedTheoretical = theoreticalArray.find(
      (theory) => theory._id === practical.theoretical._id
    );

    return (
      <div
        className={`p-4 shadow-md rounded-lg mb-4 md:hidden ${
          isRTL ? "text-right" : "text-left"
        } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {t("Practical")}: {practical._id}
          </h3>
          <div className={`flex ${isRTL ? "space-x-reverse" : ""} space-x-2`}>
            {onView && (
              <button
                onClick={() => onView(practical)}
                disabled={isDeleting}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t("View")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(practical)}
                disabled={isDeleting}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t("Edit")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(practical._id)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t("Delete")}
              >
                {isDeleting ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">{t("section")}:</span>{" "}
            {practical.CategoryCode}
          </div>
          <div>
            <span className="font-medium">{t("Capacity")}:</span>
            <span
              className={`ml-2 px-2 py-1 text-xs rounded ${
                practical.capacity <= 10
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  : practical.capacity <= 20
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              }`}
            >
              {practical.capacity}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const DesktopTableView = () => {
    return (
      <div
        className={`hidden md:block overflow-x-auto ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
        dir={i18n.dir()}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className={`px-6 py-3 text-${
                  isRTL ? "right" : "left"
                } text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
              >
                {t("Theoretical Code")}
              </th>
              <th
                className={`px-6 py-3 text-${
                  isRTL ? "right" : "left"
                } text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
              >
                {t("Category Code")}
              </th>
              <th
                className={`px-6 py-3 text-${
                  isRTL ? "right" : "left"
                } text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
              >
                {t("Capacity")}
              </th>

              {onView || onEdit || onDelete ? (
                <th
                  className={`px-6 py-3 text-${
                    isRTL ? "left" : "right"
                  } text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
                >
                  {t("Actions")}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {practicals.map((practical) => {
              const selectedTheoretical = theoreticalArray.find(
                (theory) => theory._id === practical.theoretical._id
              );

              return (
                <tr
                  key={practical._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {practical.theoretical.categoryCode}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {practical.CategoryCode}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        practical.capacity <= 10
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                          : practical.capacity <= 20
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      }`}
                    >
                      {practical.capacity}
                    </span>
                  </td>

                  {onView || onEdit || onDelete ? (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-${
                        isRTL ? "left" : "right"
                      }`}
                    >
                      <div
                        className={`flex ${
                          isRTL ? "justify-start" : "justify-end"
                        } ${isRTL ? "space-x-reverse" : ""} space-x-2`}
                      >
                        {onView && (
                          <button
                            onClick={() => onView(practical)}
                            disabled={isDeleting}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t("View")}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(practical)}
                            disabled={isDeleting}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t("Edit")}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(practical._id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t("Delete")}
                          >
                            {isDeleting ? (
                              <svg
                                className="animate-spin h-5 w-5"
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
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4" dir={i18n.dir()}>
      {practicals.length === 0 ? (
        <div
          className={`text-center py-8 text-gray-500 dark:text-gray-400 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("No practicals found")}
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="md:hidden space-y-4">
            {practicals.map((practical) => (
              <MobileCardView key={practical._id} practical={practical} />
            ))}
          </div>

          {/* Desktop View (Table) */}
          <DesktopTableView />
        </>
      )}
    </div>
  );
};

export default PracticalTable;
