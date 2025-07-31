// services/moduleService.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  LinkToRoom,
  LinkToRoomDto,
  Module,
  ModuleDto,
  ModuleWithInfo,
  ModuleWithPractica,
  Student,
} from "./modules.type";

const API_BASE_URL = "http://localhost:8000/modules";

class ModuleService {
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios({
        baseURL: API_BASE_URL,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        ...config,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          `HTTP error! status: ${error.response?.status}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Module CRUD operations
  async getAllModules() {
    return this.request<Module[]>({ url: "/" });
  }

  async getModuleById(id: string): Promise<Module> {
    return this.request<Module>({ url: `/${id}/module` });
  }
  async getModuleByCode(code: string): Promise<Module> {
    return this.request<Module>({ url: `/${code}/modulebycode` });
  }

  async getModuleWithInfo(id: string): Promise<ModuleWithInfo> {
    return this.request<ModuleWithInfo>({ url: `/${id}/withInfo` });
  }

  async getModuleWithPractica(id: string): Promise<ModuleWithPractica> {
    return this.request<ModuleWithPractica>({ url: `/${id}/all` });
  }

  async createModule(data: ModuleDto): Promise<Module> {
    return this.request<Module>({
      url: "/",
      method: "POST",
      data,
    });
  }

  async updateModule(id: string, data: Partial<ModuleDto>): Promise<Module> {
    return this.request<Module>({
      url: `/${id}/update`,
      method: "PATCH",
      data,
    });
  }

  async deleteModule(id: string): Promise<void> {
    await this.request<void>({
      url: `/${id}/delete`,
      method: "DELETE",
    });
  }

  // Student operations
  async getStudentsByModule(moduleId: string): Promise<Student[]> {
    return this.request<Student[]>({ url: `/${moduleId}/students` });
  }

  // Room linking operations
  async selectRoom(dto: LinkToRoomDto): Promise<LinkToRoom> {
    return this.request<LinkToRoom>({
      url: "/selectRoom",
      method: "POST",
      data: dto,
    });
  }

  async getAllRoomLinks(): Promise<LinkToRoom[]> {
    return this.request<LinkToRoom[]>({ url: "/getroom" });
  }

  async getRoomLink(id: string): Promise<LinkToRoom> {
    return this.request<LinkToRoom>({ url: `/${id}/link` });
  }

  async updateRoomLink(
    id: string,
    updateDto: LinkToRoomDto
  ): Promise<LinkToRoom> {
    return this.request<LinkToRoom>({
      url: `/${id}/updatelink`,
      method: "PATCH",
      data: updateDto,
    });
  }

  async deleteRoomLink(id: string): Promise<LinkToRoom> {
    return this.request<LinkToRoom>({
      url: `/${id}/deletelink`,
      method: "DELETE",
    });
  }
}

export const moduleService = new ModuleService();
