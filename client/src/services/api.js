import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const humanizeText = async (payload) => {
  const { data } = await api.post("/humanize", payload);
  return data;
};

export const saveConversion = async (payload) => {
  const { data } = await api.post("/save", payload);
  return data;
};

export const fetchHistory = async () => {
  const { data } = await api.get("/history");
  return data;
};

export default api;
