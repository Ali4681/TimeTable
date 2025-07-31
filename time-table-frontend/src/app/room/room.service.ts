// services/room.service.ts
import axios from "axios";
import { IRoomCreate, IRoom, IRoomUpdate, ILinkToRoom } from "./room.type";

const API_BASE_URL = "http://localhost:8000";

export const createRoom = async (roomData: IRoomCreate): Promise<IRoom> => {
  const response = await axios.post(`${API_BASE_URL}/room`, roomData);
  return response.data;
};

export const getAllRooms = async (): Promise<IRoom[]> => {
  const response = await axios.get(`${API_BASE_URL}/room`);
  return response.data;
};

// ✅ New endpoint for infogenerate
export const getRoomInfoGenerate = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/room/infogenerate`);
  return response.data;
};

export const getRoomById = async (id: string): Promise<IRoom> => {
  const response = await axios.get(`${API_BASE_URL}/room/${id}`);
  return response.data;
};



export const updateRoom = async (
  id: string,
  roomData: IRoomUpdate
): Promise<IRoom> => {
  const response = await axios.patch(`${API_BASE_URL}/room/${id}`, roomData);
  return response.data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/room/${id}`);
};

export const linkToRoom = async (linkData: ILinkToRoom): Promise<void> => {
  await axios.post(`${API_BASE_URL}/room/link`, linkData);
};
