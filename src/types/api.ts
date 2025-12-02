import { ApiResponse, ApiError } from "./common";

export type { ApiResponse, ApiError };

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

