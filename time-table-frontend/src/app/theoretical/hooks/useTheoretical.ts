import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { theoreticalService } from "../theoretical.service";
import { TheoreticalDto } from "../theoretical.type";

// Query keys
export const theoreticalKeys = {
  all: ["theoretical"] as const,
  lists: () => [...theoreticalKeys.all, "list"] as const,
  list: (filters: string) => [...theoreticalKeys.lists(), { filters }] as const,
  details: () => [...theoreticalKeys.all, "detail"] as const,
  detail: (id: string) => [...theoreticalKeys.details(), id] as const,
};

// Get all theoreticals
export const useTheoreticals = () => {
  return useQuery({
    queryKey: theoreticalKeys.lists(),
    queryFn: theoreticalService.findAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get theoretical by ID
export const useTheoretical = (id: string) => {
  return useQuery({
    queryKey: theoreticalKeys.detail(id),
    queryFn: () => theoreticalService.findOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create theoretical mutation
export const useCreateTheoretical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: theoreticalService.create,
    onSuccess: () => {
      // Invalidate and refetch theoreticals list
      queryClient.invalidateQueries({
        queryKey: theoreticalKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error creating theoretical:", error);
    },
  });
};

// Update theoretical mutation
export const useUpdateTheoretical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: TheoreticalDto }) =>
      theoreticalService.update(id, dto),
    onSuccess: (data, variables) => {
      // Update the specific theoretical in cache
      queryClient.setQueryData(theoreticalKeys.detail(variables.id), data);

      // Invalidate the list to refresh it
      queryClient.invalidateQueries({
        queryKey: theoreticalKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error updating theoretical:", error);
    },
  });
};

// Delete theoretical mutation
export const useDeleteTheoretical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: theoreticalService.remove,
    onSuccess: (_, deletedId) => {
      // Remove the theoretical from cache
      queryClient.removeQueries({
        queryKey: theoreticalKeys.detail(deletedId),
      });

      // Invalidate the list to refresh it
      queryClient.invalidateQueries({
        queryKey: theoreticalKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting theoretical:", error);
    },
  });
};
