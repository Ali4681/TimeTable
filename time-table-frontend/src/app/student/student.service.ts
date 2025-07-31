import axios from "axios";
import {
  RegisterModuleDto,
  Student,
  StudentDto,
  StudentModule,
} from "./student.type";

// API Base URL - adjust according to your setup
const API_BASE_URL = "http://localhost:8000/students";

// API Service Functions
export const studentApi = {
  // Get all students
  getAll: (): Promise<Student[]> =>
    axios.get(`${API_BASE_URL}`).then((res) => res.data),

  // Get student by ID
  getById: (id: string): Promise<Student> =>
    axios.get(`${API_BASE_URL}/${id}`).then((res) => res.data),

  // Create new student
  create: (data: StudentDto): Promise<Student> =>
    axios.post(`${API_BASE_URL}`, data).then((res) => res.data),

  // Update student
  update: (id: string, data: StudentDto): Promise<Student> =>
    axios.post(`${API_BASE_URL}/${id}`, data).then((res) => res.data),

  // Delete student
  delete: (id: string): Promise<void> =>
    axios.delete(`${API_BASE_URL}/${id}`).then((res) => res.data),

  // Register student to module
  registerToModule: (
    studentId: string,
    data: RegisterModuleDto
  ): Promise<StudentModule> =>
    axios
      .post(`${API_BASE_URL}/${studentId}/register`, data)
      .then((res) => res.data),

  // Get student's modules
  getModules: (studentId: string): Promise<StudentModule[]> =>
    axios.get(`${API_BASE_URL}/${studentId}/modules`).then((res) => res.data),

  // Unregister from module
  unregisterFromModule: (studentId: string, moduleId: string): Promise<void> =>
    axios
      .delete(`${API_BASE_URL}/${studentId}/unregister/${moduleId}`)
      .then((res) => res.data),
};

// Query Keys
export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (filters: string) => [...studentKeys.lists(), { filters }] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  modules: (studentId: string) =>
    [...studentKeys.detail(studentId), "modules"] as const,
};
