import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("retain.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function apiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string") return new Error(msg);
    return new Error(err.message);
  }
  return err instanceof Error ? err : new Error("Request failed");
}
export default api;