import axios from "axios";

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const fallbackBaseUrl = normalizeApiBaseUrl(
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://carepath-xnsd.onrender.com/api"
    : "http://localhost:5000/api"
);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
    : fallbackBaseUrl,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("carepath_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      localStorage.removeItem("carepath_token");
      localStorage.removeItem("carepath_user");
      if (!["/login", "/register", "/forgot-password", "/reset-password"].includes(currentPath)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
