"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

export type UserRole =
  | "admin"
  | "gerencia"
  | "asociado"
  | "cliente"
  | "operador";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  login: (user: AuthUser, session: AuthSession) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  const login = useCallback((u: AuthUser, s: AuthSession) => {
    setUser(u);
    setSession(s);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;

    setUser(null);
    setSession(null);

    if (!refreshToken) return;

    try {
      await fetch(`${API_BASE_URL}/Auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // La sesión local ya fue cerrada aunque falle la comunicación.
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
