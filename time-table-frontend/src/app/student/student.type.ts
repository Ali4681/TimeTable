// A minimal Module interface based on the response
export interface Module {
  _id: string;
  name: string;
  years: number[];
  code: string;
  hours: number;
  doctorsId: string;
  teacherId: string;
  __v: number;
}

// Represents a student's registration to a module (excluding student field)
export interface StudentModule {
  _id: string;
  module: Module;
  Practical: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Updated to match grouped structure (with populated modules)
export interface Student {
  _id: string;
  name: string;
  years: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  modules: StudentModule[]; // Fully populated module list
}

// For creation forms
export interface StudentDto {
  name: string;
  years: string;
  phoneNumber: string;
  modules: string[];
}

// Used when registering a student for a module
export interface RegisterModuleDto {
  moduleId: string;
  practicalId: string;
}
