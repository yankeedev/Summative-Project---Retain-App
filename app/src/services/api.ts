import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("retain.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Session expiry: AuthContext registers a callback that clears the stored
// session and sends the user back to /signin when the API answers 401.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // failed sign-in/sign-up attempts are not a session problem
      if (!url.includes("/auth/signin") && !url.includes("/auth/signup")) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export function apiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string") return new Error(msg);
    return new Error(err.message);
  }
  return err instanceof Error ? err : new Error("Request failed");
}
export default api;