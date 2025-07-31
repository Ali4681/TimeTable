import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  GraduationCap,
  Clock,
  User,
  UserCheck,
  Hash,
  BookOpen,
  MoreVertical,
  Eye,
  Calendar,
  DoorOpen,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Module, ModuleWithInfo, ModuleWithPractica } from "../modules.type";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleResponsiveViewProps {
  modules: (Module | ModuleWithInfo | ModuleWithPractica)[] | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  onManageStudents?: (id: string) => void;
  onManageRoom?: (id: string) => void;
  isLoading?: boolean;
  isRTL: boolean;
}

const ModuleResponsiveView: React.FC<ModuleResponsiveViewProps> = ({
  modules,
  onEdit,
  onDelete,
  isRTL,
  onView,
  onManageStudents,
  onManageRoom,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    moduleId: string;
    moduleName: string;
  }>({ isOpen: false, moduleId: "", moduleName: "" });

  const handleDeleteClick = (
    moduleId: string | undefined,
    moduleName: string | undefined
  ) => {
    if (!moduleId || !moduleName) return;

    setDeleteDialog({
      isOpen: true,
      moduleId,
      moduleName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.moduleId) {
      onDelete(deleteDialog.moduleId);
    }
    setDeleteDialog({ isOpen: false, moduleId: "", moduleName: "" });
  };

  const getYearsBadgeColor = (year: number | undefined) => {
    if (!year)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    if (year === 1 || year === 2) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
    if (year === 3 || year === 4) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
  };

  const getHoursBadgeColor = (hours: number | undefined) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (!hours)
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800`;

    if (hours <= 2) {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800`;
    }
    if (hours <= 3) {
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800`;
    }
    if (hours <= 4) {
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800`;
    }
    if (hours <= 6) {
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800`;
  };

  const hasPractica = (
    module: Module | ModuleWithInfo | ModuleWithPractica
  ): module is ModuleWithPractica => {
    return "practica" in module && module.practica !== undefined;
  };

  const hasInfo = (
    module: Module | ModuleWithInfo | ModuleWithPractica
  ): module is ModuleWithInfo => {
    return "doctorInfo" in module || "teacherInfo" in module;
  };

  if (isLoading || !modules) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            {i % 2 === 0 && (
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t("No modules found")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t("Start by creating your first module")}
        </p>
      </div>
    );
  }

  return (
    <div dir={dir}>
      {/* Mobile/Tablet View (Cards) */}
      <div className="block lg:hidden space-y-4">
        {modules.map((module) => {
          if (!module) return null;

          return (
            <Card
              key={module?._id || `module-${Math.random()}`}
              className="w-full shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700 border-l-4 border-l-blue-500"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold dark:text-white mb-1 line-clamp-2">
                      {module?.name || "Unnamed Module"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono">{module?.code || "N/A"}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => module?._id && onView(module._id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("View Details")}
                        </DropdownMenuItem>
                      )}
                      {onManageStudents && (
                        <DropdownMenuItem
                          onClick={() =>
                            module?._id && onManageStudents(module._id)
                          }
                        >
                          <Users className="mr-2 h-4 w-4" />
                          {t("Manage Students")}
                        </DropdownMenuItem>
                      )}
                      {onManageRoom && (
                        <DropdownMenuItem
                          onClick={() =>
                            module?._id && onManageRoom(module._id)
                          }
                        >
                          <DoorOpen className="mr-2 h-4 w-4" />
                          {t("Manage Room")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => module?._id && onEdit(module._id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t("Edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDeleteClick(module?._id, module?.name)
                        }
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("Delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={getYearsBadgeColor(module?.years)}
                  >
                    <GraduationCap className="mr-1 h-3 w-3" />
                    {t("Year")}: {module?.years || "N/A"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={getHoursBadgeColor(module?.hours)}
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {module?.hours || "0"}h
                  </Badge>
                  {hasPractica(module) && module.practica && (
                    <Badge variant="secondary">
                      <Calendar className="mr-1 h-3 w-3" />
                      {module.practica.length} {t("Practica")}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {t("Doctor")}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-200 truncate">
                      {hasInfo(module) && module.doctorInfo
                        ? `${module.doctorInfo.name} (${
                            module.doctorsId?.name || "N/A"
                          })`
                        : module.doctorsId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {t("Teacher")}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-200 truncate">
                      {hasInfo(module) && module.teacherInfo
                        ? `${module.teacherInfo.name} (${
                            module.teacherId?.name || "N/A"
                          })`
                        : module.teacherId?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>

              {(module.createdAt || hasPractica(module)) && (
                <CardFooter className="pt-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {module.createdAt && (
                      <>
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(module.createdAt), "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                    {hasPractica(module) &&
                      module.practica &&
                      module.practica.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {module.practica.length} {t("practical sessions")}
                          </span>
                        </>
                      )}
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {/* Desktop/Laptop View (Table) */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border shadow-sm dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("Module")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t("Code")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t("Year")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("Hours")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("Students")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("Doctor")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {t("Teacher")}
                </div>
              </th>
              {modules.some((m) => m && hasPractica(m)) && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("Practica")}
                  </div>
                </th>
              )}
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                {t("Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {modules.map((module, index) => {
              if (!module) return null;

              return (
                <tr
                  key={module?._id || `module-${index}`}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50/50 dark:bg-gray-800/50"
                  }`}
                >
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {module?.name || "Unnamed Module"}
                      </div>
                      {module.createdAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(module.createdAt), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-mono">
                      {module?.code || "N/A"}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge
                      variant="secondary"
                      className={getYearsBadgeColor(module?.years)}
                    >
                      {module?.years || "N/A"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge
                      variant="secondary"
                      className={getHoursBadgeColor(module?.hours)}
                    >
                      {module?.hours || "0"}h
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge variant="secondary">
                      {module?.erolledStudents || "0"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-[200px]">
                    <div className="truncate">
                      {hasInfo(module) && module.doctorInfo
                        ? `${module.doctorInfo.name} (${
                            module.doctorsId?.name || "N/A"
                          })`
                        : module.doctorsId?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-[200px]">
                    <div className="truncate">
                      {hasInfo(module) && module.teacherInfo
                        ? `${module.teacherInfo.name} (${
                            module.teacherId?.name || "N/A"
                          })`
                        : module.teacherId?.name || "N/A"}
                    </div>
                  </td>
                  {hasPractica(module) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant="secondary">
                        {module.practica?.length || 0}
                      </Badge>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-1">
                      {onView && (
                        <Button
                          onClick={() => module?._id && onView(module._id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600"
                          title={t("View Details")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onManageStudents && (
                        <Button
                          onClick={() =>
                            module?._id && onManageStudents(module._id)
                          }
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600"
                          title={t("Manage Students")}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {onManageRoom && (
                        <Button
                          onClick={() =>
                            module?._id && onManageRoom(module._id)
                          }
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600"
                          title={t("Manage Room")}
                        >
                          <DoorOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => module?._id && onEdit(module._id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600"
                        title={t("Edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteClick(module?._id, module?.name)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-gray-600"
                        title={t("Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              {t("Delete Module")}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              {t("Are you sure you want to delete module")}{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{deleteDialog.moduleName}"
              </span>
              ? {t("This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModuleResponsiveView;
