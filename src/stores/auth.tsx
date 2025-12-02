"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth";
import { LoginUserResponse } from "@/types/user";
import { LoginRequest } from "@/types/auth";

interface AuthContextType {
  user: LoginUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      if (response.status === "success" && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      if (response.status === "success" && response.data) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

