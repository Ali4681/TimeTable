import axios from "axios";
import { DocTeach, DoctorWithHours } from "./docTeach.type";

const API_URL = "http://localhost:8000/doc-teach";

export const docTeachService = {
  getAll: async (): Promise<DoctorWithHours[]> => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  getById: async (id: string): Promise<DocTeach> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (data: DocTeach): Promise<DocTeach> => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  update: async (id: string, data: DocTeach): Promise<DocTeach> => {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<{ message: string }> => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
