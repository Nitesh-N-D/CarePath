/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import API from "../services/api";

export type UserRole = "user" | "doctor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN = "carepath_token";
const STORAGE_USER = "carepath_user";

function normalizeUser(user: Partial<AuthUser> | null | undefined): AuthUser | null {
  if (!user?.id || !user?.email || !user?.name) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    createdAt: user.createdAt,
  };
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

function persistSession(payload: AuthResponse) {
  localStorage.setItem(STORAGE_TOKEN, payload.token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(normalizeUser(payload.user)));
}

function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

function applyToken(token: string | null) {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete API.defaults.headers.common.Authorization;
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google SDK.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google SDK."));
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_USER);

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        applyToken(storedToken);
        const response = await API.get<{ user: AuthUser }>("/auth/me");
        setToken(storedToken);
        const normalizedUser = normalizeUser(response.data.user);
        setUser(normalizedUser);
        localStorage.setItem(STORAGE_USER, JSON.stringify(normalizedUser));
      } catch {
        clearSession();
        applyToken(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const refreshUser = async () => {
    if (!token && !localStorage.getItem(STORAGE_TOKEN)) {
      return null;
    }

    const response = await API.get<{ user: AuthUser }>("/auth/me");
    const normalizedUser = normalizeUser(response.data.user);
    setUser(normalizedUser);
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const finishAuth = (payload: AuthResponse) => {
    persistSession(payload);
    applyToken(payload.token);
    setToken(payload.token);
    const normalizedUser = normalizeUser(payload.user);
    setUser(normalizedUser);
    return normalizedUser as AuthUser;
  };

  const login = async (email: string, password: string) => {
    const response = await API.post<AuthResponse>("/auth/login", { email, password });
    return finishAuth(response.data);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await API.post<AuthResponse>("/auth/register", payload);
    return finishAuth(response.data);
  };

  const loginWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google login is not configured.");
    }

    await loadGoogleScript();

    const accessToken = await new Promise<string>((resolve, reject) => {
      const client = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || "Google sign-in failed."));
            return;
          }
          resolve(response.access_token);
        },
      });

      if (!client) {
        reject(new Error("Google sign-in is unavailable."));
        return;
      }

      client.requestAccessToken();
    });

    const response = await API.post<AuthResponse>("/auth/google", { accessToken });
    return finishAuth(response.data);
  };

  const logout = () => {
    clearSession();
    applyToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
