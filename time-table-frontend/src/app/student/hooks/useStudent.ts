import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { studentApi, studentKeys } from "../student.service";
import { StudentDto, RegisterModuleDto, Student } from "../student.type";

/**
 * Hook to fetch all students
 */
export const useStudents = () => {
  return useQuery({
    queryKey: studentKeys.lists(),
    queryFn: studentApi.getAll,
  });
};

/**
 * Hook to fetch a single student by ID
 */
export const useStudent = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentApi.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to fetch student's registered modules
 */
export const useStudentModules = (
  studentId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: studentKeys.modules(studentId),
    queryFn: () => studentApi.getModules(studentId),
    enabled: enabled && !!studentId,
  });
};

/**
 * Hook to create a new student
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.create,
    onSuccess: (newStudent) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });

      // Optionally add the new student to the cache
      queryClient.setQueryData(studentKeys.detail(newStudent._id), newStudent);
    },
    onError: (error) => {
      console.error("Error creating student:", error);
    },
  });
};

/**
 * Hook to update a student
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentDto }) =>
      studentApi.update(id, data),
    onSuccess: (updatedStudent, { id }) => {
      // Update the student in cache
      queryClient.setQueryData(studentKeys.detail(id), updatedStudent);

      // Invalidate students list to ensure consistency
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error) => {
      console.error("Error updating student:", error);
    },
  });
};

/**
 * Hook to delete a student
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: studentKeys.detail(deletedId) });

      // Invalidate students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
    },
  });
};

/**
 * Hook to register student to a module
 */
export const useRegisterToModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: RegisterModuleDto;
    }) => studentApi.registerToModule(studentId, data),
    onSuccess: (_, { studentId }) => {
      // Invalidate student's modules to refetch updated list
      queryClient.invalidateQueries({
        queryKey: studentKeys.modules(studentId),
      });
    },
    onError: (error) => {
      console.error("Error registering to module:", error);
    },
  });
};

/**
 * Hook to unregister student from a module
 */
export const useUnregisterFromModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      moduleId,
    }: {
      studentId: string;
      moduleId: string;
    }) => studentApi.unregisterFromModule(studentId, moduleId),
    onSuccess: (_, { studentId }) => {
      // Invalidate student's modules to refetch updated list
      queryClient.invalidateQueries({
        queryKey: studentKeys.modules(studentId),
      });
    },
    onError: (error) => {
      console.error("Error unregistering from module:", error);
    },
  });
};

// Utility hook for optimistic updates
export const useOptimisticStudentUpdate = () => {
  const queryClient = useQueryClient();

  const updateStudentOptimistically = (
    id: string,
    updatedData: Partial<Student>
  ) => {
    queryClient.setQueryData<Student>(studentKeys.detail(id), (oldData) =>
      oldData ? { ...oldData, ...updatedData } : undefined
    );
  };

  return { updateStudentOptimistically };
};

// Example usage hook that combines multiple operations
export const useStudentOperations = (studentId?: string) => {
  const studentsQuery = useStudents();
  const studentQuery = useStudent(studentId || "", !!studentId);
  const studentModulesQuery = useStudentModules(studentId || "", !!studentId);

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const registerMutation = useRegisterToModule();
  const unregisterMutation = useUnregisterFromModule();

  return {
    // Queries
    students: studentsQuery.data,
    student: studentQuery.data,
    studentModules: studentModulesQuery.data,

    // Loading states
    isLoadingStudents: studentsQuery.isLoading,
    isLoadingStudent: studentQuery.isLoading,
    isLoadingModules: studentModulesQuery.isLoading,

    // Error states
    studentsError: studentsQuery.error,
    studentError: studentQuery.error,
    modulesError: studentModulesQuery.error,

    // Mutations
    createStudent: createMutation.mutateAsync,
    updateStudent: updateMutation.mutateAsync,
    deleteStudent: deleteMutation.mutateAsync,
    registerToModule: registerMutation.mutateAsync,
    unregisterFromModule: unregisterMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUnregistering: unregisterMutation.isPending,
  };
};
