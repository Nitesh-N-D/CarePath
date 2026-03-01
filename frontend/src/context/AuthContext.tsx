import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import API from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string; // future role-based support
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ---------------------------------------
  // Restore user from localStorage on load
  // ---------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("carepath_user");
    const storedToken = localStorage.getItem("carepath_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // ---------------------------------------
  // Login
  // ---------------------------------------
  const login = async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });

    const { token, user } = res.data;

    localStorage.setItem("carepath_token", token);
    localStorage.setItem("carepath_user", JSON.stringify(user));

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(user);
  };

  // ---------------------------------------
  // Register
  // ---------------------------------------
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    await API.post("/auth/register", { name, email, password });
    await login(email, password);
  };

  // ---------------------------------------
  // Logout
  // ---------------------------------------
  const logout = () => {
    localStorage.removeItem("carepath_token");
    localStorage.removeItem("carepath_user");

    delete API.defaults.headers.common["Authorization"];

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
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