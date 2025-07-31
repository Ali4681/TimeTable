import { apiClient } from "@/lib/utils";
import { CreateHoursDto, Hours, UpdateHoursDto } from "./hours.type";

export const HoursService = {
  async create(createHoursDto: CreateHoursDto): Promise<Hours> {
    const response = await apiClient.post(`/hours`, createHoursDto);

    if (!response) {
      throw new Error("Failed to create hours");
    }

    return response.data;
  },

  async findAll(): Promise<Hours[]> {
    const response = await apiClient.get(`/hours`);

    if (!response) {
      throw new Error("Failed to fetch hours");
    }

    console.log("hours : ", response.data);

    return response.data;
  },

  async update(id: string, updateHoursDto: UpdateHoursDto): Promise<Hours> {
    const response = await apiClient.patch(`/hours/${id}`, updateHoursDto);

    if (!response) {
      throw new Error("Failed to update hours");
    }

    return response.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete(`/hours/${id}`);

    if (!response) {
      throw new Error("Failed to delete hours");
    }
  },
};
