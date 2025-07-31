import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateHoursDto, Hours, UpdateHoursDto } from "../hours.type";
import { HoursService } from "../hours.service";

export const useHours = () => {
  const queryClient = useQueryClient();

  // Query for fetching hours
  const hoursQuery = useQuery<Hours[], Error>({
    queryKey: ["hours"],
    queryFn: HoursService.findAll,
  });

  // Mutation for creating hours
  const createMutation = useMutation<Hours, Error, CreateHoursDto>({
    mutationFn: HoursService.create,
    onSuccess: (newHours) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["hours"] });
      // Or update cache directly (optimistic update)
      // queryClient.setQueryData<Hours[]>(["hours"], (old) =>
      //   old ? [...old, newHours] : [newHours]
      // );
    },
    onError: (error) => {
      console.error("Error creating hours:", error);
    },
  });

  // Mutation for updating hours
  const updateMutation = useMutation<
    Hours,
    Error,
    { id: string; data: UpdateHoursDto }
  >({
    mutationFn: ({ id, data }) => HoursService.update(id, data),
    onSuccess: (updatedHours) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["hours"] });
      // Or update cache directly
      // queryClient.setQueryData<Hours[]>(["hours"], (old) =>
      //   old?.map((h) => (h._id === updatedHours._id ? updatedHours : h))
      // );
    },
    onError: (error) => {
      console.error("Error updating hours:", error);
    },
  });

  // Mutation for deleting hours
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: HoursService.remove,
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["hours"] });
      // Or update cache directly
      // queryClient.setQueryData<Hours[]>(["hours"], (old) =>
      //   old?.filter((h) => h._id !== id)
      // );
    },
    onError: (error) => {
      console.error("Error deleting hours:", error);
    },
  });

  return {
    // Query data and state
    hours: hoursQuery.data || [],
    loading: hoursQuery.isLoading,
    error: hoursQuery.error,
    refetchHours: hoursQuery.refetch,

    // Mutations
    createHours: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateHours: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteHours: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
};
