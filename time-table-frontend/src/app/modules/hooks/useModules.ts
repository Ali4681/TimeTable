// hooks/useModules.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  LinkToRoom,
  LinkToRoomDto,
  Module,
  ModuleDto,
  ModuleWithInfo,
  ModuleWithPractica,
  Student,
} from "../modules.type";
import { moduleService } from "../module.service";

// Create a query client instance
export const queryClient = new QueryClient();

// Hook for managing all modules
export const useModules = () => {
  const queryClient = useQueryClient();

  // Fetch all modules
  const {
    data: modules = [],
    isLoading,
    error,
    refetch: fetchModules,
  } = useQuery<Module[], Error>({
    queryKey: ["modules"],
    queryFn: () => moduleService.getAllModules(),
  });

  // Create module mutation
  const createModuleMutation = useMutation<Module, Error, ModuleDto>({
    mutationFn: (moduleData) => moduleService.createModule(moduleData),
    onSuccess: (newModule) => {
      queryClient.setQueryData<Module[]>(["modules"], (prev = []) => [
        ...prev,
        newModule,
      ]);
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation<
    Module,
    Error,
    { id: string; moduleData: Partial<ModuleDto> }
  >({
    mutationFn: ({ id, moduleData }) =>
      moduleService.updateModule(id, moduleData),
    onSuccess: (updatedModule) => {
      queryClient.setQueryData<Module[]>(["modules"], (prev = []) =>
        prev.map((module) =>
          module._id === updatedModule._id ? updatedModule : module
        )
      );
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation<void, Error, string>({
    mutationFn: (id) => moduleService.deleteModule(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Module[]>(["modules"], (prev = []) =>
        prev.filter((module) => module._id !== id)
      );
    },
  });

  return {
    modules,
    loading: isLoading,
    error: error?.message,
    fetchModules,
    createModule: createModuleMutation.mutateAsync,
    updateModule: updateModuleMutation.mutateAsync,
    deleteModule: deleteModuleMutation.mutateAsync,
  };
};

// Hook for managing a single module
export const useModule = (id: string | null) => {
  // Fetch basic module data
  const {
    data: module,
    isLoading: moduleLoading,
    error: moduleError,
    refetch: fetchModule,
  } = useQuery<Module | null, Error>({
    queryKey: ["module", id],
    queryFn: () => (id ? moduleService.getModuleById(id) : null),
    enabled: !!id,
  });
 

  // Fetch module with info
  const {
    data: moduleWithInfo,
    isLoading: infoLoading,
    error: infoError,
    refetch: fetchModuleWithInfo,
  } = useQuery<ModuleWithInfo | null, Error>({
    queryKey: ["moduleWithInfo", id],
    queryFn: () => (id ? moduleService.getModuleWithInfo(id) : null),
    enabled: !!id,
  });

  // Fetch module with practica
  const {
    data: moduleWithPractica,
    isLoading: practicaLoading,
    error: practicaError,
    refetch: fetchModuleWithPractica,
  } = useQuery<ModuleWithPractica | null, Error>({
    queryKey: ["moduleWithPractica", id],
    queryFn: () => (id ? moduleService.getModuleWithPractica(id) : null),
    enabled: !!id,
  });

  return {
    module,
    moduleWithInfo,
    moduleWithPractica,
    loading: moduleLoading || infoLoading || practicaLoading,
    error: moduleError?.message || infoError?.message || practicaError?.message,
    fetchModule,
    fetchModuleWithInfo,
    fetchModuleWithPractica,
  };
};

// Hook for managing module students
export const useModuleStudents = (moduleId: string | null) => {
  const {
    data: students = [],
    isLoading,
    error,
    refetch: fetchStudents,
  } = useQuery<Student[], Error>({
    queryKey: ["moduleStudents", moduleId],
    queryFn: () =>
      moduleId ? moduleService.getStudentsByModule(moduleId) : [],
    enabled: !!moduleId,
  });

  return {
    students,
    loading: isLoading,
    error: error?.message,
    fetchStudents,
  };
};

// Hook for managing room links
export const useRoomLinks = () => {
  const queryClient = useQueryClient();

  // Fetch all room links
  const {
    data: roomLinks = [],
    isLoading,
    error,
    refetch: fetchRoomLinks,
  } = useQuery<LinkToRoom[], Error>({
    queryKey: ["roomLinks"],
    queryFn: () => moduleService.getAllRoomLinks(),
  });

  // Select room mutation
  const selectRoomMutation = useMutation<LinkToRoom, Error, LinkToRoomDto>({
    mutationFn: (dto) => moduleService.selectRoom(dto),
    onSuccess: (newLink) => {
      queryClient.setQueryData<LinkToRoom[]>(["roomLinks"], (prev = []) => [
        ...prev,
        newLink,
      ]);
    },
  });

  // Update room link mutation
  const updateRoomLinkMutation = useMutation<
    LinkToRoom,
    Error,
    { id: string; dto: LinkToRoomDto }
  >({
    mutationFn: ({ id, dto }) => moduleService.updateRoomLink(id, dto),
    onSuccess: (updatedLink) => {
      queryClient.setQueryData<LinkToRoom[]>(["roomLinks"], (prev = []) =>
        prev.map((link) => (link.id === updatedLink.id ? updatedLink : link))
      );
    },
  });

  // Delete room link mutation
  const deleteRoomLinkMutation = useMutation<LinkToRoom, Error, string>({
    mutationFn: (id) => moduleService.deleteRoomLink(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<LinkToRoom[]>(["roomLinks"], (prev = []) =>
        prev.filter((link) => link.id !== id)
      );
    },
  });

  return {
    roomLinks,
    loading: isLoading,
    error: error?.message,
    fetchRoomLinks,
    selectRoom: selectRoomMutation.mutateAsync,
    updateRoomLink: updateRoomLinkMutation.mutateAsync,
    deleteRoomLink: deleteRoomLinkMutation.mutateAsync,
  };
};

// Hook for managing single room link
export const useRoomLink = (id: string | null) => {
  const {
    data: roomLink,
    isLoading,
    error,
    refetch: fetchRoomLink,
  } = useQuery<LinkToRoom | null, Error>({
    queryKey: ["roomLink", id],
    queryFn: () => (id ? moduleService.getRoomLink(id) : null),
    enabled: !!id,
  });

  return {
    roomLink,
    loading: isLoading,
    error: error?.message,
    fetchRoomLink,
  };
};
