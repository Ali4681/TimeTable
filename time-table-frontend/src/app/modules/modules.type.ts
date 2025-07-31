// types/module.types.ts
export interface Module {
  _id: string;
  name: string;
  code: string;
  hours: number;
  years: number;
  doctorsId: { _id: string; name: string };
  teacherId: { _id: string; name: string };
  erolledStudents: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LinkToRoom {
  sessionTimeId: string[];
  id: string;
  moduleId: string;
  roomId: string;
}

export interface LinkToRoomDto {
  moduleId: string;
  roomId: string;
}

export interface ModuleDto {
  name: string;
  years: number;
  code: string;
  hours: number;
  doctors: string;
  teacher: string;
  erolledStudents: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  // Add other student properties as needed
}

export interface ModuleWithInfo extends Module {
  doctorInfo?: { _id: string; name: string };
  teacherInfo?: { _id: string; name: string };
}

export interface ModuleWithPractica extends Module {
  practica?: any[];
}
