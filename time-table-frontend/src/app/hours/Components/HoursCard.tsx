// "use client";

// import React, { useState, useEffect } from "react"; // Added useEffect for potential future use
// import { useTranslation } from "react-i18next";
// import { useHours, HourWithDay } from "../hooks/useHours"; // Assuming path is correct relative to this file
// import { Day } from "@/app/days/days.type"; // Assuming path is correct

// // Define the structure for hours grouped by day name
// type GroupedHours = {
//   [dayName: string]: HourWithDay[];
// };

// // Props interface for the HoursCard component
// interface HoursCardProps {
//   hours?: HourWithDay[]; // Optional: If provided, component uses this data
//   days?: Day[]; // Optional: For future use, e.g., displaying all days even if no hours
//   onTimeUpdate?: (
//     id: number,
//     newValue: string,
//     dayName?: string
//   ) => Promise<void>; // Optional: Custom update handler
//   onDayUpdate?: (id: string, newDay: Day["name"]) => void; // Optional: For future day update functionality
//   loading?: boolean; // Optional: Override loading state
//   error?: string | null; // Optional: Override error state
// }

// // Helper function to group HourWithDay objects by their day's name
// const groupByDay = (hours: HourWithDay[]): GroupedHours => {
//   return hours.reduce((acc, hour) => {
//     const dayName = hour.day.name; // e.g., "Monday"
//     if (!acc[dayName]) {
//       acc[dayName] = [];
//     }
//     // Sort slots by time within each day group
//     acc[dayName].push(hour);
//     acc[dayName].sort((a, b) => {
//       const [aHours, aMins] = a.value.split(":").map(Number);
//       const [bHours, bMins] = b.value.split(":").map(Number);
//       return aHours * 60 + aMins - (bHours * 60 + bMins);
//     });
//     return acc;
//   }, {} as GroupedHours);
// };

// // Helper function to format time string (e.g., "09:00") to AM/PM format
// const formatTimeDisplay = (timeString: string): string => {
//   if (!timeString || !timeString.includes(":")) return "N/A";
//   const [hoursStr, minutesStr] = timeString.split(":");
//   const hours = parseInt(hoursStr, 10);
//   const minutes = parseInt(minutesStr, 10);

//   if (isNaN(hours) || isNaN(minutes)) return timeString; // Fallback if parsing fails

//   const period = hours >= 12 ? "PM" : "AM";
//   const displayHours = hours % 12 || 12; // Convert 0 or 12 to 12 for 12 AM/PM
//   return `${displayHours.toString().padStart(2, "0")}:${minutes
//     .toString()
//     .padStart(2, "0")} ${period}`;
// };

// const HoursCard: React.FC<HoursCardProps> = ({
//   hours: propHours,
//   onTimeUpdate: propOnTimeUpdate,
//   loading: propLoading,
//   error: propError,
//   // days: propDays, // propDays is available if needed for future enhancements
//   // onDayUpdate: propOnDayUpdate, // propOnDayUpdate is available
// }) => {
//   const { t, i18n } = useTranslation();
//   const isRTL = i18n.language === "ar";

//   // Utilize the useHours hook for data and actions if not provided via props
//   const {
//     hoursWithDay: hookHoursWithDay,
//     updateTimeValue: hookUpdateTimeValue,
//     isLoading: hookLoading,
//     error: hookError,
//   } = useHours();

//   // Determine final data and state to use (props override hook data)
//   // This ensures that if a parent component passes 'hours', those are used,
//   // otherwise, the data from the hook (which is fetched from the backend) is used.
//   const hours = propHours || hookHoursWithDay || [];
//   const loading = propLoading !== undefined ? propLoading : hookLoading;
//   const error = propError !== undefined ? propError : hookError;
//   // Use propOnTimeUpdate if available, otherwise default to the hook's updateTimeValue
//   const onTimeUpdateHandler = propOnTimeUpdate || hookUpdateTimeValue;

//   // State for managing inline editing of a time slot
//   const [editingTime, setEditingTime] = useState<{
//     id: number; // This is HourWithDay.id (client-side unique ID)
//     value: string; // Original value of the time slot being edited
//     dayName: string; // Name of the day for context
//   } | null>(null);
//   const [newTime, setNewTime] = useState<string>(""); // Current value in the time input field during edit

//   // Group the hours by day name for rendering
//   const groupedHours = groupByDay(hours);
//   // Sort day names for consistent display order (e.g., Monday, Tuesday, ...)
//   const sortedDayNames = Object.keys(groupedHours).sort((a, b) => {
//     const dayOrder = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ];
//     return dayOrder.indexOf(a) - dayOrder.indexOf(b);
//   });

//   // Handler to initiate editing a time slot
//   const handleEditTime = (slot: HourWithDay) => {
//     setEditingTime({ id: slot.id, value: slot.value, dayName: slot.day.name });
//     // Ensure the time input is initialized in "HH:mm" format
//     setNewTime(
//       slot.value.includes(":")
//         ? slot.value
//         : `${String(slot.value).padStart(2, "0")}:00`
//     );
//   };

