// hooks/usePractical.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practicalService } from "../practical.service";
import { PracticalDto, ModulePracticalDto } from "../practical.type";

// Query Keys
export const PRACTICAL_QUERY_KEYS = {
  practicals: ["practicals"] as const,
  practical: (id: string) => ["practical", id] as const,
  modulePracticals: ["modulePracticals"] as const,
  modulePracticalsByPractical: (practicalId: string) =>
    ["modulePracticals", "practical", practicalId] as const,
  modulePracticalsByModule: (moduleId: string) =>
    ["modulePracticals", "module", moduleId] as const,
  modulePracticalsByBoth: (practicalId: string, moduleId: string) =>
    ["modulePracticals", "both", practicalId, moduleId] as const,
};

// Practical Hooks
export const usePracticals = () => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.practicals,
    queryFn: practicalService.getAllPracticals,
  });
};

export const usePractical = (id: string) => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.practical(id),
    queryFn: () => practicalService.getPracticalById(id),
    enabled: !!id,
  });
};

export const useCreatePractical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PracticalDto) => practicalService.createPractical(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.practicals,
      });
    },
  });
};

export const useUpdatePractical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PracticalDto }) =>
      practicalService.updatePractical(id, data),
    onSuccess: (updatedPractical, { id }) => {
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.practicals,
      });
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.practical(id),
      });
    },
  });
};

export const useDeletePractical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => practicalService.deletePractical(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.practicals,
      });
    },
  });
};

// ModulePractical Hooks
export const useModulePracticals = () => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.modulePracticals,
    queryFn: practicalService.getAllModulePracticals,
  });
};

export const useModulePracticalsByPracticalId = (practicalId: string) => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.modulePracticalsByPractical(practicalId),
    queryFn: () =>
      practicalService.getModulePracticalsByPracticalId(practicalId),
    enabled: !!practicalId,
  });
};

export const useModulePracticalsByModuleId = (moduleId: string) => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.modulePracticalsByModule(moduleId),
    queryFn: () => practicalService.getModulePracticalsByModuleId(moduleId),
    enabled: !!moduleId,
  });
};

export const useModulePracticalsByBothIds = (
  practicalId: string,
  moduleId: string
) => {
  return useQuery({
    queryKey: PRACTICAL_QUERY_KEYS.modulePracticalsByBoth(
      practicalId,
      moduleId
    ),
    queryFn: () =>
      practicalService.getModulePracticalsByBothIds(practicalId, moduleId),
    enabled: !!practicalId && !!moduleId,
  });
};

export const useCreateModulePractical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModulePracticalDto) =>
      practicalService.createModulePractical(data),
    onSuccess: (newModulePractical) => {
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.modulePracticals,
      });
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.modulePracticalsByPractical(
          newModulePractical.practicalId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.modulePracticalsByModule(
          newModulePractical.moduleId
        ),
      });
    },
  });
};

export const useDeleteModulePractical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => practicalService.deleteModulePractical(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRACTICAL_QUERY_KEYS.modulePracticals,
      });
      // Invalidate all related queries since we don't have the specific IDs after deletion
      queryClient.invalidateQueries({ queryKey: ["modulePracticals"] });
    },
  });
};
