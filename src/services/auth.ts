import { api, setAuthToken, setRefreshToken, clearAuthTokens } from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetProfileResponse,
} from "@/types/auth";
import { LoginUserResponse } from "@/types/user";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse["data"]>(
      "/api/v1/auth/login",
      credentials,
      { skipAuth: true }
    );

    if (response.status === "success" && response.data) {
      setAuthToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return response as LoginResponse;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthTokens();
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response = await api.post<RefreshTokenResponse["data"]>(
      "/api/v1/auth/refresh",
      request,
      { skipAuth: true, skipRefresh: true }
    );

    if (response.status === "success" && response.data) {
      setAuthToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
    }

    return response as RefreshTokenResponse;
  },

  async getProfile(): Promise<GetProfileResponse> {
    const response = await api.get<GetProfileResponse["data"]>(
      "/api/v1/auth/profile"
    );
    return response as GetProfileResponse;
  },

  getStoredUser(): LoginUserResponse | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as LoginUserResponse;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },
};