//   // Handler to save the edited time
//   const handleSaveTime = async () => {
//     if (editingTime && newTime) {
//       try {
//         // Call the update handler (either from props or hook's updateTimeValue)
//         // The `editingTime.id` is the client-side ID. The hook's `updateTimeValue`
//         // uses this to find the `originalId` (MongoDB _id) for the backend.
//         await onTimeUpdateHandler(editingTime.id, newTime, editingTime.dayName);
//         setEditingTime(null); // Exit editing mode
//         setNewTime(""); // Clear the input state
//       } catch (saveError) {
//         console.error("Failed to save time:", saveError);
//         // Optionally, set an error message to display to the user here
//         // e.g., using a toast notification or a state variable
//       }
//     }
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full dark:border-gray-600 dark:border-t-blue-500"></div>
//         <span className="ml-2 text-gray-600 dark:text-gray-400">
//           {t("hours.loading", "Loading hours...")}
//         </span>
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="text-center p-8 text-red-600 dark:text-red-400">
//         {t("hours.error", { message: error, defaultValue: `Error: ${error}` })}
//       </div>
//     );
//   }

//   // Render message if no hours are available after loading and no error
//   if (hours.length === 0) {
//     return (
//       <div className="text-center p-8 text-gray-500 dark:text-gray-400">
//         {t("hours.noHoursScheduled", "No hours scheduled yet.")}
//       </div>
//     );
//   }

//   // Main component render
//   return (
//     <div
//       className={`w-full ${isRTL ? "rtl" : "ltr"}`}
//       dir={isRTL ? "rtl" : "ltr"}
//     >
//       {/* Mobile / Tablet View: Cards per day */}
//       <div className="block lg:hidden space-y-4">
//         {sortedDayNames.map((day) => (
//           <div
//             key={day}
//             className="rounded-xl shadow-lg p-5 border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
//           >
//             <h2
//               className={`text-lg font-bold mb-3 text-gray-900 dark:text-gray-100 ${
//                 isRTL ? "text-right" : "text-left"
//               }`}
//             >
//               {t(`days.${day.toLowerCase()}`, day)}
//             </h2>
//             <div
//               className={`flex flex-wrap gap-2 ${
//                 isRTL ? "justify-end" : "justify-start"
//               }`}
//             >
//               {groupedHours[day].map((slot) => (
//                 <div key={slot.id} className="relative">
//                   {editingTime?.id === slot.id ? (
//                     <div
//                       className={`flex gap-2 items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-md ${
//                         isRTL ? "flex-row-reverse" : "flex-row"
//                       }`}
//                     >
//                       <input
//                         type="time"
//                         value={newTime}
//                         onChange={(e) => setNewTime(e.target.value)}
//                         className="w-32 border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
//                         step="300" // 5-minute increments
//                         dir="ltr"
//                       />
//                       <button
//                         onClick={handleSaveTime}
//                         className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700"
//                         disabled={!newTime || loading} // Disable if no new time or if loading
//                       >
//                         {t("common.save", "Save")}
//                       </button>
//                       <button
//                         onClick={() => setEditingTime(null)}
//                         className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
//                         disabled={loading} // Disable if loading
//                       >
//                         {t("common.cancel", "Cancel")}
//                       </button>
//                     </div>
//                   ) : (
//                     <span
//                       className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700/50 dark:hover:bg-indigo-900/60"
//                       onClick={() => handleEditTime(slot)}
//                     >
//                       {formatTimeDisplay(slot.value)}
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Desktop View: Table */}
//       <div className="hidden lg:block mt-2">
//         <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//               <tr>
//                 <th
//                   className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
//                     isRTL ? "text-right" : "text-left"
//                   }`}
//                 >
//                   {t("hours.day", "Day")}
//                 </th>
//                 <th
//                   className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 ${
//                     isRTL ? "text-right" : "text-left"
//                   }`}
//                 >
//                   {t("hours.availableSlots", "Available Slots")}
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {sortedDayNames.map((day) => (
//                 <tr
//                   key={day}
//                   className="hover:bg-gray-50/70 dark:hover:bg-gray-700/70 transition-colors even:bg-gray-50/30 dark:even:bg-gray-700/30"
//                 >
//                   <td
//                     className={`px-6 py-4 font-medium text-gray-800 dark:text-gray-100 align-top ${
//                       isRTL ? "text-right" : "text-left"
//                     }`}
//                   >
//                     {t(`days.${day.toLowerCase()}`, day)}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div
//                       className={`flex flex-wrap gap-2 ${
//                         isRTL ? "justify-end" : "justify-start"
//                       }`}
//                     >
//                       {groupedHours[day].map((slot) => (
//                         <div key={slot.id} className="relative">
//                           {editingTime?.id === slot.id ? (
//                             <div
//                               className={`flex gap-2 items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-md ${
//                                 isRTL ? "flex-row-reverse" : "flex-row"
//                               }`}
//                             >
//                               <input
//                                 type="time"
//                                 value={newTime}
//                                 onChange={(e) => setNewTime(e.target.value)}
//                                 className="w-32 border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
//                                 step="300"
//                                 dir="ltr"
//                               />
//                               <button
//                                 onClick={handleSaveTime}
//                                 className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700"
//                                 disabled={!newTime || loading} // Disable if no new time or if loading
//                               >
//                                 {t("common.save", "Save")}
//                               </button>
//                               <button
//                                 onClick={() => setEditingTime(null)}
//                                 className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
//                                 disabled={loading} // Disable if loading
//                               >
//                                 {t("common.cancel", "Cancel")}
//                               </button>
//                             </div>
//                           ) : (
//                             <span
//                               className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700/50 dark:hover:bg-indigo-900/60 shadow-sm"
//                               onClick={() => handleEditTime(slot)}
//                             >
//                               {formatTimeDisplay(slot.value)}
//                             </span>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HoursCard;
