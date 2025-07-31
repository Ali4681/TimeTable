import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hours, UpdateHoursDto } from "../hours.type";
import { Day } from "@/app/days/days.type";
import { getDayNames, useDays } from "@/app/days/hooks/useDays";
import { cn, tConvert } from "@/lib/utils";

interface AllHoursTableProps {
  rawHours: Hours[];
  days?: Day[] | undefined;
  loading: boolean;
  error: string | null;
  isRTL: boolean;
  deleteHour: (id: string) => void; // Updated prop name and signature
  updateHours: (params: { id: string; data: UpdateHoursDto }) => Promise<Hours>; // Updated prop name and signature
  onEdit: (id: any, newValue: any) => Promise<Hours>;
  onDelete: (id: string) => Promise<void>;
}

// function formatTime(time24: string): string {
//   const [hourStr, minuteStr] = time24.split(":");
//   const hour = parseInt(hourStr, 10);
//   const minute = parseInt(minuteStr, 10);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const hour12 = hour % 12 || 12;
//   return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
// }

const AllHoursTable: React.FC<AllHoursTableProps> = ({
  rawHours,
  days,
  loading,
  error,
  isRTL,
  deleteHour, // Updated prop
  updateHours, // Updated prop
}) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingHour, setEditingHour] = useState<Hours | null>(null);
  const [editingDay, setEditingDay] = useState<string>("");

  console.log(editingDay);

  const [timeToDelete, setTimeToDelete] = useState<string | null>(null);
  const [newTimeValue, setNewTimeValue] = useState("");
  const [newTimeDayValue, setNewTimeDayValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const daysList = useDays().data || [];

  const handleDeleteClick = (id: string) => {
    setTimeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (hour: Hours) => {
    setEditingDay(hour.daysId._id);
    setEditingHour(hour);
    setNewTimeValue(hour.value);
    setNewTimeDayValue(hour.daysId.name);
  };

  const confirmDelete = async () => {
    if (!timeToDelete) return;
    setIsProcessing(true);
    try {
      await deleteHour(timeToDelete); // Use updated prop
    } catch (err) {
      console.error("Failed to delete time slot:", err);
      // Optionally, display an error message to the user
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setTimeToDelete(null);
    }
  };

  const saveEdit = async () => {
    if (!editingHour || !newTimeValue) return;
    setIsProcessing(true);
    try {
      const dataToUpdate: UpdateHoursDto = {
        daysId: editingDay ?? "", // Assumes daysID are part of the original editingHour object
        value: newTimeValue,
      };
      await updateHours({ id: editingHour._id, data: dataToUpdate }); // Use updated prop and pass structured data
      setEditingHour(null);
      setNewTimeValue("");
    } catch (err) {
      console.error("Failed to update time slot:", err);
      // Optionally, display an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full dark:border-gray-600 dark:border-t-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {t("hours.loadingAllSlots", "Loading all time slots...")}
        </span>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="text-center p-8 text-red-600 dark:text-red-400 min-h-[200px]">
  //       {t("hours.errorAllSlots", {
  //         message: error,
  //         defaultValue: `Error loading time slots: ${error}`,
  //       })}
  //     </div>
  //   );
  // }

  if (!rawHours || rawHours.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 min-h-[200px] bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-600">
        {t("hours.noRawHours", "No raw time slots found in the backend data.")}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 p-6">
          <h3
            className={`text-xl font-semibold text-gray-700 dark:text-gray-200 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("hours.allTimeSlots", "All Time Slots")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th
                  className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.table.days", "Day(s)")}
                </th>
                <th
                  className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.table.timeSlot", "Time Slot (24h)")}
                </th>
                <th
                  className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.table.displayTime", "Display Time (AM/PM)")}
                </th>
                <th
                  className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("hours.table.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
              {rawHours.map((hour, index) => {
                console.log("time in 12 format :  ", tConvert(hour.value));

                return (
                  <tr
                    key={hour._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      index % 2 === 0
                        ? "bg-gray-50/50 dark:bg-gray-700/10"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    <td
                      className={`px-6 py-4 text-gray-800 dark:text-gray-100 whitespace-nowrap ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {hour.daysId
                        ? getDayNames(hour.daysId._id, daysList)
                        : t("hours.table.unknownDay", "Unknown")}
                    </td>

                    <td
                      className={`px-6 py-4 text-gray-800 dark:text-gray-100 whitespace-nowrap font-mono ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {tConvert(hour.value)}
                    </td>
                    <td
                      className={`px-6 py-4 text-gray-800 dark:text-gray-100 whitespace-nowrap ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                      >
                        {tConvert(hour.value)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(hour)}
                          className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(hour._id)}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("hours.deleteConfirmation.title", "Delete Time Slot?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "hours.deleteConfirmation.description",
                "Are you sure you want to delete this time slot? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  {t("common.deleting", "Deleting...")}
                </span>
              ) : (
                t("common.delete", "Delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editingHour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {t("hours.editTimeSlot", "Edit Time Slot")}
            </h3>
            <div className="space-y-4">
              {/* TODO : make it select menu  */}
              <div>
                <Label htmlFor="timeValue" className="block mb-2">
                  {t("hours.timeValue", "Time (24h format)")}
                </Label>
                <select
                  id="timeValue"
                  value={editingDay}
                  onChange={(e) => setEditingDay(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  )}
                >
                  {days?.map((day) => {
                    return (
                      <option key={day._id} value={day._id}>
                        {day.name}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    "hours.exampleFormat",
                    "Example: 09:00, 13:30, 18:45 (24-hour format)"
                  )}
                </p>
              </div>
              <div>
                <Label htmlFor="timeValue" className="block mb-2">
                  {t("hours.timeValue", "Time (24h format)")}
                </Label>
                <Input
                  id="timeValue"
                  value={newTimeValue}
                  onChange={(e) => setNewTimeValue(e.target.value)}
                  placeholder="HH:MM"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    "hours.exampleFormat",
                    "Example: 09:00, 13:30, 18:45 (24-hour format)"
                  )}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingHour(null)}
                  disabled={isProcessing}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button onClick={saveEdit} disabled={isProcessing}>
                  {isProcessing ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      {t("common.saving", "Saving...")}
                    </span>
                  ) : (
                    t("common.save", "Save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllHoursTable;
