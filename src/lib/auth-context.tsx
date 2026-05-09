import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "./api";

export type UserRole = "evowner" | "owner" | "station" | "admin";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pp_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    // Optionally fetch /api/auth/me to verify token on load
  }, []);

  const login = async (emailOrPhone: string, password: string, role: UserRole) => {
    try {
      const response = await api.post("/auth/login", { emailOrPhone, password, role });
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem("pp_user", JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, role: UserRole) => {
    try {
      const response = await api.post("/auth/register", { name, email, phone, password, role });
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem("pp_user", JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pp_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
