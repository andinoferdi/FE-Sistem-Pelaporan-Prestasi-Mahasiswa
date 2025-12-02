export type ApiStatus = "success" | "error";

export interface ApiResponse<T = any> {
  status: ApiStatus;
  data?: T;
  message?: string;
}

export interface ApiError {
  status: "error";
  data: {
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

