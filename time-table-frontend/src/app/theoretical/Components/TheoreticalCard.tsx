import React from "react";
import {
  Edit2,
  Trash2,
  BookOpen,
  Hash,
  Tag,
  Users,
  Plus,
  Clock,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Theoretical } from "../theoretical.type";
import { useDeleteTheoretical } from "../hooks/useTheoretical";

export const TheoreticalCard: React.FC<{
  theoretical: Theoretical;
  onEdit?: (theoretical: Theoretical) => void;
  onDelete?: (theoretical: Theoretical) => void;
  isRTL: boolean;
  isDeleting?: boolean; // أضف هذه الخاصية
}> = ({ theoretical, onEdit }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Use the delete mutation hook
  const deleteTheoretical = useDeleteTheoretical();

  const handleDelete = () => {
    if (window.confirm(t("theoretical.confirmDelete"))) {
      deleteTheoretical.mutate(theoretical._id);
    }
  };

  const isDeleting = deleteTheoretical.isPending;

  return (
    <div
      className="group relative p-6 bg-white dark:bg-[#101724] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div
          className={`h-2 w-2 rounded-full ${
            theoretical.capacity > 50
              ? "bg-green-400 dark:bg-green-500"
              : theoretical.capacity > 20
              ? "bg-yellow-400 dark:bg-yellow-500"
              : "bg-red-400 dark:bg-red-500"
          }`}
        />
      </div>

      {/* Action buttons */}
      <div
        className={`flex justify-between items-start mb-6 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1" />
        <div
          className={`opacity-0 group-hover:opacity-100 transition-all duration-300 flex ${
            isRTL ? "flex-row-reverse space-x-reverse" : ""
          } space-x-2`}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(theoretical)}
              disabled={isDeleting}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t("theoretical.edit")}
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t("theoretical.delete")}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Card header */}
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className={`flex items-center mb-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={isRTL ? "mr-3" : "ml-3"}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("theoretical.module")} {theoretical._id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("theoretical.theoreticalModule")}
            </p>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="space-y-4 relative z-10">
        {/* Module ID */}
        {/* <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div className={isRTL ? "mr-3 text-right" : "ml-3 text-left"}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t("theoretical.moduleId")}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {theoretical._id}
            </p>
          </div>
        </div> */}

        {/* Section */}
        {/* <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className={isRTL ? "mr-3 text-right" : "ml-3 text-left"}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t("theoretical.section")}
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
              {theoretical.categoryCode}
            </span>
          </div>
        </div> */}

        {/* Capacity */}
        <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className={isRTL ? "mr-3 text-right" : "ml-3 text-left"}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t("theoretical.capacity")}
            </p>
            <div
              className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <p
                className={`text-lg font-bold text-gray-800 dark:text-gray-200 ${
                  isRTL ? "ml-2" : "mr-2"
                }`}
              >
                {theoretical.capacity}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("theoretical.students")}
              </span>
            </div>
            {/* Capacity indicator bar */}
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  theoretical.capacity > 50
                    ? "bg-green-500"
                    : theoretical.capacity > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    (theoretical.capacity / 100) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional info section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Clock className="h-3 w-3" />
              <span className={isRTL ? "mr-1" : "ml-1"}>
                {t("theoretical.lastUpdated")}
              </span>
            </div>
            <div
              className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span className={isRTL ? "mr-1" : "ml-1"}>
                {new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("theoretical.deleting")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const TheoreticalTable: React.FC<{
  theoreticals: Theoretical[];
  isRTL: boolean;
  onAddNew?: () => void;
  isDeleting?: boolean; // أضف هذه الخاصية

  onEdit?: (theoretical: Theoretical) => void;
  onDelete?: (theoretical: Theoretical) => void;
  deletingId?: string;
}> = ({
  theoreticals = [],
  onEdit,
  onDelete,
  deletingId,
  onAddNew,
  isDeleting,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Use the delete mutation hook
  const deleteTheoretical = useDeleteTheoretical();

  const handleDelete = (theoretical: Theoretical) => {
    if (window.confirm(t("theoretical.confirmDelete"))) {
      deleteTheoretical.mutate(theoretical._id);
    }
  };

  if (!theoreticals || theoreticals.length === 0) {
    return (
      <div
        className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="mb-6">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t("theoretical.noModules")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t("theoretical.noModulesDescription")}
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className={isRTL ? "mr-2" : "ml-2"}>
              {t("theoretical.addNew")}
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <tr>
            {/* Module Column Header - Centered */}
            {/* <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
              <div className="flex items-center justify-center">
                <BookOpen className="h-4 w-4 mr-2" />
                {t("theoretical.module")}
              </div>
            </th> */}

            {/* ID Column Header - Centered */}
            {/* <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
              <div className="flex items-center justify-center">
                <Hash className="h-4 w-4 mr-2" />
                {t("theoretical._id")}
              </div>
            </th> */}

            {/* Section Column Header - Centered */}
            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
              <div className="flex items-center justify-center">
                <Tag className="h-4 w-4 mr-2" />
                {t("theoretical.section")}
              </div>
            </th>

            {/* Capacity Column Header - Centered */}
            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
              <div className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                {t("theoretical.capacity")}
              </div>
            </th>

            {/* Actions Column Header - Centered */}
            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
              {t("theoretical.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#101724] divide-y divide-gray-200 dark:divide-gray-700">
          {theoreticals.map((theoretical, index) => {
            const isDeleting =
              deleteTheoretical.isPending &&
              deleteTheoretical.variables === theoretical._id;

            return (
              <tr
                key={theoretical._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-[#101724]"
                    : "bg-gray-50/50 dark:bg-gray-800/20"
                } ${isDeleting ? "opacity-50" : ""}`}
              >
                {/* Module Column - Centered */}
                {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {t("theoretical.module")} {theoretical._id}
                      </div>
                    </div>
                  </div>
                </td> */}

                {/* ID Column - Centered */}
                {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <div className="text-sm font-mono text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {theoretical._id}
                    </div>
                  </div>
                </td> */}

                {/* Section Column - Centered */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                      {theoretical.categoryCode}
                    </span>
                  </div>
                </td>

                {/* Capacity Column - Centered */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mr-2">
                        {theoretical.capacity}
                      </div>
                    </div>
                    <div className="w-full max-w-16">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            theoretical.capacity > 50
                              ? "bg-green-500"
                              : theoretical.capacity > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (theoretical.capacity / 100) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </td>

                {/* Actions Column - Centered */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(theoretical)}
                        disabled={isDeleting}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t("theoretical.edit")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(theoretical)}
                      disabled={isDeleting}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("theoretical.delete")}
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TheoreticalCard;
