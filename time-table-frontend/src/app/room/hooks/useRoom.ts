// hooks/useRooms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IRoom, IRoomCreate, IRoomUpdate, ILinkToRoom } from "../room.type";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  linkToRoom,
  getRoomInfoGenerate,
} from "../room.service";
import { TimetableScheduleResponse } from "@/app/generateTable/generateTable.type";

const ROOMS_QUERY_KEY = "rooms";

export const useRooms = () => {
  return useQuery<IRoom[], Error>({
    queryKey: [ROOMS_QUERY_KEY],
    queryFn: getAllRooms,
  });
};

export const useRoom = (id: string) => {
  return useQuery<IRoom, Error>({
    queryKey: [ROOMS_QUERY_KEY, id],
    queryFn: () => getRoomById(id),
    enabled: !!id,
  });
};


// ✅ New hook for infogenerate
export const useRoomInfoGenerate = () => {
  return useQuery<TimetableScheduleResponse, Error>({
    queryKey: [ROOMS_QUERY_KEY, "infogenerate"],
    queryFn: getRoomInfoGenerate,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<IRoom, Error, IRoomCreate>({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<IRoom, Error, { id: string; data: IRoomUpdate }>({
    mutationFn: ({ id, data }) => updateRoom(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY, data._id] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteRoom,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [ROOMS_QUERY_KEY, id] });
    },
  });
};

export const useLinkToRoom = () => {
  return useMutation<void, Error, ILinkToRoom>({
    mutationFn: linkToRoom,
  });
};
