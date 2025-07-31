////file contolles for days

import axios from "axios";
import { Day } from "./days.type";

const API_URL = "http://localhost:8000/days"; // Adjust to your API URL

// GET - useQuery
export const fetchDays = async (): Promise<Day[]> => {
  const response = await axios.get(API_URL);
  console.log("day id", response.data);

  return response.data;
};

// POST - useMutation
export const createDay = async (day: string): Promise<Day> => {
  const response = await axios.post(API_URL, { name: day });
  return response.data;
};

// PATCH - useMutation
export const updateDay = async (data: Day): Promise<Day> => {
  const response = await axios.patch(`${API_URL}/${data._id}`, data);
  return response.data;
};

// DELETE - useMutation
export const deleteDay = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
