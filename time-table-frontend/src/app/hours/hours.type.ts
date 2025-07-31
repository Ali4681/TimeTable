import { Day } from "../days/days.type";

export interface Hours {
  _id: string;
  name: string;
  daysId: Day; // Update this line
  value: string;
}

export interface CreateHoursDto {
  daysId: string;
  value: string;
}

export interface UpdateHoursDto {
  daysId?: string;
  value?: string;
}
