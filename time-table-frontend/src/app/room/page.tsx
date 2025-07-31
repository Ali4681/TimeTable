"use client";

import { useState } from "react";
import RoomForm from "./Components/RoomForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import RoomTable from "./Components/RoomCard";
import { useTranslation } from "react-i18next";
import { RoomButton } from "./Components/RoomButton";
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from "./hooks/useRoom";
import { IRoom, IRoomCreate } from "./room.type";
import { useModules } from "../modules/hooks/useModules";
import { Navbar } from "@/components/nav";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<IRoom | null>(null);
  const { t, i18n } = useTranslation();

  // React Query hooks
  const { data: rooms = [], isLoading: isFetching } = useRooms();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  // Determine the text direction (LTR for English, RTL for Arabic)
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  const handleRoomSubmit = async (roomData: IRoomCreate) => {
    try {
      if (currentRoom) {
        // Update existing room
        await updateRoomMutation.mutateAsync({
          id: currentRoom._id,
          data: roomData,
        });
        toast.success(t("roomUpdatedSuccess"));
      } else {
        // Create new room
        await createRoomMutation.mutateAsync(roomData);
        toast.success(t("roomCreatedSuccess"));
      }
      setShowForm(false);
      setCurrentRoom(null);
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const handleEditRoom = (room: IRoom) => {
    setCurrentRoom(room);
    setShowForm(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      toast.success(t("roomDeletedSuccess"));
      if (currentRoom?._id === roomId) {
        setCurrentRoom(null);
        setShowForm(false);
      }
    } catch (error) {
      toast.error(t("deleteFailed"));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentRoom(null);
  };

  const isLoading =
    isFetching ||
    createRoomMutation.isPending ||
    updateRoomMutation.isPending ||
    deleteRoomMutation.isPending;
  return (
    <>
      <Navbar />
      <main
        className="container mx-auto p-4 md:p-6 space-y-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen mt-8"
        dir={direction}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("roomManagement")}</h1>
          <RoomButton
            className="mt-4"
            onClick={() => {
              setCurrentRoom(null);
              setShowForm(true);
            }}
            icon={<Plus className="h-4 w-4" />}
            label={t("addNewRoom")}
          />
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <RoomForm
              onSubmit={handleRoomSubmit}
              initialData={currentRoom || undefined}
              mode={currentRoom ? "edit" : "create"}
              onClose={handleCloseForm}
              onDelete={
                currentRoom
                  ? () => handleDeleteRoom(currentRoom._id)
                  : undefined
              }
              isLoading={isLoading}
            />
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
            <RoomButton
              className="mt-4"
              onClick={() => {
                setCurrentRoom(null);
                setShowForm(true);
              }}
              icon={<Plus className="h-4 w-4" />}
              label={t("addFirstRoom")}
            />
            <p className="text-gray-500 dark:text-gray-400">
              {t("noRoomsAvailable")}
            </p>
          </div>
        ) : (
          <RoomTable
            rooms={rooms}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
            isLoading={isLoading}
          />
        )}
      </main>
    </>
  );
}
