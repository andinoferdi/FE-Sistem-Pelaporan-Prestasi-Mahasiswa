import { ApiResponse } from "./common";
import { LoginUserResponse } from "./user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  refreshToken: string;
  user: LoginUserResponse;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  token: string;
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

export interface GetProfileResponseData {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
}

export type GetProfileResponse = ApiResponse<GetProfileResponseData>;

export interface HealthCheckResponseData {
  instanceId: string;
}

export type HealthCheckResponse = ApiResponse<HealthCheckResponseData>;

