export interface DocTeach {
  _id?: string;
  name: string;
  hourIds: string[];
  isDoctor?: boolean;
}

// types.ts
export interface Hour {
  _id: string;
  daysId: {
    _id: string;
    name: string;
  };
  value: string;
}

export interface Doctor {
  _id: string;
  name: string;
  isDoctor: boolean;
}

export interface DoctorWithHours {
  doctor: Doctor;
  hours: Hour[];
  teacher: Doctor;
}
