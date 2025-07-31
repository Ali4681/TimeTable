// types/practical.types.ts

export interface Practical {
  _id: string;
  theoretical: {
    _id: string;
    categoryCode: string;
    capacity: number;
  };
  CategoryCode: string;
  capacity: number;
  preferredRoom: string;
}

export interface PracticalDto {
  theoretical: string;
  CategoryCode: string;
  capacity: number;
}

export interface ModulePractical {
  id: string;
  practicalId: string;
  moduleId: string;
}

export interface ModulePracticalDto {
  practicalId: string;
  moduleId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
