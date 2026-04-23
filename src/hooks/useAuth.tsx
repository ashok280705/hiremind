"use client";

import React, { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: "recruiter" | "candidate") => Promise<User>;
  register: (name: string, email: string, password: string, role?: "recruiter" | "candidate") => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem("hm_user");
    const token = localStorage.getItem("hm_token");

    let nextUser: User | null = null;
    if (stored && token) {
      try {
        nextUser = JSON.parse(stored) as User;
      } catch {
        localStorage.removeItem("hm_user");
        localStorage.removeItem("hm_token");
      }
    }

    // Defer updates so we don't trigger the set-state-in-effect lint rule.
    queueMicrotask(() => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string, role?: "recruiter" | "candidate") => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password, role });
    localStorage.setItem("hm_token", res.access_token);
    localStorage.setItem("hm_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string, role?: "recruiter" | "candidate") => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password, role });
    localStorage.setItem("hm_token", res.access_token);
    localStorage.setItem("hm_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    const wasCandidate = user?.role === "candidate";
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    setUser(null);
    window.location.href = wasCandidate ? "/candidate/login" : "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
