import { ApiResponse, ApiError, RequestConfig } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

const setRefreshToken = (refreshToken: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("refreshToken", refreshToken);
};

const clearAuthTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const data: ApiResponse<{ token: string; refreshToken: string }> = await response.json();
    
    if (data.status === "success" && data.data) {
      setAuthToken(data.data.token);
      setRefreshToken(data.data.refreshToken);
      return data.data.token;
    }

    return null;
  } catch (error) {
    clearAuthTokens();
    return null;
  }
}

async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, skipRefresh = false, ...fetchConfig } = config;

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchConfig.headers,
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    let response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    if (response.status === 401 && !skipAuth && !skipRefresh) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...fetchConfig,
          headers,
        });
      } else {
        clearAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }
    }

    const data: ApiResponse<T> | ApiError = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.data?.message || "Request failed");
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "DELETE" }),
};

export { clearAuthTokens, setAuthToken, setRefreshToken, getAuthToken };

