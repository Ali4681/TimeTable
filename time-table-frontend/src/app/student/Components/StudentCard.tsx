"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Edit,
  MoreVertical,
  Phone,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Student } from "../student.type";

interface StudentTableProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  isLoading?: boolean;
  dir?: "ltr" | "rtl";
  isRTL: boolean;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  isLoading,
  dir = "ltr",
}) => {
  const { t } = useTranslation("students");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Student;
    direction: "ascending" | "descending";
  } | null>(null);

  const getAvatarColor = (id: string) => {
    const hue = Math.abs(stringHashCode(id)) % 360;
    return `hsl(${hue}, 75%, 45%)`;
  };

  const MobileCardView = ({ student }: { student: Student }) => {
    const initials = (student.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div
        className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/80 mb-4 md:hidden transition-all duration-200 hover:shadow-md"
        dir={dir}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Avatar className="h-12 w-12 ring-2 ring-white/50 dark:ring-gray-900/50 shadow-sm">
              <AvatarFallback
                className="text-white font-medium"
                style={{
                  backgroundColor: getAvatarColor(student._id),
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-base mb-1.5">
                {student.name}
              </h3>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={dir === "rtl" ? "start" : "end"}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(student)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/70"
                  >
                    <Edit
                      className={`h-4 w-4 ${
                        dir === "rtl" ? "ml-2" : "mr-2"
                      } text-gray-500 dark:text-gray-400`}
                    />
                    {t("actions.edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-red-600 hover:text-red-700 focus:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                    onClick={() => onDelete(student._id)}
                  >
                    <Trash2
                      className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`}
                    />
                    {t("actions.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone
              className={`h-4 w-4 ${
                dir === "rtl" ? "ml-2" : "mr-2"
              } text-gray-500 dark:text-gray-500`}
            />
            {student.phoneNumber}
          </div>

          {/* Add modules section for mobile */}
          {student.modules && student.modules.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t("tableHeaders.modules")}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[...new Set(student.modules.map((item) => item?.module?.name))]
                  .filter(Boolean)
                  .map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="px-2 py-1 bg-emerald-400/10 rounded-md text-emerald-400 text-xs shadow-sm"
                    >
                      {name}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 pt-1 mt-1 border-t border-gray-100 dark:border-gray-700/40">
            <User
              className={`h-4 w-4 ${
                dir === "rtl" ? "ml-2" : "mr-2"
              } text-gray-500 dark:text-gray-500`}
            />
            {t("studentId")}: {student._id}
          </div>
        </div>
      </div>
    );
  };
  const DesktopTableView = () => {
    const sortedStudents = sortConfig
      ? [...students].sort((a, b) => {
          const key = sortConfig.key;
          const direction = sortConfig.direction;

          const valA = a[key];
          const valB = b[key];

          if (valA == null || valB == null) {
            return 0;
          }

          if (valA < valB) return direction === "ascending" ? -1 : 1;
          if (valA > valB) return direction === "ascending" ? 1 : -1;
          return 0;
        })
      : [...students];

    const requestSort = (key: keyof Student) => {
      let direction: "ascending" | "descending" = "ascending";
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === "ascending"
      ) {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Student) => {
      if (!sortConfig || sortConfig.key !== key)
        return (
          <ArrowUpDown className="h-4 w-4 ml-1.5 text-gray-400 opacity-60" />
        );
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="h-4 w-4 ml-1.5 text-blue-500 dark:text-blue-400" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1.5 text-blue-500 dark:text-blue-400" />
      );
    };

    return (
      <div
        className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-sm transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800"
        dir={dir}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/80">
          <thead className="bg-gray-50/70 dark:bg-gray-800/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => requestSort("name")}
                  className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                >
                  <span>{t("tableHeaders.name")}</span>
                  {getSortIcon("name")}
                </button>
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => requestSort("years")}
                  className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                >
                  <span>{t("tableHeaders.year")}</span>
                  {getSortIcon("years")}
                </button>
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("tableHeaders.phone")}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("tableHeaders.modules")}
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("tableHeaders.actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {sortedStudents.map((student) => {
              const initials = (student.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <tr
                  key={student._id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        className={`h-10 w-10 ${
                          dir === "rtl" ? "ml-3" : "mr-3"
                        } ring-2 ring-white/50 dark:ring-gray-900/50`}
                      >
                        <AvatarFallback
                          className="text-white font-medium"
                          style={{
                            backgroundColor: getAvatarColor(student._id),
                          }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {student.years}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {student.phoneNumber}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 flex gap-2 flex-wrap">
                    {[
                      ...new Set(
                        student.modules.map((item) => item?.module?.name)
                      ),
                    ]
                      .filter(Boolean)
                      .map((name, index) => (
                        <div
                          key={`${name}-${index}`}
                          className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400 shadow-md"
                        >
                          {name}
                        </div>
                      ))}
                  </td>

                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div
                        className={`flex ${
                          dir === "rtl" ? "justify-start" : "justify-end"
                        } space-x-2 rtl:space-x-reverse`}
                      >
                        {onEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                onClick={() => onEdit(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                              <span className="px-2 py-1">
                                {t("actions.edit")}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                onClick={() => onDelete(student._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                              <span className="px-2 py-1">
                                {t("actions.delete")}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const LoadingState = () => (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex justify-center items-center p-10">
        <div className="relative w-14 h-14">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700/60 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="text-center text-gray-500 dark:text-gray-400">
        {t("loading", "Loading students...")}
      </p>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="md:hidden space-y-4" dir={dir}>
            {students.map((student) => (
              <MobileCardView key={student._id} student={student} />
            ))}
            {students.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/80">
                {t("noStudents", "No students found")}
              </div>
            )}
          </div>

          <DesktopTableView />

          {students.length === 0 && (
            <div className="hidden md:flex p-12 justify-center items-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/80 rounded-xl bg-white dark:bg-gray-800">
              {t("noStudents", "No students found")}
            </div>
          )}
        </>
      )}
    </>
  );
};

function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

export default StudentTable;
