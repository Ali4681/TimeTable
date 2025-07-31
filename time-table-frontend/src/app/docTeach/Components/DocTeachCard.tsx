"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, Clock, Calendar, Hash } from "lucide-react";
import { DocTeach, DoctorWithHours } from "../docTeach.type";
import { useHours } from "@/app/hours/hooks/useHours";
import { useTheme } from "@/components/ThemeProvider";
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
import { useState } from "react";
import { Hours } from "@/app/hours/hours.type";
import { tConvert } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocTeachViewProps {
  docTeach: DoctorWithHours;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: "card" | "table-row";
}

interface DocTeachListViewProps {
  docTeaches: DoctorWithHours[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: "card" | "table";
}

// Helper function to get hour label by ID
const getHourLabel = (hourId: string, hours: Hours[]): string => {
  const hour = hours.find((h) => h._id === hourId);
  if (!hour) return hourId;
  return hour.name || `${hour.value} - ${hour.daysId.name}` || hourId;
};

export const DocTeachCard = ({
  docTeach,
  onEdit,
  onDelete,
}: Omit<DocTeachViewProps, "variant">) => {
  const { hours } = useHours();
  const { isDarkMode } = useTheme();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const themeClasses = {
    card: isDarkMode
      ? "bg-[#1E2430] border-[#343D4E] text-white"
      : "bg-white border-gray-200 text-gray-900",
    badge: isDarkMode
      ? "bg-[#343D4E] text-gray-200 border-[#3E4758]"
      : "bg-gray-100 text-gray-800 border-gray-300",
    text: isDarkMode ? "text-gray-300" : "text-gray-500",
    button: isDarkMode
      ? "border-[#3E4758] hover:bg-[#343D4E] text-gray-200"
      : "border-gray-300 hover:bg-gray-50 text-gray-700",
    deleteButton: isDarkMode
      ? "border-red-600 text-black hover:bg-red-900/20 hover:text-black"
      : "border-red-300 text-black hover:bg-red-50 hover:text-black",
    iconBg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
    iconColor: isDarkMode ? "text-blue-400" : "text-blue-600",
    emptyState: isDarkMode ? "bg-[#343D4E]/30" : "bg-gray-50",
  };

  return (
    <>
      <Card
        className={`w-full h-full flex flex-col mb-4 shadow-lg hover:shadow-xl transition-all duration-200 ${themeClasses.card}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex justify-between items-start">
            <span className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${themeClasses.iconBg}`}>
                <User size={20} className={themeClasses.iconColor} />
              </div>
              <div className="flex flex-col">
                <span>{docTeach.doctor.name}</span>
                <span
                  className={`text-xs font-normal ${themeClasses.text} flex items-center gap-1`}
                >
                  <Hash size={12} />
                  {docTeach.doctor._id}
                </span>
              </div>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow space-y-4 pt-0">
          <div>
            <h4
              className={`font-medium text-sm ${themeClasses.text} mb-2 flex items-center gap-1`}
            >
              <Calendar size={14} />
              Type
            </h4>
            <Badge
              variant={docTeach.doctor.isDoctor ? "default" : "secondary"}
              className={`${
                docTeach.doctor.isDoctor
                  ? isDarkMode
                    ? "bg-green-900/40 text-green-300 border-green-700"
                    : "bg-green-100 text-green-800 border-green-300"
                  : isDarkMode
                  ? "bg-purple-900/40 text-purple-300 border-purple-700"
                  : "bg-purple-100 text-purple-800 border-purple-300"
              } px-3 py-1 font-medium`}
            >
              {docTeach.doctor.isDoctor ? "Doctor" : "Teacher"}
            </Badge>
          </div>

          {docTeach.hours && docTeach.hours.length > 0 ? (
            <div>
              <h4
                className={`font-medium text-sm ${themeClasses.text} mb-3 flex items-center gap-1`}
              >
                <Clock size={14} />
                Available Hours ({docTeach.hours.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {docTeach.hours.map((hour, index) => (
                  <Badge
                    key={hour._id}
                    variant="outline"
                    className={`${
                      isDarkMode
                        ? "bg-[#343D4E]/50 text-gray-200 border-[#3E4758] hover:bg-[#3E4758]/50"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    } transition-colors duration-150 px-2 py-1 text-xs`}
                  >
                    {getHourLabel(hour._id, hours)}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`text-sm ${themeClasses.text} italic flex items-center gap-2 p-3 rounded-lg ${themeClasses.emptyState}`}
            >
              <Clock size={14} />
              No available hours set
            </div>
          )}
        </CardContent>

        <CardFooter
          className={`flex justify-end space-x-2 pt-4 border-t ${
            isDarkMode ? "border-[#343D4E]" : "border-gray-200"
          }`}
        >
          <Button
            onClick={() => onEdit(docTeach.doctor._id)}
            variant="outline"
            size="sm"
            className={`gap-2 ${themeClasses.button} transition-all duration-200 hover:scale-105`}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            size="sm"
            className={`gap-2 ${themeClasses.deleteButton} transition-all duration-200 hover:scale-105`}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={isDarkMode ? "dark" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {docTeach.doctor.isDoctor ? "Doctor" : "Teacher"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {docTeach.doctor.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(docTeach.doctor._id!)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const DocTeachTableRow = ({
  docTeach,
  onEdit,
  onDelete,
}: Omit<DocTeachViewProps, "variant">) => {
  const { hours } = useHours();
  const { isDarkMode } = useTheme();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const themeClasses = {
    text: isDarkMode ? "text-gray-300" : "text-gray-700",
    subText: isDarkMode ? "text-gray-400" : "text-gray-500",
    button: isDarkMode
      ? "border-[#3E4758] hover:bg-[#343D4E] text-gray-200"
      : "border-gray-300 hover:bg-gray-50 text-gray-700",
    deleteButton: isDarkMode
      ? "border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300"
      : "border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600",
    iconBg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
    iconColor: isDarkMode ? "text-blue-400" : "text-blue-600",
  };

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Hash size={14} className={themeClasses.subText} />
          <span className={`text-sm font-mono ${themeClasses.text}`}>
            {docTeach.doctor._id?.slice(-8) || "N/A"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${themeClasses.iconBg}`}>
            <User size={16} className={themeClasses.iconColor} />
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${themeClasses.text}`}>
              {docTeach.doctor.name}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <Badge
            variant={docTeach.doctor.isDoctor ? "default" : "secondary"}
            className={`w-fit ${
              docTeach.doctor.isDoctor
                ? isDarkMode
                  ? "bg-green-900/40 text-green-300 border-green-700"
                  : "bg-green-100 text-green-800 border-green-300"
                : isDarkMode
                ? "bg-purple-900/40 text-purple-300 border-purple-700"
                : "bg-purple-100 text-purple-800 border-purple-300"
            } px-3 py-1 font-medium`}
          >
            {docTeach.doctor.isDoctor ? "Doctor" : "Teacher"}
          </Badge>
        </div>
      </td>
      <td className="px-6 py-4">
        {docTeach.hours && docTeach.hours.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {docTeach.hours.map((hour) => {
                const hourData = hours.find((h) => h._id === hour._id);
                const formattedTime = hourData?.value
                  ? tConvert(hourData.value)
                  : "";
                const dayName = hourData?.daysId?.name || "";

                return (
                  <Badge
                    key={hour._id}
                    variant="outline"
                    className={`text-xs ${
                      isDarkMode
                        ? "bg-[#343D4E]/50 text-gray-200 border-[#3E4758]"
                        : "bg-gray-50 text-gray-700 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{dayName}</span>
                      <span className="text-xs opacity-80">at</span>
                      <span className="font-semibold">{formattedTime}</span>
                    </div>
                  </Badge>
                );
              })}
            </div>
            <span
              className={`text-xs ${themeClasses.subText} flex items-center gap-1`}
            >
              <Clock size={12} />
              {docTeach.hours.length} hour
              {docTeach.hours.length !== 1 ? "s" : ""} available
            </span>
          </div>
        ) : (
          <div
            className={`text-sm ${themeClasses.subText} italic flex items-center gap-2`}
          >
            <Clock size={14} />
            No hours set
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end space-x-2">
          <Button
            onClick={() => onEdit(docTeach.doctor._id!)}
            variant="outline"
            size="sm"
            className={`gap-1 ${themeClasses.button} transition-all duration-200 hover:scale-105`}
          >
            <Edit size={14} />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            size="sm"
            className={`gap-1 ${themeClasses.deleteButton} transition-all duration-200 hover:scale-105 `}
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </td>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={isDarkMode ? "dark" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {docTeach.doctor.isDoctor ? "Doctor" : "Teacher"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {docTeach.doctor.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(docTeach.doctor._id!)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const DocTeachTableHeader = () => {
  const { isDarkMode } = useTheme();

  const themeClasses = {
    header: isDarkMode
      ? "bg-[#343D4E] border-b border-[#3E4758]"
      : "bg-gray-50 border-b border-gray-200",
    text: isDarkMode ? "text-gray-300" : "text-gray-500",
  };

  return (
    <thead className={themeClasses.header}>
      <tr>
        <th
          className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.text} uppercase tracking-wider`}
        >
          <div className="flex items-center space-x-1">
            <Hash size={14} />
            <span>ID</span>
          </div>
        </th>
        <th
          className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.text} uppercase tracking-wider`}
        >
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>Name</span>
          </div>
        </th>
        <th
          className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.text} uppercase tracking-wider`}
        >
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>Type</span>
          </div>
        </th>
        <th
          className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.text} uppercase tracking-wider`}
        >
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>Available Hours</span>
          </div>
        </th>
        <th
          className={`px-6 py-4 text-right text-xs font-semibold ${themeClasses.text} uppercase tracking-wider`}
        >
          <div className="flex items-center justify-end space-x-1">
            <span>Actions</span>
          </div>
        </th>
      </tr>
    </thead>
  );
};

const DocTeachView = ({
  docTeach,
  onEdit,
  onDelete,
  variant = "card",
}: DocTeachViewProps) => {
  if (variant === "table-row") {
    return (
      <DocTeachTableRow
        docTeach={docTeach}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }
  return (
    <DocTeachCard docTeach={docTeach} onEdit={onEdit} onDelete={onDelete} />
  );
};

export const DocTeachListView = ({
  docTeaches,
  onEdit,
  onDelete,
  variant = "card",
}: DocTeachListViewProps) => {
  const { isDarkMode } = useTheme();

  // Separate doctors and teachers
  const doctors = docTeaches.filter((dt) => dt.doctor.isDoctor);
  const teachers = docTeaches.filter((dt) => !dt.doctor.isDoctor);

  const themeClasses = {
    tabTrigger: isDarkMode
      ? "data-[state=active]:bg-[#343D4E] data-[state=active]:text-white"
      : "data-[state=active]:bg-white data-[state=active]:text-gray-900",
  };

  return (
    <Tabs defaultValue="doctors" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="doctors" className={`${themeClasses.tabTrigger}`}>
          Doctors ({doctors.length})
        </TabsTrigger>
        <TabsTrigger value="teachers" className={`${themeClasses.tabTrigger}`}>
          Teachers ({teachers.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="doctors">
        {variant === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((docTeach) => (
              <DocTeachCard
                key={docTeach.doctor._id}
                docTeach={docTeach}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[#3E4758]">
              <DocTeachTableHeader />
              <tbody className="divide-y divide-gray-200 dark:divide-[#3E4758]">
                {doctors.map((docTeach) => (
                  <tr
                    key={docTeach.doctor._id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1E2430]"
                  >
                    <DocTeachTableRow
                      docTeach={docTeach}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="teachers">
        {variant === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((docTeach) => (
              <DocTeachCard
                key={docTeach.doctor._id}
                docTeach={docTeach}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[#3E4758]">
              <DocTeachTableHeader />
              <tbody className="divide-y divide-gray-200 dark:divide-[#3E4758]">
                {teachers.map((docTeach) => (
                  <tr
                    key={docTeach.doctor._id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1E2430]"
                  >
                    <DocTeachTableRow
                      docTeach={docTeach}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default DocTeachView;
