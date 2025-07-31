import axios from "axios";
import { Theoretical, TheoreticalDto } from "./theoretical.type";

const API_BASE_URL = "http://localhost:8000";

const theoreticalApi = axios.create({
  baseURL: `${API_BASE_URL}/theoretical`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const theoreticalService = {
  // Create a new theoretical
  create: async (dto: TheoreticalDto): Promise<Theoretical> => {
    const response = await theoreticalApi.post("/", dto);
    return response.data;
  },

  // Get all theoreticals
  findAll: async (): Promise<Theoretical[]> => {
    const response = await theoreticalApi.get("/");
    return response.data;
  },

  // Get theoretical by ID
  findOne: async (id: string): Promise<Theoretical> => {
    const response = await theoreticalApi.get(`/${id}`);
    return response.data;
  },

  // Update theoretical
  update: async (id: string, dto: TheoreticalDto): Promise<Theoretical> => {
    const response = await theoreticalApi.patch(`/${id}`, dto);
    return response.data;
  },

  // Delete theoretical
  remove: async (id: string): Promise<void> => {
    await theoreticalApi.delete(`/${id}`);
  },
};
