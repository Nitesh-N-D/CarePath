import axios from "axios";

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function resolveFallbackBaseUrl() {
  if (typeof window === "undefined") {
    return normalizeApiBaseUrl("http://localhost:5000/api");
  }

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1";

  if (isLocalHost || import.meta.env.DEV) {
    return normalizeApiBaseUrl("http://localhost:5000/api");
  }

  return normalizeApiBaseUrl("https://carepath-xnsd.onrender.com/api");
}

const fallbackBaseUrl = resolveFallbackBaseUrl();

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
