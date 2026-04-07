import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "owner" | "station" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, password: string, role: UserRole) => void;
  signup: (name: string, email: string, phone: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pp_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (emailOrPhone: string, _password: string, role: UserRole) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User",
      email: emailOrPhone.includes("@") ? emailOrPhone : "",
      phone: !emailOrPhone.includes("@") ? emailOrPhone : "",
      role,
    };
    setUser(newUser);
    localStorage.setItem("pp_user", JSON.stringify(newUser));
  };

  const signup = (name: string, email: string, phone: string, password: string, role: UserRole) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      role,
    };
    setUser(newUser);
    localStorage.setItem("pp_user", JSON.stringify(newUser));
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
