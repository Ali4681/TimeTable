import React, { useState } from "react";
import { X, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RoomButton } from "./RoomButton";
import { IRoom } from "../room.type";

interface RoomTableProps {
  rooms: IRoom[];
  onEdit?: (room: IRoom) => void;
  onDelete?: (roomId: string) => void;
  onView?: (room: IRoom) => void;
  onClose?: () => void;
  isLoading?: boolean;
  onAddNew?: () => void;
}

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  roomName: string;
}> = ({ isOpen, onConfirm, onCancel, roomName }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("confirmDelete") || "Confirm Delete"}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("deleteRoomConfirmation") ||
              "Are you sure you want to delete the room"}{" "}
            "{roomName}"?
            {t("deleteWarning") || "This action cannot be undone."}
          </p>
        </div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t("delete") || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  onEdit,
  onDelete,
  onView,
  onClose,
  isLoading = false,
  onAddNew,
}) => {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<IRoom | null>(null);

  const handleDeleteClick = (room: IRoom) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roomToDelete && onDelete) {
      onDelete(roomToDelete._id);
    }
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const MobileCardView = ({ room }: { room: IRoom }) => (
    <div className="relative p-4 shadow-md rounded-lg bg-white dark:bg-gray-800 mb-4 md:hidden border border-gray-200 dark:border-gray-700">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold dark:text-white">{room.name}</h3>
        <div className="flex space-x-2 rtl:space-x-reverse">
          {onView && (
            <button
              onClick={() => onView(room)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              aria-label={t("view")}
            >
              <Eye className="h-5 w-5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(room)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label={t("edit")}
            >
              <Edit2 className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleDeleteClick(room)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label={t("delete")}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 dark:text-gray-300">
        <div>
          <span className="font-medium">{t("id")}:</span> {room._id}
        </div>
        <div>
          <span className="font-medium">{t("capacity")}:</span>
          <span
            className={`ml-2 px-2 py-1 text-xs rounded ${
              room.capacity <= 10
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : room.capacity <= 20
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {room.capacity}
          </span>
        </div>
        <div>
          <span className="font-medium">{t("type")}:</span>
          <span
            className={`ml-2 px-2 py-1 text-xs rounded ${
              room.theoretical
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            }`}
          >
            {room.theoretical
              ? t("theoretical") || "Theoretical"
              : t("practical") || "Practical"}
          </span>
        </div>
        <div>
          <span className="font-medium">{t("modules")}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {room.modules?.map((module, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold rounded"
              >
                {module}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopTableView = () => (
    <div className="hidden md:block overflow-x-auto rounded-lg border shadow-sm w-full dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-center">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 align-middle"
            >
              {t("id")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 align-middle"
            >
              {t("name")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 align-middle"
            >
              {t("capacity")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 align-middle"
            >
              {t("room.type")}
            </th>

            {(onView || onEdit || onDelete) && (
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 align-middle"
              >
                {t("actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 text-center">
          {isLoading ? (
            <tr>
              <td
                colSpan={onView || onEdit || onDelete ? 6 : 5}
                className="px-6 py-4 text-center align-middle"
              >
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              </td>
            </tr>
          ) : rooms.length === 0 ? (
            <tr>
              <td
                colSpan={onView || onEdit || onDelete ? 6 : 5}
                className="px-6 py-4 text-gray-500 dark:text-gray-400 align-middle"
              >
                {t("noRoomsFound")}
              </td>
            </tr>
          ) : (
            rooms.map((room) => (
              <tr
                key={room._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {/* ID column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-middle">
                  <span className="text-xs font-mono">{room._id}</span>
                </td>

                {/* Name column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-middle">
                  <span className="font-semibold">{room.name}</span>
                </td>

                {/* Capacity column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm align-middle">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      room.capacity <= 10
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : room.capacity <= 20
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {room.capacity}
                  </span>
                </td>

                {/* Type column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm align-middle">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      room.theoretical
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    }`}
                  >
                    {room.theoretical
                      ? t("room.Lecture Hall") || "Lecture Hall"
                      : t("room.Lab") || "Lab"}
                  </span>
                </td>

                {/* Action buttons column */}
                {(onView || onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                    <div className="flex justify-center space-x-2 rtl:space-x-reverse gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(room)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          aria-label={t("view")}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(room)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          aria-label={t("edit")}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDeleteClick(room)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={t("delete")}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {onAddNew && (
        <div className="flex justify-end">
          <RoomButton onClick={onAddNew} />
        </div>
      )}

      {/* Mobile View (Cards) */}
      <div
        className="md:hidden space-y-4"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            {t("noRoomsFound")}
          </div>
        ) : (
          rooms.map((room) => <MobileCardView key={room._id} room={room} />)
        )}
      </div>

      {/* Desktop View (Table) */}
      <DesktopTableView />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        roomName={roomToDelete?.name || ""}
      />
    </div>
  );
};

export default RoomTable;
