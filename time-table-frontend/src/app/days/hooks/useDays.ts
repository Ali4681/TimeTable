import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Day } from "../days.type";
import { createDay, deleteDay, fetchDays, updateDay } from "../days.service";

export const useDays = () => {
  return useQuery<Day[]>({
    queryKey: ["days"],
    queryFn: fetchDays,
  });
};

export function getDayNames(daysID: string, daysList: Day[]): string {
  return (
    daysList.find((day) => day._id == daysID)?.name ?? "DAY_NAME_NOT_FOUND"
  );
}

export const useDayMutations = () => {
  // This is the correct way to get the queryClient in components/hooks
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
    },
  });

  return {
    createDay: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateDay: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteDay: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
