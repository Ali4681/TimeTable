// services/practical.service.ts

import axios from "axios";
import {
  PracticalDto,
  Practical,
  ModulePracticalDto,
  ModulePractical,
} from "./practical.type";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/practical`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const practicalService = {
  // Practical CRUD operations
  async createPractical(data: PracticalDto): Promise<Practical> {
    const response = await api.post<Practical>("/", data);
    return response.data;
  },

  async getAllPracticals(): Promise<Practical[]> {
    const response = await api.get<Practical[]>("/");
    return response.data;
  },

  async getPracticalById(id: string): Promise<Practical> {
    const response = await api.get<Practical>(`/${id}`);
    return response.data;
  },

  async updatePractical(id: string, data: PracticalDto): Promise<Practical> {
    const response = await api.patch<Practical>(`/${id}`, data);
    return response.data;
  },

  async deletePractical(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },

  // ModulePractical operations
  async createModulePractical(
    data: ModulePracticalDto
  ): Promise<ModulePractical> {
    const response = await api.post<ModulePractical>("/createPraModule", data);
    return response.data;
  },

  async getAllModulePracticals(): Promise<ModulePractical[]> {
    const response = await api.get<ModulePractical[]>("/allPraModule");
    return response.data;
  },

  async deleteModulePractical(id: string): Promise<void> {
    await api.delete(`/${id}/PraModule`);
  },

  async getModulePracticalsByPracticalId(
    practicalId: string
  ): Promise<ModulePractical[]> {
    const response = await api.get<ModulePractical[]>(
      `/${practicalId}/PraModule`
    );
    return response.data;
  },

  async getModulePracticalsByModuleId(
    moduleId: string
  ): Promise<ModulePractical[]> {
    const response = await api.get<ModulePractical[]>(`/${moduleId}/PraModule`);
    return response.data;
  },

  async getModulePracticalsByBothIds(
    practicalId: string,
    moduleId: string
  ): Promise<ModulePractical[]> {
    const response = await api.get<ModulePractical[]>(
      `/${practicalId}/${moduleId}/PraModule`
    );
    return response.data;
  },
};
