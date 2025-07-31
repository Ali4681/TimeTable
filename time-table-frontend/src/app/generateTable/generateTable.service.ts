// services/roomService.ts
import axios from "axios";
import { TimetableScheduleResponse } from "./generateTable.type";

const API_BASE_URL = "http://localhost:8000";

export const fetchInfoGenerate =
  async (): Promise<TimetableScheduleResponse> => {
    const response = await axios.get<TimetableScheduleResponse>(
      `${API_BASE_URL}/room/infogenerate`
    );
    return response.data;
  };

export const generateTimetableSchedule = async (
  requestData: any
): Promise<TimetableScheduleResponse> => {
  const response = await axios.post<TimetableScheduleResponse>(
    `${API_BASE_URL}/csp-schedule`,
    requestData,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 600000, // 10 minutes timeout for solver
    }
  );
  return response.data;
};
